import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  RenderedFile,
  RenderedSkill,
  SkillRenderOptions
} from './types.js';
import { estimateTokens, truncateToTokenBudget } from './tokens.js';

/** agentskills.io spec: max 1024 chars for description */
const DESCRIPTION_MAX = 1024;

const DEFAULT_OPTIONS: SkillRenderOptions = {
  outDir: 'skills',
  includeExamples: true,
  includeSignatures: true,
  maxTokens: 4000,
  namePrefix: '',
  license: ''
};

/** Render multiple extracted skills into progressive disclosure file sets */
export function renderSkills(
  skills: ExtractedSkill[],
  options?: Partial<SkillRenderOptions>
): RenderedSkill[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return skills.map((skill) => renderSkill(skill, opts));
}

/** Render a single skill into SKILL.md + references/ */
export function renderSkill(
  skill: ExtractedSkill,
  options?: Partial<SkillRenderOptions>
): RenderedSkill {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const skillName = toSkillName(opts.namePrefix || skill.name);
  const basePath = skillName;

  // --- SKILL.md: lean discovery document ---
  const skillContent = renderSkillMd(skill, skillName, opts);

  // --- references/*.md: detailed API loaded on demand ---
  const references: RenderedFile[] = [];

  if (skill.functions.length > 0) {
    const content = renderFunctionsRef(skill.functions, opts);
    references.push({
      filename: `${basePath}/references/functions.md`,
      content: truncateToTokenBudget(content, opts.maxTokens),
      tokens: estimateTokens(content)
    });
  }

  if (skill.classes.length > 0) {
    const content = renderClassesRef(skill.classes, opts);
    references.push({
      filename: `${basePath}/references/classes.md`,
      content: truncateToTokenBudget(content, opts.maxTokens),
      tokens: estimateTokens(content)
    });
  }

  if (skill.types.length > 0 || skill.enums.length > 0) {
    const content = renderTypesRef(skill.types, skill.enums);
    references.push({
      filename: `${basePath}/references/types.md`,
      content: truncateToTokenBudget(content, opts.maxTokens),
      tokens: estimateTokens(content)
    });
  }

  if (opts.includeExamples && skill.examples.length > 0) {
    const content = '# Examples\n\n' + skill.examples.join('\n\n---\n\n');
    references.push({
      filename: `${basePath}/references/examples.md`,
      content: truncateToTokenBudget(content, opts.maxTokens),
      tokens: estimateTokens(content)
    });
  }

  if (skill.documents && skill.documents.length > 0) {
    for (const doc of skill.documents) {
      const content = `# ${doc.title}\n\n${doc.content}`;
      references.push({
        filename: `${basePath}/references/${toFilename(doc.title)}.md`,
        content: truncateToTokenBudget(content, opts.maxTokens),
        tokens: estimateTokens(content)
      });
    }
  }

  return {
    skill: {
      filename: `${basePath}/SKILL.md`,
      content: skillContent,
      tokens: estimateTokens(skillContent)
    },
    references
  };
}

// ===========================================================================
// SKILL.md — lean discovery document
// ===========================================================================

function renderSkillMd(skill: ExtractedSkill, skillName: string, opts: SkillRenderOptions): string {
  const sections: string[] = [];

  // Frontmatter
  const description = buildDescription(skill);
  sections.push(renderFrontmatter(skillName, description, opts.license || skill.license || ''));

  // Title + overview
  sections.push(`# ${skill.name}`);
  if (skill.description) {
    sections.push(skill.description);
  }

  // When to Use
  const whenToUse = renderWhenToUse(skill);
  if (whenToUse) sections.push(whenToUse);

  // Quick Reference — just the names, no details
  const quickRef = renderQuickReference(skill);
  if (quickRef) sections.push(quickRef);

  // Links
  const links = renderLinks(skill);
  if (links) sections.push(links);

  return sections.join('\n\n');
}

