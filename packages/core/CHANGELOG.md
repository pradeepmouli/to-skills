# @to-skills/core

## 0.10.3

### Patch Changes

- Split oversized reference files by category/module into subdirectories

  When rendered content exceeds the token budget and items have @category
  or sourceModule grouping, emit one reference file per group in
  references/<kind>/<group>.md instead of truncating into one file.

## 0.10.2

### Patch Changes

- Aggregate @useWhen/@avoidWhen/@pitfalls from classes, not just functions. Added tags field to ExtractedClass.

## 0.10.1

### Patch Changes

- Cap inline config surfaces at 5 in SKILL.md — large projects render a summary list

## 0.10.0

### Minor Changes

- Markdown & Docusaurus docs extraction
  - Generalized markdown doc parser (parseMarkdownDoc) with frontmatter, sections, code blocks
  - Docs directory scanner (scanDocs) with sidebar_position/filename-prefix ordering
  - Documentation section in SKILL.md listing available doc pages
  - @to-skills/docusaurus package: Docusaurus adapter with _category_.json support
  - TypeDoc plugin: skillsIncludeDocs + skillsDocsDir options for opt-in docs scanning

## 0.9.0

### Minor Changes

- CLI & config surface extraction
  - ExtractedConfigSurface types and config renderer in core
  - @config tag and *Options/*Config suffix detection in TypeDoc extractor
  - New @to-skills/cli package: commander introspection, --help parser, flag-to-property correlator
  - Config surfaces render as Commands and Configuration sections in SKILL.md
  - Detailed per-option documentation in references/commands.md and references/config.md

## 0.8.0

### Minor Changes

- JSDoc tag conventions for skill-judge compliance
  - Extract and render @useWhen, @avoidWhen, @pitfalls custom tags into SKILL.md sections
  - Extract @remarks for expert knowledge in references
  - @category-based grouping (overrides filename-derived sourceModule)
  - W7-W11 audit checks for tag presence
  - Bundled skill updated with tag documentation and examples
  - Projected skill-judge score: F (~42) → C+ (~94) with full adoption

## 0.7.0

### Minor Changes

- Add documentation audit engine with 20 checks, README parser, and bundled Claude Code skill
  - 20 audit checks across 4 severity levels (fatal/error/warning/alert)
  - README parser extracts blockquote, first paragraph, Quick Start, Features, Pitfalls
  - Human-readable and JSON audit output formatters
  - Audit runs automatically during `pnpm typedoc` (configurable via skillsAudit option)
  - 3 new TypeDoc options: skillsAudit, skillsAuditFailOnError, skillsAuditJson
  - Bundled `to-skills-docs` Claude Code skill for convention documentation and fix-it workflow

## 0.6.0

### Minor Changes

- Skill quality improvements: contextual descriptions, module-grouped references, empty description suppression, submodule flattening
  - SKILL.md description answers "what does this library do" instead of listing function names
  - When to Use shows keyword-based context instead of tautological "Calling fn()"
  - Quick Reference and references grouped by source module
  - Quick Start example in SKILL.md from module-level @example
  - Empty description trailing dashes suppressed
  - Nested submodule children flattened during extraction
  - sourceModule field on all extracted items for grouping
  - packageDescription from package.json flows through to SKILL.md

## 0.5.0

### Minor Changes

- Improve extraction coverage and rendering quality
  - Extract and render interface properties in types reference (previously empty for interfaces)
  - Extract and render variables/constants (previously silently dropped)
  - Extract and render function overloads (previously only first signature)
  - Render @deprecated, @since, @throws, @see tags in function references
  - Extract @returns prose descriptions
  - Extract class inheritance (extends/implements)

## 0.4.2

### Patch Changes

- Restore tsgo as build compiler, add types: ["node"] to tsconfig

## 0.4.1

### Patch Changes

- Fix skill name generation for PascalCase/camelCase module names

  toSkillName now converts camelCase/PascalCase to kebab-case before
  lowercasing. JsonSchema → json-schema, ZodBuilder → zod-builder.

## 0.4.0

### Minor Changes

- Progressive disclosure: SKILL.md is now a lean discovery document, with full API details in references/

  Skills now generate a file tree instead of a single monolithic file:
  - `SKILL.md` — frontmatter, overview, when-to-use, quick reference (~500 tokens)
  - `references/functions.md` — full function signatures, params, examples
  - `references/classes.md` — class details with constructors, methods, properties
  - `references/types.md` — type definitions and enums
  - `references/examples.md` — usage examples

  Agents load SKILL.md first (cheap), then fetch references on demand.

## 0.3.1

### Patch Changes

- Fix skill name derivation — prefer package.json name over TypeDoc project name, fix CI build order

## 0.3.0

### Minor Changes

- Enrich skills with package.json metadata and TypeDoc projectDocuments
  - Extract keywords, repository URL, author from package.json
  - Keywords incorporated into skill description triggers
  - Repository and author rendered as Links section
  - projectDocuments content merged into skill body
  - Added ExtractedDocument type for hand-written documentation

## 0.2.0

### Minor Changes

- Initial release of @to-skills/core — shared types, SKILL.md renderer, llms.txt renderer, and token budgeting for the to-skills plugin ecosystem.
