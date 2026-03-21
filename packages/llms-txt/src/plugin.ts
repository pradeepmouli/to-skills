import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
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
import { estimateTokens } from "@to-skills/core";

/** Max description length in llms.txt summary (rachfop pattern: 150, Mintlify: 300) */
const SUMMARY_DESC_MAX = 150;

/** Section ordering — functions/classes first (primary API), types/enums in Optional */
const SECTION_ORDER: Record<string, number> = {
  Functions: 1,
  Classes: 2,
  Variables: 3,
  Interfaces: 10,
  Types: 11,
  Enums: 12,
  Other: 20,
};

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

    // Generate llms.txt (summary index)
    const llmsTxt = renderLlmsTxt(project, projectName, description);
    const llmsTxtPath = join(outDir, "llms.txt");
    mkdirSync(dirname(llmsTxtPath), { recursive: true });
    writeFileSync(llmsTxtPath, llmsTxt, "utf-8");
    app.logger.info(
      `[llms-txt] Generated ${llmsTxtPath} (~${estimateTokens(llmsTxt)} tokens)`,
    );

    // Generate llms-full.txt (complete API content)
    if (generateFull) {
      const llmsFullTxt = renderLlmsFullTxt(project, projectName, description);
      const llmsFullPath = join(outDir, "llms-full.txt");
      writeFileSync(llmsFullPath, llmsFullTxt, "utf-8");
      app.logger.info(
        `[llms-txt] Generated ${llmsFullPath} (~${estimateTokens(llmsFullTxt)} tokens)`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// llms.txt — summary index with truncated descriptions
// ---------------------------------------------------------------------------

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
    for (const mod of modules) {
      lines.push(`## ${mod.name}\n`);
      renderModuleSummary(mod, lines);
    }
  } else {
    renderModuleSummary(project as unknown as DeclarationReflection, lines);
  }

  return lines.join("\n");
}

function renderModuleSummary(
  mod: DeclarationReflection | ProjectReflection,
  lines: string[],
): void {
  const children = (mod as DeclarationReflection).children ?? [];
  const { primary, optional } = groupByPriority(children);

  // Primary API sections (Functions, Classes, Variables)
  renderGroupedSections(primary, lines, true);

  // Optional section (Types, Interfaces, Enums) — per llmstxt.org spec,
  // agents can drop this when context is tight
  if (optional.length > 0) {
    lines.push("## Optional\n");
    renderGroupedSections(optional, lines, true);
  }
}

// ---------------------------------------------------------------------------
// llms-full.txt — complete API content
// ---------------------------------------------------------------------------

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
      lines.push("\n---\n");
    }
  } else {
    renderModuleFull(project as unknown as DeclarationReflection, lines);
  }

  return lines.join("\n");
}

function renderModuleFull(
  mod: DeclarationReflection | ProjectReflection,
  lines: string[],
): void {
  const children = (mod as DeclarationReflection).children ?? [];

  for (const child of children) {
    lines.push(`### ${child.name}\n`);

    const desc = getFullDescription(child);
    if (desc) lines.push(`${desc}\n`);

    // Function signature
    if (child.kind === ReflectionKind.Function && child.signatures?.length) {
      const sig = child.signatures[0]!;
      const params = (sig.parameters ?? [])
        .map(
          (p) =>
            `${p.name}${p.flags.isOptional ? "?" : ""}: ${p.type?.toString() ?? "unknown"}`,
        )
        .join(", ");
      const ret = sig.type?.toString() ?? "void";
      lines.push("```ts", `function ${child.name}(${params}): ${ret}`, "```\n");

      if (sig.parameters?.length) {
        lines.push("**Parameters:**");
        for (const p of sig.parameters) {
          const pdesc = getCommentText(p.comment);
          lines.push(
            `- \`${p.name}\`: \`${p.type?.toString() ?? "unknown"}\`${pdesc ? ` — ${pdesc}` : ""}`,
          );
        }
        lines.push("");
      }
    }

    // Class members
    if (child.kind === ReflectionKind.Class && child.children?.length) {
      const props = child.children.filter(
        (c) => c.kind === ReflectionKind.Property && !c.flags.isPrivate,
      );
      const methods = child.children.filter(
        (c) => c.kind === ReflectionKind.Method && !c.flags.isPrivate,
      );

      if (props.length > 0) {
        lines.push("**Properties:**");
        for (const p of props) {
          const pdesc = getShortDescription(p);
          lines.push(
            `- \`${p.name}: ${p.type?.toString() ?? "unknown"}\`${pdesc ? ` — ${pdesc}` : ""}`,
          );
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
      (child.kind === ReflectionKind.Interface ||
        child.kind === ReflectionKind.TypeAlias) &&
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split children into primary (functions, classes) and optional (types, enums) */
function groupByPriority(children: DeclarationReflection[]): {
  primary: DeclarationReflection[];
  optional: DeclarationReflection[];
} {
  const primary: DeclarationReflection[] = [];
  const optional: DeclarationReflection[] = [];

  for (const child of children) {
    const order = SECTION_ORDER[getKindLabel(child.kind)] ?? 20;
    if (order <= 3) {
      primary.push(child);
    } else {
      optional.push(child);
    }
  }

  return { primary, optional };
}

function renderGroupedSections(
  children: DeclarationReflection[],
  lines: string[],
  truncate: boolean,
): void {
  const groups: Record<string, DeclarationReflection[]> = {};

  for (const child of children) {
    const kind = getKindLabel(child.kind);
    if (!groups[kind]) groups[kind] = [];
    groups[kind]!.push(child);
  }

  // Sort groups by SECTION_ORDER
  const sorted = Object.entries(groups).sort(
    ([a], [b]) => (SECTION_ORDER[a] ?? 20) - (SECTION_ORDER[b] ?? 20),
  );

  for (const [kind, members] of sorted) {
    lines.push(`### ${kind}\n`);
    for (const m of members) {
      const desc = truncate
        ? truncateDescription(getShortDescription(m))
        : getShortDescription(m);
      lines.push(`- \`${m.name}\`${desc ? `: ${desc}` : ""}`);
    }
    lines.push("");
  }
}

/** Truncate description to SUMMARY_DESC_MAX chars, keeping first sentence */
function truncateDescription(desc: string): string {
  if (!desc || desc.length <= SUMMARY_DESC_MAX) return desc;

  // Try to cut at sentence boundary
  const firstSentence = desc.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= SUMMARY_DESC_MAX) {
    return firstSentence;
  }

  // Hard truncate with ellipsis
  return desc.slice(0, SUMMARY_DESC_MAX - 3) + "...";
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
