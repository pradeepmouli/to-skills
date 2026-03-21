import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Application, Converter, type Context, ParameterType } from "typedoc";
import { renderSkills, writeSkills } from "@to-skills/core";
import { extractSkills } from "./extractor.js";

export function load(app: Application): void {
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

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    const project = context.project;
    const outDir = app.options.getValue("skillsOutDir") as string;
    const license =
      (app.options.getValue("skillsLicense") as string) || readLicenseFromPackageJson();

    const opts = {
      outDir,
      includeExamples: app.options.getValue("skillsIncludeExamples") as boolean,
      includeSignatures: app.options.getValue("skillsIncludeSignatures") as boolean,
      maxTokens: app.options.getValue("skillsMaxTokens") as number,
      namePrefix: app.options.getValue("skillsNamePrefix") as string,
      license,
    };

    const perPackage = app.options.getValue("skillsPerPackage") as boolean;
    const skills = extractSkills(project, perPackage);
    const rendered = renderSkills(skills, opts);
    writeSkills(rendered, { outDir });

    app.logger.info(
      `[skills] Generated ${rendered.length} skill file(s) in ${outDir}/`,
    );
  });
}

function readLicenseFromPackageJson(): string {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    const pkg = JSON.parse(raw) as { license?: string };
    return pkg.license ?? "";
  } catch {
    return "";
  }
}
