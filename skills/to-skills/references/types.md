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
