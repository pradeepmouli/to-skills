import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Application, Converter, Renderer, type Context, ParameterType } from "typedoc";
import type { ExtractedSkill, RenderedSkill } from "@to-skills/core";
import { renderSkills, writeSkills, renderLlmsTxt } from "@to-skills/core";
import { extractSkills } from "./extractor.js";

export function load(app: Application): void {
  // --- Options ---

  app.options.addDeclaration({
    name: "skillsOutDir",
    help: "[Skills] Output directory for generated skill files",
    type: ParameterType.String,
    defaultValue: "skills",
  });

  app.options.addDeclaration({
    name: "skillsPerPackage",
    help: "[Skills] Emit one skill per package in a monorepo",
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.options.addDeclaration({
    name: "skillsIncludeExamples",
    help: "[Skills] Include usage examples from @example tags",
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.options.addDeclaration({
    name: "skillsIncludeSignatures",
    help: "[Skills] Include type signatures in skill output",
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.options.addDeclaration({
    name: "skillsMaxTokens",
    help: "[Skills] Maximum approximate token budget per skill file",
    type: ParameterType.Number,
    defaultValue: 4000,
  });

  app.options.addDeclaration({
    name: "skillsNamePrefix",
    help: "[Skills] Custom skill name prefix (default: package name)",
    type: ParameterType.String,
    defaultValue: "",
  });

  app.options.addDeclaration({
    name: "skillsLicense",
    help: "[Skills] License for generated skills (default: read from package.json)",
    type: ParameterType.String,
    defaultValue: "",
  });

  app.options.addDeclaration({
    name: "llmsTxt",
    help: "[Skills] Generate llms.txt and llms-full.txt alongside skills",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    name: "llmsTxtOutDir",
    help: "[Skills] Output directory for llms.txt files (default: repo root)",
    type: ParameterType.String,
    defaultValue: ".",
  });

  // --- Accumulator for entryPointStrategy: "packages" ---
  // TypeDoc runs the converter once per package. We accumulate extracted
  // skills and write them all after rendering completes.

  const accumulatedSkills: ExtractedSkill[] = [];
  const pkg = readPackageJson();

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    const project = context.project;
    const perPackage = app.options.getValue("skillsPerPackage") as boolean;

    const skills = extractSkills(project, perPackage, {
      name: pkg.name,
      keywords: pkg.keywords,
      repository: normalizeRepoUrl(pkg.repository),
      author: typeof pkg.author === "string" ? pkg.author : pkg.author?.name,
    });

    accumulatedSkills.push(...skills);
  });

  // Write all skills once after rendering is complete
  app.renderer.postRenderAsyncJobs.push(async () => {
    if (accumulatedSkills.length === 0) return;

    const outDir = app.options.getValue("skillsOutDir") as string;
    const license =
      (app.options.getValue("skillsLicense") as string) || pkg.license || "";

    // Deduplicate by name (last wins if same name appears twice)
    const deduped = deduplicateSkills(accumulatedSkills);

    const rendered = renderSkills(deduped, {
      outDir,
      includeExamples: app.options.getValue("skillsIncludeExamples") as boolean,
      includeSignatures: app.options.getValue("skillsIncludeSignatures") as boolean,
      maxTokens: app.options.getValue("skillsMaxTokens") as number,
      namePrefix: app.options.getValue("skillsNamePrefix") as string,
      license,
    });

    writeSkills(rendered, { outDir });

    for (const skill of rendered) {
      const st = skill.skill.tokens ? ` (~${skill.skill.tokens} tokens)` : "";
      app.logger.info(`[skills] ${skill.skill.filename}${st}`);
      for (const ref of skill.references) {
        const rt = ref.tokens ? ` (~${ref.tokens} tokens)` : "";
        app.logger.info(`[skills]   └─ ${ref.filename}${rt}`);
      }
    }
    const totalFiles = rendered.reduce((n, s) => n + 1 + s.references.length, 0);
    app.logger.info(
      `[skills] Generated ${rendered.length} skill(s), ${totalFiles} file(s) in ${outDir}/`,
    );

    // Generate llms.txt (if enabled)
    const llmsEnabled = app.options.getValue("llmsTxt") as boolean;
    if (llmsEnabled) {
      const llmsOutDir = app.options.getValue("llmsTxtOutDir") as string;
      const result = renderLlmsTxt(deduped, {
        projectName: pkg.name || "project",
        projectDescription: pkg.description || "",
      });

      mkdirSync(llmsOutDir, { recursive: true });

      const summaryPath = join(llmsOutDir, "llms.txt");
      writeFileSync(summaryPath, result.summary, "utf-8");
      app.logger.info(`[llms-txt] ${summaryPath} (~${result.summaryTokens} tokens)`);

      const fullPath = join(llmsOutDir, "llms-full.txt");
      writeFileSync(fullPath, result.full, "utf-8");
      app.logger.info(`[llms-txt] ${fullPath} (~${result.fullTokens} tokens)`);
    }
  });
}

/** Deduplicate skills by name — merge skills with the same resolved name */
function deduplicateSkills(skills: ExtractedSkill[]): ExtractedSkill[] {
  const byName = new Map<string, ExtractedSkill>();

  for (const skill of skills) {
    const existing = byName.get(skill.name);
    if (existing) {
      // Merge into existing
      existing.functions.push(...skill.functions);
      existing.classes.push(...skill.classes);
      existing.types.push(...skill.types);
      existing.enums.push(...skill.enums);
      existing.examples.push(...skill.examples);
      if (!existing.description && skill.description) {
        existing.description = skill.description;
      }
    } else {
      // Clone to avoid mutation issues
      byName.set(skill.name, {
        ...skill,
        functions: [...skill.functions],
        classes: [...skill.classes],
        types: [...skill.types],
        enums: [...skill.enums],
        examples: [...skill.examples],
      });
    }
  }

  return Array.from(byName.values());
}

interface PackageJson {
  name?: string;
  description?: string;
  license?: string;
  keywords?: string[];
  repository?: string | { type?: string; url?: string };
  author?: string | { name?: string };
}

function readPackageJson(): PackageJson {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    return JSON.parse(raw) as PackageJson;
  } catch {
    return {};
  }
}

function normalizeRepoUrl(repo: PackageJson["repository"]): string | undefined {
  if (!repo) return undefined;
  if (typeof repo === "string") return repo;
  const url = repo.url;
  if (!url) return undefined;
  return url.replace(/^git\+/, "").replace(/\.git$/, "");
}
