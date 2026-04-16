import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  ExtractedVariable,
  RenderedFile,
  RenderedSkill,
  SkillRenderOptions
} from './types.js';
import { estimateTokens, truncateToTokenBudget } from './tokens.js';
import { renderConfigSurfaceSection, renderConfigReference } from './config-renderer.js';

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

/**
 * Render multiple extracted skills into progressive disclosure file sets.
 *
 * @category Rendering
 * @useWhen
 * - You have one or more ExtractedSkill objects and need SKILL.md + references/ output
 * - Building a custom extraction pipeline that bypasses the TypeDoc plugin
 * @pitfalls
 * - NEVER set maxTokens below 500 — reference files become truncated mid-signature, producing broken code blocks that confuse LLMs
 * - NEVER pass skills with empty `name` — the output directory becomes a bare `/` path
 */
export function renderSkills(
  skills: ExtractedSkill[],
  options?: Partial<SkillRenderOptions>
): RenderedSkill[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return skills.map((skill) => renderSkill(skill, opts));
}

/**
 * Render a single skill into SKILL.md + references/.
 *
 * @category Rendering
 * @useWhen
 * - You need fine-grained control over rendering a single skill
 * @pitfalls
 * - NEVER set maxTokens below 500 — reference files become truncated mid-signature, producing broken code blocks
 */
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
    addGroupedReferences(
      skill.functions,
      basePath,
      'functions',
      opts,
      (items) => renderFunctionsRef(items, opts),
      references
    );
  }

  if (skill.classes.length > 0) {
    addGroupedReferences(
      skill.classes,
      basePath,
      'classes',
      opts,
      (items) => renderClassesRef(items, opts),
      references
    );
  }

  if (skill.types.length > 0 || skill.enums.length > 0) {
    const content = renderTypesRef(skill.types, skill.enums);
    references.push({
      filename: `${basePath}/references/types.md`,
      content: truncateToTokenBudget(content, opts.maxTokens),
      tokens: estimateTokens(content)
    });
  }

  if (skill.variables && skill.variables.length > 0) {
    const content = renderVariablesRef(skill.variables);
    references.push({
      filename: `${basePath}/references/variables.md`,
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

  if (skill.configSurfaces && skill.configSurfaces.length > 0) {
    const cliSurfaces = skill.configSurfaces.filter((s) => s.sourceType === 'cli');
    const configSurfaces = skill.configSurfaces.filter((s) => s.sourceType !== 'cli');

    if (cliSurfaces.length > 0) {
      const content = renderConfigReference(cliSurfaces);
      references.push({
        filename: `${basePath}/references/commands.md`,
        content: truncateToTokenBudget(content, opts.maxTokens),
        tokens: estimateTokens(content)
      });
    }

    if (configSurfaces.length > 0) {
      const content = renderConfigReference(configSurfaces);
      references.push({
        filename: `${basePath}/references/config.md`,
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

  const description = buildDescription(skill);
  sections.push(renderFrontmatter(skillName, description, opts.license || skill.license || ''));

  sections.push(`# ${skill.name}`);

  // Package description as body intro
  if (skill.packageDescription) {
    sections.push(skill.packageDescription);
  } else if (skill.description) {
    sections.push(skill.description);
  }

  // Quick Start example (first module-level example)
  if (opts.includeExamples && skill.examples.length > 0) {
    sections.push('## Quick Start\n\n' + skill.examples[0]);
  }

  const whenToUse = renderWhenToUse(skill);
  if (whenToUse) sections.push(whenToUse);

  const pitfalls = renderPitfalls(skill);
  if (pitfalls) sections.push(pitfalls);

  const configSection = renderConfigSurfaceSection(skill.configSurfaces);
  if (configSection) sections.push(configSection);

  const quickRef = renderQuickReference(skill);
  if (quickRef) sections.push(quickRef);

  const docs = renderDocumentation(skill);
  if (docs) sections.push(docs);

  const links = renderLinks(skill);
  if (links) sections.push(links);

  return sections.join('\n\n');
}

// ===========================================================================
// Reference files — full detail loaded on demand
// ===========================================================================

/** Format description suffix — returns " — desc" or empty string, never trailing " — " */
function descSuffix(description: string | undefined): string {
  return description ? ` — ${description}` : '';
}

function getGroupKey<T extends { category?: string; sourceModule?: string }>(item: T): string {
  return item.category || item.sourceModule || '';
}

function groupByCategory<T extends { category?: string; sourceModule?: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = getGroupKey(item);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

function hasGroupInfo<T extends { category?: string; sourceModule?: string }>(items: T[]): boolean {
  return items.some((item) => !!item.category || !!item.sourceModule);
}

// Keep old names as aliases for backward compatibility within this file
const groupByModule = groupByCategory;
const hasModuleInfo = hasGroupInfo;

function renderFunctionBody(
  fn: ExtractedFunction,
  opts: SkillRenderOptions,
  lines: string[]
): void {
  if (fn.description) lines.push(fn.description);

  if (fn.remarks) {
    lines.push('');
    lines.push(fn.remarks);
  }

  if (opts.includeSignatures && fn.signature) {
    lines.push('```ts', fn.signature, '```');
  }

  if (fn.parameters.length > 0) {
    lines.push('**Parameters:**');
    for (const p of fn.parameters) {
      const opt = p.optional ? ' (optional)' : '';
      const def = p.defaultValue ? ` — default: \`${p.defaultValue}\`` : '';
      lines.push(`- \`${p.name}: ${p.type}\`${opt}${def}${descSuffix(p.description)}`);
    }
  }

  if (fn.returnType && fn.returnType !== 'void') {
    const desc = fn.returnsDescription ? ` — ${fn.returnsDescription}` : '';
    lines.push(`**Returns:** \`${fn.returnType}\`${desc}`);
  }

  // Render important tags
  if (fn.tags['deprecated']) {
    lines.push(`> **Deprecated:** ${fn.tags['deprecated']}`);
  }
  if (fn.tags['since']) {
    lines.push(`**Since:** \`${fn.tags['since']}\``);
  }
  if (fn.tags['throws']) {
    lines.push(`**Throws:** ${fn.tags['throws']}`);
  }
  if (fn.tags['see']) {
    lines.push(`**See:** ${fn.tags['see']}`);
  }

  if (opts.includeSignatures && fn.overloads && fn.overloads.length > 0) {
    lines.push('**Overloads:**');
    for (const overload of fn.overloads) {
      lines.push('```ts', overload, '```');
    }
  }

  if (opts.includeExamples && fn.examples.length > 0) {
    for (const ex of fn.examples) {
      lines.push(ex);
    }
  }

  lines.push('');
}

function renderFunctionsRef(fns: ExtractedFunction[], opts: SkillRenderOptions): string {
  const lines = ['# Functions\n'];

  if (hasModuleInfo(fns)) {
    const groups = groupByModule(fns);
    for (const [mod, modFns] of groups) {
      if (mod) lines.push(`## ${mod}\n`);
      for (const fn of modFns) {
        lines.push(mod ? `### \`${fn.name}\`` : `## \`${fn.name}\``);
        renderFunctionBody(fn, opts, lines);
      }
    }
  } else {
    for (const fn of fns) {
      lines.push(`## \`${fn.name}\``);
      renderFunctionBody(fn, opts, lines);
    }
  }

  return lines.join('\n');
}

function renderClassBody(cls: ExtractedClass, opts: SkillRenderOptions, lines: string[]): void {
  if (cls.description) lines.push(cls.description);

  if (cls.extends) {
    lines.push(`*extends \`${cls.extends}\`*`);
  }
  if (cls.implements && cls.implements.length > 0) {
    lines.push(`*implements ${cls.implements.map((i) => `\`${i}\``).join(', ')}*`);
  }

  if (opts.includeSignatures && cls.constructorSignature) {
    lines.push('```ts', cls.constructorSignature, '```');
  }

  if (cls.properties.length > 0) {
    lines.push('**Properties:**');
    for (const p of cls.properties) {
      const opt = p.optional ? ' (optional)' : '';
      lines.push(`- \`${p.name}: ${p.type}\`${opt}${descSuffix(p.description)}`);
    }
  }

  if (cls.methods.length > 0) {
    lines.push('**Methods:**');
    for (const m of cls.methods) {
      if (opts.includeSignatures) {
        lines.push(`- \`${m.signature}\`${descSuffix(m.description)}`);
      } else {
        lines.push(`- \`${m.name}\`${descSuffix(m.description)}`);
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

function renderClassesRef(classes: ExtractedClass[], opts: SkillRenderOptions): string {
  const lines = ['# Classes\n'];

  if (hasModuleInfo(classes)) {
    const groups = groupByModule(classes);
    for (const [mod, modClasses] of groups) {
      if (mod) lines.push(`## ${mod}\n`);
      for (const cls of modClasses) {
        lines.push(mod ? `### \`${cls.name}\`` : `## \`${cls.name}\``);
        renderClassBody(cls, opts, lines);
      }
    }
  } else {
    for (const cls of classes) {
      lines.push(`## \`${cls.name}\``);
      renderClassBody(cls, opts, lines);
    }
  }

  return lines.join('\n');
}

function renderTypesRef(types: ExtractedType[], enums: ExtractedEnum[]): string {
  const lines = ['# Types & Enums\n'];

  const allTypeLike = [...types, ...enums];

  if (hasModuleInfo(allTypeLike)) {
    // Group types and enums together by module
    const typeGroups = groupByModule(types);
    const enumGroups = groupByModule(enums);
    const allMods = new Set([...typeGroups.keys(), ...enumGroups.keys()]);

    for (const mod of allMods) {
      if (mod) lines.push(`## ${mod}\n`);
      const heading = (name: string) => (mod ? `### \`${name}\`` : `## \`${name}\``);

      const modTypes = typeGroups.get(mod) ?? [];
      for (const t of modTypes) {
        lines.push(heading(t.name));
        if (t.description) lines.push(t.description);
        if (t.properties && t.properties.length > 0) {
          lines.push('**Properties:**');
          for (const p of t.properties) {
            const opt = p.optional ? ' (optional)' : '';
            lines.push(`- \`${p.name}: ${p.type}\`${opt}${descSuffix(p.description)}`);
          }
        }
        if (t.definition) {
          lines.push('```ts', t.definition, '```');
        }
        lines.push('');
      }

      const modEnums = enumGroups.get(mod) ?? [];
      for (const e of modEnums) {
        lines.push(heading(e.name));
        if (e.description) lines.push(e.description);
        for (const m of e.members) {
          lines.push(`- \`${m.name}\` = \`${m.value}\`${descSuffix(m.description)}`);
        }
        lines.push('');
      }
    }
  } else {
    if (types.length > 0) {
      lines.push('## Types\n');
      for (const t of types) {
        lines.push(`### \`${t.name}\``);
        if (t.description) lines.push(t.description);
        if (t.properties && t.properties.length > 0) {
          lines.push('**Properties:**');
          for (const p of t.properties) {
            const opt = p.optional ? ' (optional)' : '';
            lines.push(`- \`${p.name}: ${p.type}\`${opt}${descSuffix(p.description)}`);
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
          lines.push(`- \`${m.name}\` = \`${m.value}\`${descSuffix(m.description)}`);
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function renderVariablesRef(variables: ExtractedVariable[]): string {
  const lines = ['# Variables & Constants\n'];

  if (hasModuleInfo(variables)) {
    const groups = groupByModule(variables);
    for (const [mod, modVars] of groups) {
      if (mod) lines.push(`## ${mod}\n`);
      for (const v of modVars) {
        lines.push(mod ? `### \`${v.name}\`` : `## \`${v.name}\``);
        if (v.description) lines.push(v.description);
        const keyword = v.isConst ? 'const' : 'let';
        lines.push('```ts', `${keyword} ${v.name}: ${v.type}`, '```');
        lines.push('');
      }
    }
  } else {
    for (const v of variables) {
      lines.push(`## \`${v.name}\``);
      if (v.description) lines.push(v.description);
      const keyword = v.isConst ? 'const' : 'let';
      lines.push('```ts', `${keyword} ${v.name}: ${v.type}`, '```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ===========================================================================
// Shared helpers
// ===========================================================================

/**
 * When rendered content exceeds the token budget, split into per-group reference files
 * using @category or sourceModule. Falls back to a single truncated file if no groups.
 */
function addGroupedReferences<T extends { category?: string; sourceModule?: string }>(
  items: T[],
  basePath: string,
  kind: string,
  opts: SkillRenderOptions,
  renderFn: (subset: T[]) => string,
  references: RenderedFile[]
): void {
  const fullContent = renderFn(items);
  const fullTokens = estimateTokens(fullContent);

  // If it fits in the budget, emit as one file
  if (fullTokens <= opts.maxTokens) {
    references.push({
      filename: `${basePath}/references/${kind}.md`,
      content: fullContent,
      tokens: fullTokens
    });
    return;
  }

  // Try splitting by group (category or sourceModule)
  const grouped = groupByCategory(items);
  if (grouped.size <= 1) {
    // No groups — truncate as before
    references.push({
      filename: `${basePath}/references/${kind}.md`,
      content: truncateToTokenBudget(fullContent, opts.maxTokens),
      tokens: fullTokens
    });
    return;
  }

  // Emit one file per group in a subdirectory: references/<kind>/<group>.md
  // If a group still exceeds the budget, split into one file per item
  for (const [groupName, groupItems] of grouped) {
    const slug = groupName
      ? groupName
          .toLowerCase()
          .replace(/[^a-z0-9/]+/g, '-')
          .replace(/^-|-$/g, '')
      : 'other';
    const content = renderFn(groupItems);
    const tokens = estimateTokens(content);

    if (tokens <= opts.maxTokens || groupItems.length <= 1) {
      references.push({
        filename: `${basePath}/references/${kind}/${slug}.md`,
        content: truncateToTokenBudget(content, opts.maxTokens),
        tokens
      });
    } else {
      // Group still too large — split into one file per item
      for (const item of groupItems) {
        const itemSlug =
          'name' in item && typeof (item as any).name === 'string'
            ? (item as any).name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            : 'item';
        const itemContent = renderFn([item]);
        references.push({
          filename: `${basePath}/references/${kind}/${slug}/${itemSlug}.md`,
          content: truncateToTokenBudget(itemContent, opts.maxTokens),
          tokens: estimateTokens(itemContent)
        });
      }
    }
  }
}

function buildDescription(skill: ExtractedSkill): string {
  const desc = skill.packageDescription || skill.description || `API reference for ${skill.name}`;
  const parts: string[] = [desc];

  if (skill.keywords && skill.keywords.length > 0) {
    const useful = skill.keywords.filter(
      (k) =>
        !['typescript', 'javascript', 'node', 'nodejs', 'npm', 'library', 'package'].includes(
          k.toLowerCase()
        )
    );
    if (useful.length > 0) {
      parts.push(`Use when working with ${useful.join(', ')}.`);
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

function extractFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : '';
}

function renderDocumentation(skill: ExtractedSkill): string {
  if (!skill.documents || skill.documents.length === 0) return '';
  const lines = ['## Documentation\n'];
  for (const doc of skill.documents) {
    const firstSentence = extractFirstSentence(doc.content);
    const desc = firstSentence ? ` — ${firstSentence}` : '';
    lines.push(`- **${doc.title}**${desc}`);
  }
  return lines.join('\n');
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

  if (skill.keywords && skill.keywords.length > 0) {
    const useful = skill.keywords.filter(
      (k) =>
        !['typescript', 'javascript', 'node', 'nodejs', 'npm', 'library', 'package'].includes(
          k.toLowerCase()
        )
    );
    if (useful.length > 0) {
      triggers.push(`- Working with ${useful.join(', ')}`);
    }
  }

  // @useWhen triggers from JSDoc
  if (skill.useWhen && skill.useWhen.length > 0) {
    for (const item of skill.useWhen) {
      triggers.push(`- ${item}`);
    }
  }

  // @avoidWhen triggers from JSDoc
  if (skill.avoidWhen && skill.avoidWhen.length > 0) {
    triggers.push('');
    triggers.push('**Avoid when:**');
    for (const item of skill.avoidWhen) {
      triggers.push(`- ${item}`);
    }
  }

  const apiCategories: string[] = [];
  if (skill.functions.length > 0) apiCategories.push(`${skill.functions.length} functions`);
  if (skill.classes.length > 0) apiCategories.push(`${skill.classes.length} classes`);
  if (skill.types.length > 0) apiCategories.push(`${skill.types.length} types`);
  if (skill.enums.length > 0) apiCategories.push(`${skill.enums.length} enums`);
  if (skill.variables && skill.variables.length > 0)
    apiCategories.push(`${skill.variables.length} constants`);
  if (apiCategories.length > 0) {
    triggers.push(`- API surface: ${apiCategories.join(', ')}`);
  }

  if (triggers.length === 0) return '';
  return '## When to Use\n\n' + triggers.join('\n');
}

function renderPitfalls(skill: ExtractedSkill): string {
  if (!skill.pitfalls || skill.pitfalls.length === 0) return '';
  const lines = ['## Pitfalls\n'];
  for (const item of skill.pitfalls) {
    lines.push(`- ${item}`);
  }
  return lines.join('\n');
}

function renderQuickReference(skill: ExtractedSkill): string {
  const allItems = [
    ...skill.functions,
    ...skill.classes,
    ...skill.types,
    ...skill.enums,
    ...(skill.variables ?? [])
  ];

  if (allItems.length === 0) return '';

  if (hasModuleInfo(allItems)) {
    // Group all items by module and list names per module
    const groups = groupByModule(allItems);
    const lines: string[] = [];
    for (const [mod, modItems] of groups) {
      const names = modItems.map((item) => `\`${'name' in item ? item.name : ''}\``).join(', ');
      if (mod) {
        lines.push(`**${mod}:** ${names}`);
      } else {
        lines.push(names);
      }
    }
    return '## Quick Reference\n\n' + lines.join('\n');
  }

  // Flat by kind (existing behavior)
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
  if (skill.variables && skill.variables.length > 0) {
    items.push(
      `**${skill.variables.length} variables** — ${skill.variables.map((v) => `\`${v.name}\``).join(', ')}`
    );
  }

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
