---
name: to-skills
description: Generate structured AI agent skills (SKILL.md) and llms.txt from your TypeScript API documentation
license: MIT
---

# to-skills

Generate structured AI agent skills (SKILL.md) and llms.txt from your TypeScript API documentation

## When to Use

- You have one or more ExtractedSkill objects and need SKILL.md + references/ output
- Building a custom extraction pipeline that bypasses the TypeDoc plugin
- You need fine-grained control over rendering a single skill
- You have RenderedSkill objects from renderSkills() and need to persist them to the filesystem
- Building a custom pipeline that separates rendering from writing (e.g., for preview or dry-run)
- You need structured README sections for audit context or skill enrichment
- The audit engine calls this to check for Features and Pitfalls sections
- You want programmatic quality feedback on JSDoc coverage before publishing skills
- Building a CI gate that blocks PRs with undocumented exports
- You have hand-written prose docs (tutorials, guides, architecture) in a docs/ directory
- You want these docs included alongside API skills for richer agent context
- You have ParsedMarkdownDoc objects from scanDocs() and need to attach them to an ExtractedSkill

**Avoid when:**

- Rapid local iteration where audit noise slows you down — use the skillsAudit: false option instead
- Your docs/ directory contains only auto-generated API docs — they duplicate the TypeDoc output
- API surface: 15 functions, 24 types

## Pitfalls

- NEVER set maxTokens below 500 — reference files become truncated mid-signature, producing broken code blocks that confuse LLMs
- NEVER pass skills with empty `name` — the output directory becomes a bare `/` path
- NEVER set maxTokens below 500 — reference files become truncated mid-signature, producing broken code blocks

## Configuration

### SkillRenderOptions

Options controlling skill rendering

| Key                 | Type      | Required | Default | Description                                                         |
| ------------------- | --------- | -------- | ------- | ------------------------------------------------------------------- |
| `outDir`            | `string`  | yes      | —       | Output directory for skill files (default: ".github/skills")        |
| `includeExamples`   | `boolean` | yes      | —       | Include usage examples (default: true)                              |
| `includeSignatures` | `boolean` | yes      | —       | Include type signatures (default: true)                             |
| `maxTokens`         | `number`  | yes      | —       | Maximum approximate token budget per skill (default: 4000)          |
| `namePrefix`        | `string`  | yes      | —       | Custom name prefix                                                  |
| `license`           | `string`  | yes      | —       | License to include in frontmatter (default: read from package.json) |

### LlmsTxtOptions

| Key                  | Type     | Required | Default | Description                                   |
| -------------------- | -------- | -------- | ------- | --------------------------------------------- |
| `projectName`        | `string` | yes      | —       | Project name (falls back to first skill name) |
| `projectDescription` | `string` | yes      | —       | Project description                           |

### DocsExtractionOptions

Configuration options that control how a docs directory is scanned and which
markdown files are included in the extraction.

| Key       | Type      | Required   | Default | Description                                                                        |
| --------- | --------- | ---------- | ------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `docsDir` | `string`  | yes        | —       | Absolute or relative path to the directory containing markdown documentation files |
| `include` | `string   | undefined` | yes     | —                                                                                  | Glob pattern selecting files to include; when `undefined` all `.md` files are included |
| `exclude` | `string[] | undefined` | yes     | —                                                                                  | Glob patterns for files to exclude from extraction; `undefined` means no exclusions    |
| `maxDocs` | `number   | undefined` | yes     | —                                                                                  | Maximum number of documents to return; `undefined` means no limit                      |

## Quick Reference

**Rendering:** `renderSkills`, `renderSkill`
**I/O:** `writeSkills`
**Token Management:** `estimateTokens`, `truncateToTokenBudget`
**llms-txt:** `renderLlmsTxt`, `LlmsTxtResult`
**Parsing:** `parseReadme`, `parseMarkdownDoc`, `scanDocs`, `docsToExtractedDocuments`
**Audit:** `auditSkill`, `formatAuditText`, `formatAuditJson`
**config-renderer:** `renderConfigSurfaceSection`, `renderConfigReference`
**types:** `ExtractedSkill`, `ExtractedFunction`, `ExtractedClass`, `ExtractedType`, `ExtractedEnum`, `ExtractedParameter`, `ExtractedProperty`, `ExtractedVariable`, `ExtractedDocument`, `RenderedFile`, `RenderedSkill`
**audit-types:** `AuditSeverity`, `AuditIssue`, `AuditPass`, `AuditContext`, `ParsedReadme`, `AuditResult`
**config-types:** `ConfigSourceType`, `ExtractedConfigSurface`, `ExtractedConfigOption`, `ExtractedConfigArgument`
**markdown-types:** `ParsedSection`, `ParsedMarkdownDoc`

## Links

- [Repository](https://github.com/pradeepmouli/to-skills)
- Author: Pradeep Mouli
