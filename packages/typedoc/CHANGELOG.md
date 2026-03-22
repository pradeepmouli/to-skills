# @to-skills/typedoc

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
