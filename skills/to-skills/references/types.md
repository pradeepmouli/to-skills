# Types & Enums

## types

### `ExtractedSkill`

Extracted API surface for a single package/module
**Properties:**

- `name: string` — Package or module name
- `description: string` — Package description
- `license: string` (optional) — License identifier (e.g. "MIT", "Apache-2.0")
- `keywords: string[]` (optional) — Keywords from package.json — used to enrich trigger descriptions
- `repository: string` (optional) — Repository URL
- `author: string` (optional) — Author name
- `packageDescription: string` (optional) — Package description from package.json or README intro — used for SKILL.md description and body
- `documents: ExtractedDocument[]` (optional) — Additional documentation content (from projectDocuments, README, etc.)
- `functions: ExtractedFunction[]` — Exported functions
- `classes: ExtractedClass[]` — Exported classes
- `types: ExtractedType[]` — Exported interfaces and type aliases
- `enums: ExtractedEnum[]` — Exported enums
- `variables: ExtractedVariable[]` — Exported variables and constants
- `examples: string[]` — Usage examples from

### `ExtractedFunction`

**Properties:**

- `name: string`
- `description: string`
- `signature: string`
- `parameters: ExtractedParameter[]`
- `returnType: string`
- `returnsDescription: string` (optional) — Prose description from
- `examples: string[]`
- `tags: Record<string, string>`
- `overloads: string[]` (optional) — Additional overload signatures (if function has multiple signatures)
- `sourceModule: string` (optional) — Source module name derived from file path (e.g. "renderer", "tokens")

### `ExtractedClass`

**Properties:**

- `name: string`
- `description: string`
- `constructorSignature: string`
- `methods: ExtractedFunction[]`
- `properties: ExtractedProperty[]`
- `examples: string[]`
- `extends: string` (optional) — Base class name (from `extends`)
- `implements: string[]` (optional) — Implemented interface names (from `implements`)
- `sourceModule: string` (optional) — Source module name derived from file path (e.g. "renderer", "tokens")

### `ExtractedType`

**Properties:**

- `name: string`
- `description: string`
- `definition: string`
- `properties: ExtractedProperty[]` (optional)
- `sourceModule: string` (optional) — Source module name derived from file path (e.g. "renderer", "tokens")

### `ExtractedEnum`

**Properties:**

- `name: string`
- `description: string`
- `members: { name: string; value: string; description: string }[]`
- `sourceModule: string` (optional) — Source module name derived from file path (e.g. "renderer", "tokens")

### `ExtractedParameter`

**Properties:**

- `name: string`
- `type: string`
- `description: string`
- `optional: boolean`
- `defaultValue: string` (optional)

### `ExtractedProperty`

**Properties:**

- `name: string`
- `type: string`
- `description: string`
- `optional: boolean`

### `ExtractedVariable`

**Properties:**

- `name: string`
- `type: string`
- `description: string`
- `isConst: boolean`
- `sourceModule: string` (optional) — Source module name derived from file path (e.g. "renderer", "tokens")

### `ExtractedDocument`

**Properties:**

- `title: string` — Document title
- `content: string` — Document content (markdown)

### `RenderedFile`

A single rendered file
**Properties:**

- `filename: string` — File path relative to output dir
- `content: string` — File content
- `tokens: number` (optional) — Estimated token count

### `RenderedSkill`

A rendered skill with progressive disclosure structure
**Properties:**

- `skill: RenderedFile` — The SKILL.md discovery file (lean — frontmatter, overview, quick ref)
- `references: RenderedFile[]` — Reference files loaded on demand (functions, classes, types, etc.)

### `SkillRenderOptions`

Options controlling skill rendering
**Properties:**

- `outDir: string` — Output directory for skill files (default: ".github/skills")
- `includeExamples: boolean` — Include usage examples (default: true)
- `includeSignatures: boolean` — Include type signatures (default: true)
- `maxTokens: number` — Maximum approximate token budget per skill (default: 4000)
- `namePrefix: string` — Custom name prefix
- `license: string` — License to include in frontmatter (default: read from package.json)

## llms-txt

### `LlmsTxtOptions`

**Properties:**

- `projectName: string` — Project name (falls back to first skill name)
- `projectDescription: string` — Project description

### `LlmsTxtResult`

**Properties:**

- `summary: string` — llms.txt content (summary index)
- `full: string` — llms-full.txt content (complete API)
- `summaryTokens: number` — Estimated tokens for summary
- `fullTokens: number` — Estimated tokens for full

## audit-types

### `AuditSeverity`

Severity levels for audit issues, ordered from most to least severe.

- `fatal`: Disqualifying problems that prevent the skill from being used safely
- `error`: Serious problems that significantly degrade skill quality
- `warning`: Moderate problems that reduce skill effectiveness
- `alert`: Minor issues or suggestions for improvement

```ts
'fatal' | 'error' | 'warning' | 'alert';
```

### `AuditIssue`

A single audit finding that identifies a problem in the skill package.
**Properties:**

- `severity: AuditSeverity` — Severity level of this issue
- `code: string` — Short rule code, e.g. "F1", "E2", "W3", "A1"
- `file: string` — Relative path to the file containing the issue
- `line: number | null` — Line number within the file, or null if not applicable
- `symbol: string` — Name of the function, class, or property related to the issue
- `message: string` — Human-readable description of the problem
- `suggestion: string` — Actionable suggestion for how to fix the issue

### `AuditPass`

A check that the audit engine ran and the skill package passed.
**Properties:**

- `code: string` — Short rule code corresponding to the passed check
- `message: string` — Human-readable description of what was checked
- `detail: string` (optional) — Optional additional detail about the passing result

### `AuditContext`

Contextual metadata about the package being audited, used to evaluate
relevance and quality of skill content.
**Properties:**

- `packageDescription: string` (optional) — Description field from package.json
- `keywords: string[]` (optional) — Keywords from package.json
- `repository: string` (optional) — Repository URL from package.json
- `readme: ParsedReadme` (optional) — Parsed sections of the package README

### `ParsedReadme`

Structured representation of key sections extracted from a package README.
**Properties:**

- `blockquote: string` (optional) — Leading blockquote, often used as a one-liner summary
- `firstParagraph: string` (optional) — First prose paragraph after any heading or blockquote
- `quickStart: string` (optional) — Quick-start or getting-started section content
- `features: string` (optional) — Features or capabilities section content
- `pitfalls: string` (optional) — Pitfalls, caveats, or anti-patterns section content (maps to skill-judge D3)

### `AuditResult`

The complete output of an audit run against a single skill package.
**Properties:**

- `package: string` — Package name being audited
- `summary: Record<AuditSeverity, number>` — Count of issues found at each severity level
- `issues: AuditIssue[]` — All issues found during the audit
- `passing: AuditPass[]` — All checks that the package passed