// ===========================================================================
// Reference files — full detail loaded on demand
// ===========================================================================

function renderFunctionsRef(fns: ExtractedFunction[], opts: SkillRenderOptions): string {
  const lines = ['# Functions\n'];

  for (const fn of fns) {
    lines.push(`## \`${fn.name}\``);
    if (fn.description) lines.push(fn.description);

    if (opts.includeSignatures && fn.signature) {
      lines.push('```ts', fn.signature, '```');
    }

    if (fn.parameters.length > 0) {
      lines.push('**Parameters:**');
      for (const p of fn.parameters) {
        const opt = p.optional ? ' (optional)' : '';
        const def = p.defaultValue ? ` — default: \`${p.defaultValue}\`` : '';
        lines.push(`- \`${p.name}: ${p.type}\`${opt}${def} — ${p.description || ''}`);
      }
    }

    if (fn.returnType && fn.returnType !== 'void') {
      lines.push(`**Returns:** \`${fn.returnType}\``);
    }

    if (opts.includeExamples && fn.examples.length > 0) {
      for (const ex of fn.examples) {
        lines.push(ex);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

function renderClassesRef(classes: ExtractedClass[], opts: SkillRenderOptions): string {
  const lines = ['# Classes\n'];

  for (const cls of classes) {
    lines.push(`## \`${cls.name}\``);
    if (cls.description) lines.push(cls.description);

    if (opts.includeSignatures && cls.constructorSignature) {
      lines.push('```ts', cls.constructorSignature, '```');
    }

    if (cls.properties.length > 0) {
      lines.push('**Properties:**');
      for (const p of cls.properties) {
        const opt = p.optional ? ' (optional)' : '';
        lines.push(`- \`${p.name}: ${p.type}\`${opt} — ${p.description || ''}`);
      }
    }

    if (cls.methods.length > 0) {
      lines.push('**Methods:**');
      for (const m of cls.methods) {
        if (opts.includeSignatures) {
          lines.push(`- \`${m.signature}\` — ${m.description || ''}`);
        } else {
          lines.push(`- \`${m.name}\` — ${m.description || ''}`);
        }
      }
    }

    if (opts.includeExamples && cls.examples.length > 0) {
      for (const ex of cls.examples) {
        lines.push(ex);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

function renderTypesRef(types: ExtractedType[], enums: ExtractedEnum[]): string {
  const lines = ['# Types & Enums\n'];

  if (types.length > 0) {
    lines.push('## Types\n');
    for (const t of types) {
      lines.push(`### \`${t.name}\``);
      if (t.description) lines.push(t.description);
      if (t.properties && t.properties.length > 0) {
        lines.push('**Properties:**');
        for (const p of t.properties) {
          const opt = p.optional ? ' (optional)' : '';
          lines.push(`- \`${p.name}: ${p.type}\`${opt} — ${p.description || ''}`);
        }
      }
      if (t.definition) {
        lines.push('```ts', t.definition, '```');
      }
      lines.push('');
    }
  }

  if (enums.length > 0) {
    lines.push('## Enums\n');
    for (const e of enums) {
      lines.push(`### \`${e.name}\``);
      if (e.description) lines.push(e.description);
      for (const m of e.members) {
        lines.push(`- \`${m.name}\` = \`${m.value}\` — ${m.description || ''}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ===========================================================================
// Shared helpers
// ===========================================================================

function buildDescription(skill: ExtractedSkill): string {
  const parts: string[] = [];

  if (skill.description) {
    parts.push(skill.description);
  } else {
    parts.push(`API reference for ${skill.name}`);
  }

  const triggers: string[] = [];
  if (skill.functions.length > 0) {
    triggers.push(
      skill.functions
        .slice(0, 5)
        .map((f) => f.name)
        .join(', ')
    );
  }
  if (skill.classes.length > 0) {
    triggers.push(
      skill.classes
        .slice(0, 3)
        .map((c) => c.name)
        .join(', ')
    );
  }
  if (triggers.length > 0) {
    parts.push(`Use when working with ${triggers.join(', ')}.`);
  }

  if (skill.keywords && skill.keywords.length > 0) {
    const useful = skill.keywords.filter(
      (k) =>
        !['typescript', 'javascript', 'node', 'nodejs', 'npm', 'library'].includes(k.toLowerCase())
    );
    if (useful.length > 0) {
      parts.push(`Keywords: ${useful.join(', ')}.`);
    }
  }

  return truncateDescription(parts.join(' '), DESCRIPTION_MAX);
}

function truncateDescription(desc: string, max: number): string {
  if (desc.length <= max) return desc;
  const firstSentence = desc.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= max) return firstSentence;
  return desc.slice(0, max - 3) + '...';
}

function renderFrontmatter(name: string, description: string, license: string): string {
  const lines = ['---', `name: ${name}`];
  lines.push(`description: ${quoteYaml(description)}`);
  if (license) lines.push(`license: ${license}`);
  lines.push('---');
  return lines.join('\n');
}

function quoteYaml(value: string): string {
  if (/[:#{}[\],&*?|>!%@`"']/.test(value) || value.includes('\n')) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function renderLinks(skill: ExtractedSkill): string {
  const links: string[] = [];
  if (skill.repository) links.push(`- [Repository](${skill.repository})`);
  if (skill.author) links.push(`- Author: ${skill.author}`);
  if (links.length === 0) return '';
  return '## Links\n\n' + links.join('\n');
}

function renderWhenToUse(skill: ExtractedSkill): string {
  const triggers: string[] = [];

  if (skill.functions.length > 0) {
    const names = skill.functions.slice(0, 5).map((f) => `\`${f.name}()\``);
    triggers.push(
      `- Calling ${names.join(', ')}${skill.functions.length > 5 ? `, and ${skill.functions.length - 5} more` : ''}`
    );
  }
  if (skill.classes.length > 0) {
    const names = skill.classes.slice(0, 3).map((c) => `\`${c.name}\``);
    triggers.push(`- Instantiating or extending ${names.join(', ')}`);
  }
  if (skill.types.length > 0) {
    const names = skill.types.slice(0, 5).map((t) => `\`${t.name}\``);
    triggers.push(`- Typing with ${names.join(', ')}`);
  }
  for (const fn of skill.functions) {
    if (fn.tags['see']) {
      triggers.push(`- See also: ${fn.tags['see']}`);
      break;
    }
  }

  if (triggers.length === 0) return '';
  return '## When to Use\n\n' + triggers.join('\n');
}

function renderQuickReference(skill: ExtractedSkill): string {
  const items: string[] = [];

  if (skill.functions.length > 0) {
    items.push(
      `**${skill.functions.length} functions** — ${skill.functions.map((f) => `\`${f.name}\``).join(', ')}`
    );
  }
  if (skill.classes.length > 0) {
    items.push(
      `**${skill.classes.length} classes** — ${skill.classes.map((c) => `\`${c.name}\``).join(', ')}`
    );
  }
  if (skill.types.length > 0) {
    items.push(
      `**${skill.types.length} types** — ${skill.types.map((t) => `\`${t.name}\``).join(', ')}`
    );
  }
  if (skill.enums.length > 0) {
    items.push(
      `**${skill.enums.length} enums** — ${skill.enums.map((e) => `\`${e.name}\``).join(', ')}`
    );
  }

  if (items.length === 0) return '';
  return '## Quick Reference\n\n' + items.join('\n');
}

function toSkillName(name: string): string {
  return name
    .replace(/^@/, '') // strip npm scope @
    .replace(/\//g, '-') // scope separator → hyphen
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase → kebab-case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // XMLParser → xml-parser
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // strip invalid chars
    .replace(/-+/g, '-') // collapse hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing
}

function toFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
