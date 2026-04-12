# @to-skills/docusaurus

## 0.2.0

### Minor Changes

- Markdown & Docusaurus docs extraction
  - Generalized markdown doc parser (parseMarkdownDoc) with frontmatter, sections, code blocks
  - Docs directory scanner (scanDocs) with sidebar_position/filename-prefix ordering
  - Documentation section in SKILL.md listing available doc pages
  - @to-skills/docusaurus package: Docusaurus adapter with _category_.json support
  - TypeDoc plugin: skillsIncludeDocs + skillsDocsDir options for opt-in docs scanning

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.10.0
