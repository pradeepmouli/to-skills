---
name: to-skills-typedoc
description: 'TypeDoc plugin that generates AI agent skills (SKILL.md) from TypeScript API documentation Use when working with agent-skills, ai, documentation, llm, skill-md, typedoc, typedoc-plugin.'
license: MIT
---

# @to-skills/typedoc

TypeDoc plugin that generates AI agent skills (SKILL.md) from TypeScript API documentation

## When to Use

- Working with agent-skills, ai, documentation, llm, skill-md, typedoc, typedoc-plugin
- API surface: 1 functions

## Configuration

### SkillsPluginOptions

Configuration options for typedoc-plugin-to-skills.

| Key                       | Type      | Required | Default | Description                                                     |
| ------------------------- | --------- | -------- | ------- | --------------------------------------------------------------- |
| `skillsOutDir`            | `string`  | no       | —       | Output directory for generated skill files                      |
| `skillsPerPackage`        | `boolean` | no       | —       | Emit one skill per package in a monorepo                        |
| `skillsIncludeExamples`   | `boolean` | no       | —       | Include usage examples from                                     |
| `skillsIncludeSignatures` | `boolean` | no       | —       | Include type signatures in skill output                         |
| `skillsMaxTokens`         | `number`  | no       | —       | Maximum approximate token budget per skill file                 |
| `skillsNamePrefix`        | `string`  | no       | —       | Custom prefix for skill names                                   |
| `skillsLicense`           | `string`  | no       | —       | License for generated skills (reads from package.json if empty) |
| `llmsTxt`                 | `boolean` | no       | —       | Generate llms.txt and llms-full.txt alongside skills            |
| `llmsTxtOutDir`           | `string`  | no       | —       | Output directory for llms.txt files                             |
| `skillsAudit`             | `boolean` | no       | —       | Run documentation audit during skill generation                 |
| `skillsAuditFailOnError`  | `boolean` | no       | —       | Fail build on fatal or error severity audit issues              |
| `skillsAuditJson`         | `string`  | no       | —       | Path to write JSON audit report (empty = don't write)           |
| `skillsIncludeDocs`       | `boolean` | no       | —       | Include prose docs from docs/ directory alongside API skills    |
| `skillsDocsDir`           | `string`  | no       | —       | Directory containing prose documentation                        |

## Quick Reference

**plugin:** `load`

## Links

- [Repository](https://github.com/pradeepmouli/to-skills)
- Author: Pradeep Mouli
