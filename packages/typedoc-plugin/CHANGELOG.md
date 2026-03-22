# typedoc-plugin-to-skills

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
