# @to-skills/core

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
