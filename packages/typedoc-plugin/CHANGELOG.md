# typedoc-plugin-to-skills

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
