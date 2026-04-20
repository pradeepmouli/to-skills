# typedoc-plugin-to-skills

## 0.9.1

### Patch Changes

- Fix @remarks not extracted in single-package mode, deduplicate examples.md
  - extractModule now extracts @remarks from module comment (was only in mergeModules)
  - examples.md only created for 2+ examples (first example is Quick Start in SKILL.md body)

- Updated dependencies []:
  - @to-skills/typedoc@0.14.1

## 0.9.0

### Minor Changes

- [`f9cc01d`](https://github.com/pradeepmouli/to-skills/commit/f9cc01dc46bfe00467afe4e82eec6b557ca8e3f3) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - Surface @remarks as thinking framework, fix decision table Why column, broaden Quick Start aliases
  - Extract @remarks from @packageDocumentation and render in SKILL.md body (architectural context, trade-offs)
  - Decision table uses 2-column format (Task | Use) when no explicit reasons exist via " — " delimiter
  - When explicit " — " reasons exist, 3-column format (Task | Use | Why) with the author's reasoning
  - Add "cli usage", "basic usage", "installation" as Quick Start heading aliases

### Patch Changes

- Updated dependencies [[`f9cc01d`](https://github.com/pradeepmouli/to-skills/commit/f9cc01dc46bfe00467afe4e82eec6b557ca8e3f3)]:
  - @to-skills/typedoc@0.14.0

## 0.8.0

### Minor Changes

- Add loading triggers for reference files and populate decision table Why column
  - SKILL.md now has a "## References" section with scenario-based loading triggers
    telling agents when to read each reference file (functions, classes, config, docs, etc.)
  - Decision table "Why" column uses the source function/class description instead of blank "—"
  - Fixes the [#1](https://github.com/pradeepmouli/to-skills/issues/1) skill-judge structural failure: orphaned references (Pattern 3)

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.13.0

## 0.7.2

### Patch Changes

- Fix pitfall multi-line formatting, description keyword-stuffing, redundant keyword bullets
  - parseBulletList now joins continuation lines into preceding bullet (fixes split NEVER rules)
  - Description uses @useWhen triggers instead of mechanical keyword list when available
  - "When to Use" section skips keyword bullet when @useWhen decision tables exist

- Updated dependencies []:
  - @to-skills/typedoc@0.12.2

## 0.7.1

### Patch Changes

- Use per-package README in monorepos instead of always reading root README

  In monorepo mode (entryPointStrategy: "packages"), the plugin now tries to read
  each package's own README.md first, falling back to the root README only when
  no per-package README exists. This prevents the root README's Features, Quick Start,
  and Troubleshooting sections from being duplicated into every package skill.

- Updated dependencies []:
  - @to-skills/typedoc@0.12.1

## 0.7.0

### Minor Changes

- Document extraction overhaul, auto-tag registration, self-documenting params
  - Extract @document children recursively (was only top-level)
  - Deduplicate document titles using frontmatter category
  - Render {@link Foo} as `Foo` in extracted docs
  - Extract API references from "## API reference" sections for cross-linking
  - Organize doc references by category with per-category index files
  - Progressive disclosure in SKILL.md Documentation section
  - Auto-register custom blockTags and auto-move from modifierTags with warning
  - Wire avoidWhenSources for decision table rendering
  - Skip self-documenting params/returns in audit
  - Fix emoji-prefixed README headings
  - Add skill-judge as mandatory end gate in bundled skill workflow

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.12.0

## 0.6.6

### Patch Changes

- Split oversized reference files by category/module into subdirectories

  When rendered content exceeds the token budget and items have @category
  or sourceModule grouping, emit one reference file per group in
  references/<kind>/<group>.md instead of truncating into one file.

- Updated dependencies []:
  - @to-skills/typedoc@0.11.4

## 0.6.5

### Patch Changes

- Aggregate @useWhen/@avoidWhen/@pitfalls from classes, not just functions. Added tags field to ExtractedClass.

- Updated dependencies []:
  - @to-skills/typedoc@0.11.3

## 0.6.4

### Patch Changes

- Cap inline config surfaces at 5 in SKILL.md — large projects render a summary list

- Updated dependencies []:
  - @to-skills/typedoc@0.11.2

## 0.6.3

### Patch Changes

- Fix config surface detection to include type aliases, not just interfaces

- Updated dependencies []:
  - @to-skills/typedoc@0.11.1

## 0.6.2

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.11.0

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.10.0

## 0.6.0

### Minor Changes

- JSDoc tag conventions for skill-judge compliance
  - Extract and render @useWhen, @avoidWhen, @pitfalls custom tags into SKILL.md sections
  - Extract @remarks for expert knowledge in references
  - @category-based grouping (overrides filename-derived sourceModule)
  - W7-W11 audit checks for tag presence
  - Bundled skill updated with tag documentation and examples
  - Projected skill-judge score: F (~42) → C+ (~94) with full adoption

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.9.0

## 0.5.1

### Patch Changes

- Scope audit to first-party workspace packages only — skip third-party deps that TypeDoc processes

- Updated dependencies []:
  - @to-skills/typedoc@0.8.1

## 0.5.0

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
  - @to-skills/typedoc@0.8.0

## 0.4.4

### Patch Changes

- Skill quality improvements: contextual descriptions, module-grouped references, empty description suppression, submodule flattening
  - SKILL.md description answers "what does this library do" instead of listing function names
  - When to Use shows keyword-based context instead of tautological "Calling fn()"
  - Quick Reference and references grouped by source module
  - Quick Start example in SKILL.md from module-level @example
  - Empty description trailing dashes suppressed
  - Nested submodule children flattened during extraction
  - sourceModule field on all extracted items for grouping
  - packageDescription from package.json flows through to SKILL.md

- Updated dependencies []:
  - @to-skills/typedoc@0.7.0

## 0.4.3

### Patch Changes

- Fix spurious skills from barrel re-export submodules (array, string, fixtures, mocks, etc.)

- Updated dependencies []:
  - @to-skills/typedoc@0.6.1

## 0.4.2

### Patch Changes

- Improve extraction coverage and rendering quality
  - Extract and render interface properties in types reference (previously empty for interfaces)
  - Extract and render variables/constants (previously silently dropped)
  - Extract and render function overloads (previously only first signature)
  - Render @deprecated, @since, @throws, @see tags in function references
  - Extract @returns prose descriptions
  - Extract class inheritance (extends/implements)

- Updated dependencies []:
  - @to-skills/typedoc@0.6.0

## 0.4.1

### Patch Changes

- Restore tsgo as build compiler, add types: ["node"] to tsconfig

- Updated dependencies []:
  - @to-skills/typedoc@0.5.1

## 0.4.0

### Minor Changes

- Fix monorepo support: accumulate skills across converter runs
  - Accumulate extracted skills across multiple converter invocations
    (fixes entryPointStrategy: "packages" where TypeDoc runs per-package)
  - Write all skills once after rendering completes (postRenderAsyncJobs)
  - Deduplicate skills by name (merge modules from same package)
  - Resolve package names from nearest package.json via source file paths
  - llms.txt now generates correctly for monorepos

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.5.0

## 0.3.2

### Patch Changes

- Fix skill name generation for PascalCase/camelCase module names

  toSkillName now converts camelCase/PascalCase to kebab-case before
  lowercasing. JsonSchema → json-schema, ZodBuilder → zod-builder.

- Updated dependencies []:
  - @to-skills/typedoc@0.4.2

## 0.3.1

### Patch Changes

- Fix monorepo skill naming — use per-module name instead of root package.json name

  In monorepos with entryPointStrategy: "packages", each module now gets
  its correct package name (e.g. @lspeasy/core) instead of the workspace
  root name (e.g. lspeasy).

- Updated dependencies []:
  - @to-skills/typedoc@0.4.1

## 0.3.0

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
  - @to-skills/typedoc@0.4.0

## 0.2.2

### Patch Changes

- Fix skill name derivation — prefer package.json name over TypeDoc project name, fix CI build order

- Updated dependencies []:
  - @to-skills/typedoc@0.3.1

## 0.2.1

### Patch Changes

- Enrich skills with package.json metadata and TypeDoc projectDocuments
  - Extract keywords, repository URL, author from package.json
  - Keywords incorporated into skill description triggers
  - Repository and author rendered as Links section
  - projectDocuments content merged into skill body
  - Added ExtractedDocument type for hand-written documentation

- Updated dependencies []:
  - @to-skills/typedoc@0.3.0

## 0.2.0

### Minor Changes

- Initial release of typedoc-plugin-to-skills — auto-discovery wrapper for @to-skills/typedoc. Install this package and TypeDoc finds it automatically — no plugin config needed.

### Patch Changes

- Updated dependencies []:
  - @to-skills/typedoc@0.2.0
