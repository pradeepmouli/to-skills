# @to-skills/typedoc

## 0.8.1

### Patch Changes

- Scope audit to first-party workspace packages only — skip third-party deps that TypeDoc processes

## 0.8.0

### Minor Changes

- Add documentation audit engine with 20 checks, README parser, and bundled Claude Code skill
  - 20 audit checks across 4 severity levels (fatal/error/warning/alert)
  - README parser extracts blockquote, first paragraph, Quick Start, Features, Pitfalls
  - Human-readable and JSON audit output formatters
  - Audit runs automatically during `pnpm typedoc` (configurable via skillsAudit option)
  - 3 new TypeDoc options: skillsAudit, skillsAuditFailOnError, skillsAuditJson
  - Bundled `to-skills-docs` Claude Code skill for convention documentation and fix-it workflow

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.7.0

## 0.7.0

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

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.6.0

## 0.6.1

### Patch Changes

- Fix spurious skills from barrel re-export submodules (array, string, fixtures, mocks, etc.)

## 0.6.0

### Minor Changes

- Improve extraction coverage and rendering quality
  - Extract and render interface properties in types reference (previously empty for interfaces)
  - Extract and render variables/constants (previously silently dropped)
  - Extract and render function overloads (previously only first signature)
  - Render @deprecated, @since, @throws, @see tags in function references
  - Extract @returns prose descriptions
  - Extract class inheritance (extends/implements)

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.5.0

## 0.5.1

### Patch Changes

- Restore tsgo as build compiler, add types: ["node"] to tsconfig

- Updated dependencies []:
  - @to-skills/core@0.4.2

## 0.5.0

### Minor Changes

- Fix monorepo support: accumulate skills across converter runs
  - Accumulate extracted skills across multiple converter invocations
    (fixes entryPointStrategy: "packages" where TypeDoc runs per-package)
  - Write all skills once after rendering completes (postRenderAsyncJobs)
  - Deduplicate skills by name (merge modules from same package)
  - Resolve package names from nearest package.json via source file paths
  - llms.txt now generates correctly for monorepos

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.4.1

## 0.4.1

### Patch Changes

- Fix monorepo skill naming — use per-module name instead of root package.json name

  In monorepos with entryPointStrategy: "packages", each module now gets
  its correct package name (e.g. @lspeasy/core) instead of the workspace
  root name (e.g. lspeasy).

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

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.4.0

## 0.3.1

### Patch Changes

- Fix skill name derivation — prefer package.json name over TypeDoc project name, fix CI build order

- Updated dependencies []:
  - @to-skills/core@0.3.1

## 0.3.0

### Minor Changes

- Enrich skills with package.json metadata and TypeDoc projectDocuments
  - Extract keywords, repository URL, author from package.json
  - Keywords incorporated into skill description triggers
  - Repository and author rendered as Links section
  - projectDocuments content merged into skill body
  - Added ExtractedDocument type for hand-written documentation

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.3.0

## 0.2.0

### Minor Changes

- Initial release of @to-skills/typedoc — TypeDoc plugin that generates AI agent skills (SKILL.md) and optionally llms.txt from TypeScript API documentation. Outputs to skills/ for discovery via `npx skills add`.

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.2.0
