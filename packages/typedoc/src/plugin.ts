import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { Application, Converter, type Context, ParameterType } from "typedoc";
import { renderSkills, writeSkills, renderLlmsTxt } from "@to-skills/core";
import { extractSkills } from "./extractor.js";

export function load(app: Application): void {
  // --- Skills options ---

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

  // --- llms.txt options ---

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

  // --- Main handler ---

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    const project = context.project;
    const perPackage = app.options.getValue("skillsPerPackage") as boolean;
    const skills = extractSkills(project, perPackage);

    const pkg = readPackageJson();

    // Generate SKILL.md files
    const outDir = app.options.getValue("skillsOutDir") as string;
    const license =
      (app.options.getValue("skillsLicense") as string) || pkg.license || "";

    const rendered = renderSkills(skills, {
      outDir,
      includeExamples: app.options.getValue("skillsIncludeExamples") as boolean,
      includeSignatures: app.options.getValue("skillsIncludeSignatures") as boolean,
      maxTokens: app.options.getValue("skillsMaxTokens") as number,
      namePrefix: app.options.getValue("skillsNamePrefix") as string,
      license,
    });

    writeSkills(rendered, { outDir });

    for (const skill of rendered) {
      const tokens = skill.tokens ? ` (~${skill.tokens} tokens)` : "";
      app.logger.info(`[skills] ${skill.filename}${tokens}`);
    }
    app.logger.info(`[skills] Generated ${rendered.length} skill(s) in ${outDir}/`);

    // Generate llms.txt / llms-full.txt (if enabled)
    const llmsEnabled = app.options.getValue("llmsTxt") as boolean;
    if (llmsEnabled) {
      const llmsOutDir = app.options.getValue("llmsTxtOutDir") as string;
      const result = renderLlmsTxt(skills, {
        projectName: pkg.name || project.name,
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

function readPackageJson(): { name?: string; description?: string; license?: string } {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    return JSON.parse(raw) as { name?: string; description?: string; license?: string };
  } catch {
    return {};
  }
}
