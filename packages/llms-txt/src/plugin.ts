import { writeFileSync, mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  Application,
  Converter,
  type Context,
  type ProjectReflection,
  DeclarationReflection,
  ReflectionKind,
  ParameterType,
} from "typedoc";

export function load(app: Application): void {
  app.options.addDeclaration({
    name: "llmsTxt",
    help: "[LLMs] Enable llms.txt generation",
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.options.addDeclaration({
    name: "llmsTxtOutDir",
    help: "[LLMs] Output directory for llms.txt files",
    type: ParameterType.String,
    defaultValue: ".",
  });

  app.options.addDeclaration({
    name: "llmsTxtFull",
    help: "[LLMs] Also generate llms-full.txt with complete API content",
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    const enabled = app.options.getValue("llmsTxt") as boolean;
    if (!enabled) return;

    const project = context.project;
    const outDir = app.options.getValue("llmsTxtOutDir") as string;
    const generateFull = app.options.getValue("llmsTxtFull") as boolean;

    const pkg = readPackageJson();
    const projectName = pkg.name || project.name;
    const description = pkg.description || "";

    // Generate llms.txt (link index / summary)
    const llmsTxt = renderLlmsTxt(project, projectName, description);
    const llmsTxtPath = join(outDir, "llms.txt");
    mkdirSync(dirname(llmsTxtPath), { recursive: true });
    writeFileSync(llmsTxtPath, llmsTxt, "utf-8");
    app.logger.info(`[llms-txt] Generated ${llmsTxtPath}`);

    // Generate llms-full.txt (complete API content)
    if (generateFull) {
      const llmsFullTxt = renderLlmsFullTxt(project, projectName, description);
      const llmsFullPath = join(outDir, "llms-full.txt");
      writeFileSync(llmsFullPath, llmsFullTxt, "utf-8");
      app.logger.info(`[llms-txt] Generated ${llmsFullPath}`);
    }
  });
}

function renderLlmsTxt(
  project: ProjectReflection,
  name: string,
  description: string,
): string {
  const lines: string[] = [];

  lines.push(`# ${name}\n`);
  if (description) {
    lines.push(`> ${description}\n`);
  }

  const children = project.children ?? [];
  const modules = children.filter(
    (c) => c.kind === ReflectionKind.Module || c.kind === ReflectionKind.Namespace,
  );

  if (modules.length > 0) {
    // Monorepo: list each module with its exports
    for (const mod of modules) {
      lines.push(`## ${mod.name}\n`);
      renderModuleSummary(mod, lines);
    }
  } else {
    // Single package
    lines.push("## API\n");
    renderModuleSummary(project as unknown as DeclarationReflection, lines);
  }

  return lines.join("\n");
}

function renderLlmsFullTxt(
  project: ProjectReflection,
  name: string,
  description: string,
): string {
  const lines: string[] = [];

  lines.push(`# ${name}\n`);
  if (description) {
    lines.push(`> ${description}\n`);
  }

  const children = project.children ?? [];
  const modules = children.filter(
    (c) => c.kind === ReflectionKind.Module || c.kind === ReflectionKind.Namespace,
  );

  if (modules.length > 0) {
    for (const mod of modules) {
      lines.push(`## ${mod.name}\n`);
      renderModuleFull(mod, lines);
    }
  } else {
    renderModuleFull(project as unknown as DeclarationReflection, lines);
  }

  return lines.join("\n");
}

function renderModuleSummary(mod: DeclarationReflection | ProjectReflection, lines: string[]): void {
  const children = (mod as DeclarationReflection).children ?? [];

  const groups: Record<string, DeclarationReflection[]> = {};
  for (const child of children) {
    const kind = getKindLabel(child.kind);
    if (!groups[kind]) groups[kind] = [];
    groups[kind]!.push(child);
  }

  for (const [kind, members] of Object.entries(groups)) {
    lines.push(`### ${kind}\n`);
    for (const m of members) {
      const desc = getShortDescription(m);
      lines.push(`- \`${m.name}\`${desc ? `: ${desc}` : ""}`);
    }
    lines.push("");
  }
}

function renderModuleFull(mod: DeclarationReflection | ProjectReflection, lines: string[]): void {
  const children = (mod as DeclarationReflection).children ?? [];

  for (const child of children) {
    lines.push(`### ${child.name}\n`);

    const desc = getFullDescription(child);
    if (desc) lines.push(`${desc}\n`);

    // Signature
    if (child.kind === ReflectionKind.Function && child.signatures?.length) {
      const sig = child.signatures[0]!;
      const params = (sig.parameters ?? [])
        .map((p) => `${p.name}${p.flags.isOptional ? "?" : ""}: ${p.type?.toString() ?? "unknown"}`)
        .join(", ");
      const ret = sig.type?.toString() ?? "void";
      lines.push("```ts", `function ${child.name}(${params}): ${ret}`, "```\n");

      if (sig.parameters?.length) {
        lines.push("**Parameters:**");
        for (const p of sig.parameters) {
          const pdesc = getCommentText(p.comment);
          lines.push(`- \`${p.name}\`: \`${p.type?.toString() ?? "unknown"}\`${pdesc ? ` — ${pdesc}` : ""}`);
        }
        lines.push("");
      }
    }

    // Class members
    if (child.kind === ReflectionKind.Class && child.children?.length) {
      const props = child.children.filter((c) => c.kind === ReflectionKind.Property && !c.flags.isPrivate);
      const methods = child.children.filter((c) => c.kind === ReflectionKind.Method && !c.flags.isPrivate);

      if (props.length > 0) {
        lines.push("**Properties:**");
        for (const p of props) {
          lines.push(`- \`${p.name}: ${p.type?.toString() ?? "unknown"}\`${getShortDescription(p) ? ` — ${getShortDescription(p)}` : ""}`);
        }
        lines.push("");
      }

      if (methods.length > 0) {
        lines.push("**Methods:**");
        for (const m of methods) {
          const mdesc = getShortDescription(m);
          lines.push(`- \`${m.name}()\`${mdesc ? ` — ${mdesc}` : ""}`);
        }
        lines.push("");
      }
    }

    // Interface/TypeAlias
    if (
      (child.kind === ReflectionKind.Interface || child.kind === ReflectionKind.TypeAlias) &&
      child.type
    ) {
      lines.push("```ts", `type ${child.name} = ${child.type.toString()}`, "```\n");
    }

    // Enum
    if (child.kind === ReflectionKind.Enum && child.children?.length) {
      for (const m of child.children) {
        lines.push(`- \`${m.name}\` = \`${m.type?.toString() ?? ""}\``);
      }
      lines.push("");
    }
  }
}

function getKindLabel(kind: ReflectionKind): string {
  if (kind === ReflectionKind.Function) return "Functions";
  if (kind === ReflectionKind.Class) return "Classes";
  if (kind === ReflectionKind.Interface) return "Interfaces";
  if (kind === ReflectionKind.TypeAlias) return "Types";
  if (kind === ReflectionKind.Enum) return "Enums";
  if (kind === ReflectionKind.Variable) return "Variables";
  return "Other";
}

function getShortDescription(decl: DeclarationReflection): string {
  const text = getCommentText(decl.comment);
  if (text) return text.split("\n")[0]!;
  // Fall back to first signature comment
  if (decl.signatures?.length) {
    return getCommentText(decl.signatures[0]!.comment).split("\n")[0] ?? "";
  }
  return "";
}

function getFullDescription(decl: DeclarationReflection): string {
  const text = getCommentText(decl.comment);
  if (text) return text;
  if (decl.signatures?.length) {
    return getCommentText(decl.signatures[0]!.comment);
  }
  return "";
}

function getCommentText(comment: DeclarationReflection["comment"]): string {
  if (!comment) return "";
  return comment.summary
    .map((part) => part.text)
    .join("")
    .trim();
}

function readPackageJson(): { name?: string; description?: string } {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    return JSON.parse(raw) as { name?: string; description?: string };
  } catch {
    return {};
  }
}
