import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  RenderedSkill,
  SkillRenderOptions,
} from "./types.js";
import { estimateTokens, truncateToTokenBudget } from "./tokens.js";

/** agentskills.io spec: max 1024 chars for description */
const DESCRIPTION_MAX = 1024;

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

  // Frontmatter — description is truncated and enriched with trigger phrases
  const description = buildDescription(skill);
  sections.push(
    renderFrontmatter(skillName, description, opts.license || skill.license || ""),
  );

  // Title
  sections.push(`# ${skill.name}`);

  // Overview
  if (skill.description) {
    sections.push(skill.description);
  }

  // When to Use — derived from API surface
  const whenToUse = renderWhenToUse(skill);
  if (whenToUse) sections.push(whenToUse);

  // Quick Reference — summary of exported surface
  const quickRef = renderQuickReference(skill);
  if (quickRef) sections.push(quickRef);

  // Primary API: Functions and Classes first (what agents can call)
  if (skill.functions.length > 0) {
    sections.push(renderFunctions(skill.functions, opts));
  }

  if (skill.classes.length > 0) {
    sections.push(renderClasses(skill.classes, opts));
  }

  // Examples (high value — before type definitions)
  if (opts.includeExamples && skill.examples.length > 0) {
    sections.push("## Examples\n\n" + skill.examples.join("\n\n"));
  }

  // Additional documentation (from projectDocuments, README sections, etc.)
  if (skill.documents && skill.documents.length > 0) {
    for (const doc of skill.documents) {
      sections.push(`## ${doc.title}\n\n${doc.content}`);
    }
  }

  // Secondary: Types and Enums (supporting definitions)
  if (skill.types.length > 0) {
    sections.push(renderTypes(skill.types));
  }

  if (skill.enums.length > 0) {
    sections.push(renderEnums(skill.enums));
  }

  // Links
  const links = renderLinks(skill);
  if (links) sections.push(links);

  const raw = sections.join("\n\n");
  const content = truncateToTokenBudget(raw, opts.maxTokens);

  return {
    filename: `${skillName}/SKILL.md`,
    content,
    tokens: estimateTokens(content),
  };
}

// ---------------------------------------------------------------------------
// Description builder — enriches with trigger phrases for agent discovery
// ---------------------------------------------------------------------------

function buildDescription(skill: ExtractedSkill): string {
  const parts: string[] = [];

  // Base description
  if (skill.description) {
    parts.push(skill.description);
  } else {
    parts.push(`API reference for ${skill.name}`);
  }

  // Add trigger phrases from API surface
  const triggers: string[] = [];
  if (skill.functions.length > 0) {
    const names = skill.functions.slice(0, 5).map((f) => f.name);
    triggers.push(names.join(", "));
  }
  if (skill.classes.length > 0) {
    const names = skill.classes.slice(0, 3).map((c) => c.name);
    triggers.push(names.join(", "));
  }

  if (triggers.length > 0) {
    parts.push(`Use when working with ${triggers.join(", ")}.`);
  }

  // Enrich with keywords from package.json
  if (skill.keywords && skill.keywords.length > 0) {
    // Filter out generic keywords, keep domain-specific ones
    const useful = skill.keywords.filter(
      (k) => !["typescript", "javascript", "node", "nodejs", "npm", "library"].includes(k.toLowerCase()),
    );
    if (useful.length > 0) {
      parts.push(`Keywords: ${useful.join(", ")}.`);
    }
  }

  const full = parts.join(" ");
  return truncateDescription(full, DESCRIPTION_MAX);
}

/** Truncate description to max chars, keeping sentence boundary */
function truncateDescription(desc: string, max: number): string {
  if (desc.length <= max) return desc;

  const firstSentence = desc.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= max) {
    return firstSentence;
  }

  return desc.slice(0, max - 3) + "...";
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

function renderFrontmatter(
  name: string,
  description: string,
  license: string,
): string {
  const lines = ["---", `name: ${name}`];
  lines.push(`description: ${quoteYaml(description)}`);

  if (license) {
    lines.push(`license: ${license}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function quoteYaml(value: string): string {
  if (/[:#{}[\],&*?|>!%@`"']/.test(value) || value.includes("\n")) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Links section
// ---------------------------------------------------------------------------

function renderLinks(skill: ExtractedSkill): string {
  const links: string[] = [];

  if (skill.repository) {
    links.push(`- [Repository](${skill.repository})`);
  }
  if (skill.author) {
    links.push(`- Author: ${skill.author}`);
  }

  if (links.length === 0) return "";
  return "## Links\n\n" + links.join("\n");
}

// ---------------------------------------------------------------------------
// When to Use — richer triggers from API surface
// ---------------------------------------------------------------------------

function renderWhenToUse(skill: ExtractedSkill): string {
  const triggers: string[] = [];

  if (skill.functions.length > 0) {
    const names = skill.functions.slice(0, 5).map((f) => `\`${f.name}()\``);
    triggers.push(
      `- Calling ${names.join(", ")}${skill.functions.length > 5 ? `, and ${skill.functions.length - 5} more` : ""}`,
    );
  }

  if (skill.classes.length > 0) {
    const names = skill.classes.slice(0, 3).map((c) => `\`${c.name}\``);
    triggers.push(`- Instantiating or extending ${names.join(", ")}`);
  }

  if (skill.types.length > 0) {
    const names = skill.types.slice(0, 5).map((t) => `\`${t.name}\``);
    triggers.push(`- Typing with ${names.join(", ")}`);
  }

  // Extract @see / @remarks triggers from function tags
  for (const fn of skill.functions) {
    if (fn.tags["see"]) {
      triggers.push(`- See also: ${fn.tags["see"]}`);
      break; // one is enough
    }
  }

  if (triggers.length === 0) return "";

  return "## When to Use\n\n" + triggers.join("\n");
}

// ---------------------------------------------------------------------------
// Quick Reference
// ---------------------------------------------------------------------------

function renderQuickReference(skill: ExtractedSkill): string {
  const items: string[] = [];

  if (skill.functions.length > 0) {
    items.push(
      `**${skill.functions.length} functions** — ${skill.functions.map((f) => `\`${f.name}\``).join(", ")}`,
    );
  }
  if (skill.classes.length > 0) {
    items.push(
      `**${skill.classes.length} classes** — ${skill.classes.map((c) => `\`${c.name}\``).join(", ")}`,
    );
  }
  if (skill.types.length > 0) {
    items.push(
      `**${skill.types.length} types** — ${skill.types.map((t) => `\`${t.name}\``).join(", ")}`,
    );
  }
  if (skill.enums.length > 0) {
    items.push(
      `**${skill.enums.length} enums** — ${skill.enums.map((e) => `\`${e.name}\``).join(", ")}`,
    );
  }

  if (items.length === 0) return "";

  return "## Quick Reference\n\n" + items.join("\n");
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderFunctions(fns: ExtractedFunction[], opts: SkillRenderOptions): string {
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

function renderClasses(classes: ExtractedClass[], opts: SkillRenderOptions): string {
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

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

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
