import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  RenderedSkill,
  SkillRenderOptions,
} from "./types.js";
import { truncateToTokenBudget } from "./tokens.js";

const DEFAULT_OPTIONS: SkillRenderOptions = {
  outDir: "skills",
  includeExamples: true,
  includeSignatures: true,
  maxTokens: 4000,
  namePrefix: "",
  license: "",
};

/** Render multiple extracted skills into SKILL.md files */
export function renderSkills(
  skills: ExtractedSkill[],
  options?: Partial<SkillRenderOptions>,
): RenderedSkill[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return skills.map((skill) => renderSkill(skill, opts));
}

/** Render a single extracted skill into a SKILL.md file */
export function renderSkill(
  skill: ExtractedSkill,
  options?: Partial<SkillRenderOptions>,
): RenderedSkill {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const skillName = toSkillName(opts.namePrefix || skill.name);

  const sections: string[] = [];

  // Frontmatter
  sections.push(
    renderFrontmatter(skillName, skill.description, opts.license || skill.license || ""),
  );

  // Title
  sections.push(`# ${skill.name}`);

  // Overview
  if (skill.description) {
    sections.push(skill.description);
  }

  // When to Use
  sections.push(renderWhenToUse(skill));

  // Quick Reference (summary of exported API surface)
  sections.push(renderQuickReference(skill));

  // Functions
  if (skill.functions.length > 0) {
    sections.push(renderFunctions(skill.functions, opts));
  }

  // Classes
  if (skill.classes.length > 0) {
    sections.push(renderClasses(skill.classes, opts));
  }

  // Types
  if (skill.types.length > 0) {
    sections.push(renderTypes(skill.types));
  }

  // Enums
  if (skill.enums.length > 0) {
    sections.push(renderEnums(skill.enums));
  }

  // Examples
  if (opts.includeExamples && skill.examples.length > 0) {
    sections.push("## Examples\n\n" + skill.examples.join("\n\n"));
  }

  const content = truncateToTokenBudget(sections.join("\n\n"), opts.maxTokens);

  return {
    filename: `${skillName}/SKILL.md`,
    content,
  };
}

function renderFrontmatter(
  name: string,
  description: string,
  license: string,
): string {
  const lines = ["---", `name: ${name}`];

  // Build a trigger-rich description for agent discovery
  const desc = description || `API reference for ${name}`;
  lines.push(`description: ${quoteYaml(desc)}`);

  if (license) {
    lines.push(`license: ${license}`);
  }

  lines.push("---");
  return lines.join("\n");
}

/** Quote YAML string values that contain special characters */
function quoteYaml(value: string): string {
  if (/[:#{}[\],&*?|>!%@`"']/.test(value) || value.includes("\n")) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function renderWhenToUse(skill: ExtractedSkill): string {
  const triggers: string[] = [];

  if (skill.functions.length > 0) {
    const names = skill.functions.slice(0, 5).map((f) => `\`${f.name}()\``);
    triggers.push(`- Working with ${names.join(", ")}${skill.functions.length > 5 ? ", and more" : ""}`);
  }

  if (skill.classes.length > 0) {
    const names = skill.classes.slice(0, 3).map((c) => `\`${c.name}\``);
    triggers.push(`- Using ${names.join(", ")} classes`);
  }

  if (skill.types.length > 0) {
    triggers.push(`- Implementing types/interfaces from this package`);
  }

  if (triggers.length === 0) return "";

  return "## When to Use\n\n" + triggers.join("\n");
}

function renderQuickReference(skill: ExtractedSkill): string {
  const items: string[] = [];

  if (skill.functions.length > 0) {
    items.push(`**${skill.functions.length} functions** — ${skill.functions.map((f) => `\`${f.name}\``).join(", ")}`);
  }
  if (skill.classes.length > 0) {
    items.push(`**${skill.classes.length} classes** — ${skill.classes.map((c) => `\`${c.name}\``).join(", ")}`);
  }
  if (skill.types.length > 0) {
    items.push(`**${skill.types.length} types** — ${skill.types.map((t) => `\`${t.name}\``).join(", ")}`);
  }
  if (skill.enums.length > 0) {
    items.push(`**${skill.enums.length} enums** — ${skill.enums.map((e) => `\`${e.name}\``).join(", ")}`);
  }

  if (items.length === 0) return "";

  return "## Quick Reference\n\n" + items.join("\n");
}

function renderFunctions(
  fns: ExtractedFunction[],
  opts: SkillRenderOptions,
): string {
  const lines = ["## Functions\n"];

  for (const fn of fns) {
    lines.push(`### \`${fn.name}\``);
    if (fn.description) lines.push(fn.description);

    if (opts.includeSignatures && fn.signature) {
      lines.push("```ts", fn.signature, "```");
    }

    if (fn.parameters.length > 0) {
      lines.push("**Parameters:**");
      for (const p of fn.parameters) {
        const opt = p.optional ? " (optional)" : "";
        const def = p.defaultValue ? ` — default: \`${p.defaultValue}\`` : "";
        lines.push(`- \`${p.name}: ${p.type}\`${opt}${def} — ${p.description || ""}`);
      }
    }

    if (fn.returnType && fn.returnType !== "void") {
      lines.push(`**Returns:** \`${fn.returnType}\``);
    }

    if (opts.includeExamples && fn.examples.length > 0) {
      for (const ex of fn.examples) {
        lines.push(ex);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

function renderClasses(
  classes: ExtractedClass[],
  opts: SkillRenderOptions,
): string {
  const lines = ["## Classes\n"];

  for (const cls of classes) {
    lines.push(`### \`${cls.name}\``);
    if (cls.description) lines.push(cls.description);

    if (opts.includeSignatures && cls.constructorSignature) {
      lines.push("```ts", cls.constructorSignature, "```");
    }

    if (cls.properties.length > 0) {
      lines.push("**Properties:**");
      for (const p of cls.properties) {
        const opt = p.optional ? " (optional)" : "";
        lines.push(`- \`${p.name}: ${p.type}\`${opt} — ${p.description || ""}`);
      }
    }

    if (cls.methods.length > 0) {
      lines.push("**Methods:**");
      for (const m of cls.methods) {
        if (opts.includeSignatures) {
          lines.push(`- \`${m.signature}\` — ${m.description || ""}`);
        } else {
          lines.push(`- \`${m.name}\` — ${m.description || ""}`);
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

function renderTypes(types: ExtractedType[]): string {
  const lines = ["## Types\n"];

  for (const t of types) {
    lines.push(`### \`${t.name}\``);
    if (t.description) lines.push(t.description);
    if (t.definition) {
      lines.push("```ts", t.definition, "```");
    }
    lines.push("");
  }

  return lines.join("\n");
}

function renderEnums(enums: ExtractedEnum[]): string {
  const lines = ["## Enums\n"];

  for (const e of enums) {
    lines.push(`### \`${e.name}\``);
    if (e.description) lines.push(e.description);
    for (const m of e.members) {
      lines.push(`- \`${m.name}\` = \`${m.value}\` — ${m.description || ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Convert a package name to a valid skill name (lowercase, hyphens only) */
function toSkillName(name: string): string {
  return name
    .replace(/^@/, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
