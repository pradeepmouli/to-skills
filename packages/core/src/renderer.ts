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

  // --- Compute available reference categories for loading triggers ---
  const refCategories: string[] = [];
  if (skill.functions.length > 0) refCategories.push('functions');
  if (skill.classes.length > 0) refCategories.push('classes');
  if (skill.types.length > 0) refCategories.push('types');
  if (skill.enums.length > 0) refCategories.push('enums');
  if (skill.variables.length > 0) refCategories.push('variables');
  if (skill.configSurfaces && skill.configSurfaces.length > 0) refCategories.push('config');
  if (skill.documents && skill.documents.length > 0) refCategories.push('docs');
  if (opts.includeExamples && skill.examples.length > 1) refCategories.push('examples');

  // --- SKILL.md: lean discovery document ---
  const skillContent = renderSkillMd(skill, skillName, opts, refCategories);

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
    // Group docs by category for index files
    const byCategory = new Map<string, typeof skill.documents>();
    for (const doc of skill.documents) {
      const cat = doc.category ?? '_uncategorized';
      const list = byCategory.get(cat) ?? [];
      list.push(doc);
      byCategory.set(cat, list);
    }

    // Generate per-category index files
    for (const [cat, docs] of byCategory) {
      if (cat === '_uncategorized' && docs.length < 3) continue; // skip tiny uncategorized groups
      const subdir = cat === '_uncategorized' ? 'docs' : `docs/${cat}`;
      const indexLines = [`# ${cat === '_uncategorized' ? 'Documentation' : cat}\n`];
      for (const doc of docs) {
        const desc = doc.description ? ` — ${doc.description}` : '';
        indexLines.push(`- [${doc.title}](${toFilename(doc.title)}.md)${desc}`);
      }
      references.push({
        filename: `${basePath}/references/${subdir}/index.md`,
        content: indexLines.join('\n'),
        tokens: estimateTokens(indexLines.join('\n'))
      });
    }

    // Generate individual doc files
    for (const doc of skill.documents) {
      let footer = '';
      if (doc.apiRefs && doc.apiRefs.length > 0) {
        footer = '\n\n---\n\n**See also:** ' + doc.apiRefs.map((r) => `\`${r}\``).join(', ');
      }
      const hasHeading = /^#\s/.test(doc.content);
      const content = hasHeading
        ? `${doc.content}${footer}`
        : `# ${doc.title}\n\n${doc.content}${footer}`;
      const subdir = doc.category ? `docs/${doc.category}` : 'docs';
      references.push({
        filename: `${basePath}/references/${subdir}/${toFilename(doc.title)}.md`,
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

function renderSkillMd(
  skill: ExtractedSkill,
  skillName: string,
  opts: SkillRenderOptions,
  refCategories?: string[]
): string {
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

  // @remarks from @packageDocumentation — architectural context, trade-offs, mental models
  if (skill.remarks) {
    sections.push(skill.remarks);
  }

  // Features section from README — inline in SKILL.md
  if (skill.readmeFeatures) {
    sections.push('## Features\n\n' + skill.readmeFeatures);
  }

  // Quick Start example (first module-level example)
  if (opts.includeExamples && skill.examples.length > 0) {
    sections.push('## Quick Start\n\n' + skill.examples[0]);
  }

  // Additional examples beyond Quick Start
  if (opts.includeExamples && skill.examples.length > 1) {
    const lines = ['## Examples\n'];
    for (const ex of skill.examples.slice(1)) {
      lines.push(ex);
      lines.push('\n---\n');
    }
    sections.push(lines.join('\n'));
  }

  const whenToUse = renderWhenToUse(skill);
  if (whenToUse) sections.push(whenToUse);

  const pitfalls = renderPitfalls(skill);
  if (pitfalls) sections.push(pitfalls);

  // Troubleshooting section from README — inline in SKILL.md
  if (skill.readmeTroubleshooting) {
    sections.push('## Troubleshooting\n\n' + skill.readmeTroubleshooting);
  }

  const configSection = renderConfigSurfaceSection(skill.configSurfaces);
  if (configSection) sections.push(configSection);

  const quickRef = renderQuickReference(skill);
  if (quickRef) sections.push(quickRef);

  const docs = renderDocumentation(skill);
  if (docs) sections.push(docs);

  if (refCategories && refCategories.length > 0) {
    sections.push(renderLoadingTriggers(refCategories));
  }

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

function renderClassBody(
  cls: ExtractedClass,
  opts: SkillRenderOptions,
  lines: string[],
  parentPropNames?: Set<string>
): void {
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
    const ownProps = parentPropNames
      ? cls.properties.filter((p) => !parentPropNames.has(p.name))
      : cls.properties;
    const inheritedCount = cls.properties.length - ownProps.length;

    if (ownProps.length > 0) {
      lines.push('**Properties:**');
      for (const p of ownProps) {
        const opt = p.optional ? ' (optional)' : '';
        lines.push(`- \`${p.name}: ${p.type}\`${opt}${descSuffix(p.description)}`);
      }
    }

    if (inheritedCount > 0 && cls.extends) {
      const parentSlug = cls.extends
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      lines.push(
        `*Inherits ${inheritedCount} properties from \`${cls.extends}\` — see [\`${cls.extends}\`](../${parentSlug}.md)*`
      );
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

  // Build a map of class name → property name set for deduplication
  const classPropMap = new Map<string, Set<string>>();
  for (const cls of classes) {
    classPropMap.set(cls.name, new Set(cls.properties.map((p) => p.name)));
  }

  function getParentProps(cls: ExtractedClass): Set<string> | undefined {
    if (!cls.extends) return undefined;
    return classPropMap.get(cls.extends);
  }

  if (hasModuleInfo(classes)) {
    const groups = groupByModule(classes);
    for (const [mod, modClasses] of groups) {
      if (mod) lines.push(`## ${mod}\n`);
      for (const cls of modClasses) {
        lines.push(mod ? `### \`${cls.name}\`` : `## \`${cls.name}\``);
        renderClassBody(cls, opts, lines, getParentProps(cls));
      }
    }
  } else {
    for (const cls of classes) {
      lines.push(`## \`${cls.name}\``);
      renderClassBody(cls, opts, lines, getParentProps(cls));
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
      const indexRows: string[] = [];
      for (const item of groupItems) {
        const itemName =
          'name' in item && typeof (item as any).name === 'string' ? (item as any).name : 'item';
        const itemDescription =
          'description' in item && typeof (item as any).description === 'string'
            ? (item as any).description
            : '';
        const itemSlug = itemName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const itemContent = renderFn([item]);
        // Use 2× budget for individual item files — they're already scoped to one item
        references.push({
          filename: `${basePath}/references/${kind}/${slug}/${itemSlug}.md`,
          content: truncateToTokenBudget(itemContent, opts.maxTokens * 2),
          tokens: estimateTokens(itemContent)
        });
        indexRows.push(`| [${itemName}](${itemSlug}.md) | ${itemDescription} |`);
      }

      // Emit an index.md for this subdirectory
      const indexContent = [
        `# ${groupName || slug}`,
        '',
        '| Class | Description |',
        '|-------|-------------|',
        ...indexRows
      ].join('\n');
      references.push({
        filename: `${basePath}/references/${kind}/${slug}/index.md`,
        content: indexContent,
        tokens: estimateTokens(indexContent)
      });
    }
  }
}

function buildDescription(skill: ExtractedSkill): string {
  const desc = skill.packageDescription || skill.description || `API reference for ${skill.name}`;
  const parts: string[] = [desc];

  // Prefer @useWhen triggers for activation scenarios (agent-friendly)
  // Fall back to keyword list only when no triggers exist
  if (skill.useWhen && skill.useWhen.length > 0) {
    const triggers = skill.useWhen.slice(0, 3).join('; ');
    parts.push(`Use when: ${triggers}.`);
  } else if (skill.keywords && skill.keywords.length > 0) {
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

  // Group by category
  const categorized = new Map<string, typeof skill.documents>();
  const uncategorized: typeof skill.documents = [];
  for (const doc of skill.documents) {
    if (doc.category) {
      const list = categorized.get(doc.category) ?? [];
      list.push(doc);
      categorized.set(doc.category, list);
    } else {
      uncategorized.push(doc);
    }
  }

  if (categorized.size > 1) {
    // Progressive disclosure: category summary → index files → individual docs
    // Use parent doc's description for category summary, fall back to doc title list
    for (const [category, docs] of categorized) {
      const parentDoc = docs.find((d) => d.isParent);
      const desc = parentDoc?.description ?? docs.map((d) => d.title).join(', ');
      lines.push(`- **${category}** (${docs.length}) — ${desc}`);
    }
    if (uncategorized.length > 0) {
      for (const doc of uncategorized) {
        const desc = doc.description ?? extractFirstSentence(doc.content);
        lines.push(`- **${doc.title}**${desc ? ` — ${desc}` : ''}`);
      }
    }
  } else {
    // Few docs — flat list with descriptions
    for (const doc of skill.documents) {
      const desc = doc.description ?? extractFirstSentence(doc.content);
      lines.push(`- **${doc.title}**${desc ? ` — ${desc}` : ''}`);
    }
  }

  lines.push('');
  lines.push(`See \`references/docs/\` for full guides (${skill.documents.length} total).`);
  return lines.join('\n');
}

/** Scenario-based loading triggers for reference files */
function renderLoadingTriggers(categories: string[]): string {
  const triggerMap: Record<string, string> = {
    functions:
      'When calling any function → read `references/functions.md` for full signatures, parameters, and return types',
    classes:
      'When using a class → read `references/classes/` for properties, methods, and inheritance',
    types: 'When defining typed variables or function parameters → read `references/types.md`',
    enums: 'When using enum values → read `references/enums.md`',
    variables: 'When using exported constants → read `references/variables.md`',
    config: 'When configuring options → read `references/config.md` for all settings and defaults',
    docs: 'When learning concepts or workflows → browse `references/docs/` by category',
    examples: 'For additional usage patterns → read `references/examples.md`'
  };

  const lines = ['## References\n'];
  lines.push('Load these on demand — do NOT read all at once:\n');
  for (const cat of categories) {
    const trigger = triggerMap[cat];
    if (trigger) lines.push(`- ${trigger}`);
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
  const lines: string[] = [];

  // Only show keyword bullet when no @useWhen triggers exist (avoids redundancy)
  const hasUseTriggers =
    (skill.useWhenSources && skill.useWhenSources.length > 0) ||
    (skill.useWhen && skill.useWhen.length > 0);
  if (!hasUseTriggers && skill.keywords && skill.keywords.length > 0) {
    const useful = skill.keywords.filter(
      (k) =>
        !['typescript', 'javascript', 'node', 'nodejs', 'npm', 'library', 'package'].includes(
          k.toLowerCase()
        )
    );
    if (useful.length > 0) {
      lines.push(`- Working with ${useful.join(', ')}`);
    }
  }

  // @useWhen triggers: render as decision table when multiple sources (different classes/functions)
  if (skill.useWhenSources && skill.useWhenSources.length > 0) {
    const sources = skill.useWhenSources;
    // Check if items come from multiple distinct named sources
    const distinctSources = new Set(sources.map((s) => s.sourceName));
    if (distinctSources.size > 1) {
      // Check if any entries have explicit " — " reasons
      const hasExplicitReasons = sources.some((s) => s.text.includes(' — '));

      if (hasExplicitReasons) {
        // 3-column table with Why from explicit " — " delimiter
        const tableLines: string[] = ['| Task | Use | Why |', '|------|-----|-----|'];
        for (const src of sources) {
          const dashIdx = src.text.indexOf(' — ');
          if (dashIdx !== -1) {
            const task = src.text.slice(0, dashIdx).trim();
            const why = src.text.slice(dashIdx + 3).trim();
            tableLines.push(`| ${task} | \`${src.sourceName}\` | ${why} |`);
          } else {
            tableLines.push(`| ${src.text} | \`${src.sourceName}\` | — |`);
          }
        }
        lines.push('');
        lines.push(...tableLines);
      } else {
        // 2-column table — no Why column (avoids repetitive descriptions)
        const tableLines: string[] = ['| Task | Use |', '|------|-----|'];
        for (const src of sources) {
          tableLines.push(`| ${src.text} | \`${src.sourceName}\` |`);
        }
        lines.push('');
        lines.push(...tableLines);
      }
    } else {
      // Single source — flat list as before
      for (const src of sources) {
        lines.push(`- ${src.text}`);
      }
    }
  } else if (skill.useWhen && skill.useWhen.length > 0) {
    // Fallback: flat list (skill was not produced by extractor with source tracking)
    for (const item of skill.useWhen) {
      lines.push(`- ${item}`);
    }
  }

  // @avoidWhen triggers from JSDoc — decision table when multiple sources
  if (skill.avoidWhenSources && skill.avoidWhenSources.length > 0) {
    const sources = skill.avoidWhenSources;
    const distinctSources = new Set(sources.map((s) => s.sourceName));
    lines.push('');
    if (distinctSources.size > 1) {
      lines.push('**Avoid when:**');
      lines.push('');
      lines.push("| Don't Use | When | Use Instead |");
      lines.push('|-----------|------|-------------|');
      for (const src of sources) {
        const dashIdx = src.text.indexOf(' — ');
        if (dashIdx !== -1) {
          const scenario = src.text.slice(0, dashIdx).trim();
          const alternative = src.text.slice(dashIdx + 3).trim();
          lines.push(`| \`${src.sourceName}\` | ${scenario} | ${alternative} |`);
        } else {
          lines.push(`| \`${src.sourceName}\` | ${src.text} | — |`);
        }
      }
    } else {
      lines.push('**Avoid when:**');
      for (const src of sources) {
        lines.push(`- ${src.text}`);
      }
    }
  } else if (skill.avoidWhen && skill.avoidWhen.length > 0) {
    lines.push('');
    lines.push('**Avoid when:**');
    for (const item of skill.avoidWhen) {
      lines.push(`- ${item}`);
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
    lines.push(`- API surface: ${apiCategories.join(', ')}`);
  }

  if (lines.length === 0) return '';
  return '## When to Use\n\n' + lines.join('\n');
}

function renderPitfalls(skill: ExtractedSkill): string {
  if (!skill.pitfalls || skill.pitfalls.length === 0) return '';
  const lines = ['## Pitfalls\n'];
  for (const item of skill.pitfalls) {
    lines.push(`- ${item}`);
  }
  return lines.join('\n');
}

/** Extract the first sentence (or first meaningful phrase) from a description */
function firstSentence(desc: string): string {
  if (!desc) return '';
  const match = desc.match(/^[^.!?]*[.!?]/);
  if (match) return match[0].trim().replace(/[.!?]$/, '');
  // No sentence terminator — use up to first comma or 60 chars
  const commaIdx = desc.indexOf(',');
  if (commaIdx > 0 && commaIdx <= 60) return desc.slice(0, commaIdx).trim();
  if (desc.length <= 60) return desc.trim();
  return desc.slice(0, 57).trim() + '...';
}

/** Format an item as "`Name` (desc)" — omit desc when empty */
function compactItem(name: string, description: string): string {
  const label = firstSentence(description);
  return label ? `\`${name}\` (${label})` : `\`${name}\``;
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
    // Group all items by module and render compact entries with descriptions
    const groups = groupByModule(allItems);
    const lines: string[] = [];
    for (const [mod, modItems] of groups) {
      const entries = modItems.map((item) => {
        const name = 'name' in item ? (item as { name: string }).name : '';
        const desc = 'description' in item ? (item as { description: string }).description : '';
        return compactItem(name, desc);
      });
      if (mod) {
        lines.push(`**${mod}:** ${entries.join(', ')}`);
      } else {
        lines.push(entries.join(', '));
      }
    }
    return '## Quick Reference\n\n' + lines.join('\n');
  }

  // Flat by kind — compact format with descriptions
  const items: string[] = [];

  if (skill.functions.length > 0) {
    const entries = skill.functions.map((f) => compactItem(f.name, f.description));
    items.push(`**${skill.functions.length} functions** — ${entries.join(', ')}`);
  }
  if (skill.classes.length > 0) {
    const entries = skill.classes.map((c) => compactItem(c.name, c.description));
    items.push(`**${skill.classes.length} classes** — ${entries.join(', ')}`);
  }
  if (skill.types.length > 0) {
    const entries = skill.types.map((t) => compactItem(t.name, t.description));
    items.push(`**${skill.types.length} types** — ${entries.join(', ')}`);
  }
  if (skill.enums.length > 0) {
    const entries = skill.enums.map((e) => compactItem(e.name, e.description));
    items.push(`**${skill.enums.length} enums** — ${entries.join(', ')}`);
  }
  if (skill.variables && skill.variables.length > 0) {
    const entries = skill.variables.map((v) => compactItem(v.name, v.description));
    items.push(`**${skill.variables.length} variables** — ${entries.join(', ')}`);
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
