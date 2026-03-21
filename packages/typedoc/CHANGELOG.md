# @to-skills/typedoc

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
