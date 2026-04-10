# Functions

## renderer

### `renderSkills`

Render multiple extracted skills into progressive disclosure file sets

```ts
renderSkills(skills: ExtractedSkill[], options?: Partial<SkillRenderOptions>): RenderedSkill[]
```

**Parameters:**

- `skills: ExtractedSkill[]`
- `options: Partial<SkillRenderOptions>` (optional)
  **Returns:** `RenderedSkill[]`

### `renderSkill`

Render a single skill into SKILL.md + references/

```ts
renderSkill(skill: ExtractedSkill, options?: Partial<SkillRenderOptions>): RenderedSkill
```

**Parameters:**

- `skill: ExtractedSkill`
- `options: Partial<SkillRenderOptions>` (optional)
  **Returns:** `RenderedSkill`

## writer

### `writeSkills`

Write rendered skill file sets to disk (SKILL.md + references/)

```ts
writeSkills(skills: RenderedSkill[], options: Pick<SkillRenderOptions, "outDir">): void
```

**Parameters:**

- `skills: RenderedSkill[]`
- `options: Pick<SkillRenderOptions, "outDir">`

## tokens

### `estimateTokens`

Rough token estimate: ~4 chars per token for English/code.
Not exact, but good enough for budgeting skill file sizes.

```ts
estimateTokens(text: string): number
```

**Parameters:**

- `text: string`
  **Returns:** `number`

### `truncateToTokenBudget`

Truncate text to fit within a token budget, preserving complete lines

```ts
truncateToTokenBudget(text: string, maxTokens: number): string
```

**Parameters:**

- `text: string`
- `maxTokens: number`
  **Returns:** `string`

## llms-txt

### `renderLlmsTxt`

Render llms.txt and llms-full.txt from extracted skills

```ts
renderLlmsTxt(skills: ExtractedSkill[], options: LlmsTxtOptions): LlmsTxtResult
```

**Parameters:**

- `skills: ExtractedSkill[]`
- `options: LlmsTxtOptions`
  **Returns:** `LlmsTxtResult`

## readme-parser

### `parseReadme`

Parse a README markdown string and extract structured sections.

Extraction rules:

- **blockquote** – first `> …` line between `# title` and the first `## heading`.
- **firstParagraph** – first prose lines before the first `## heading` that are
  not a heading, badge (`[![`), image (`![`), blockquote, or blank.
  Consecutive lines are joined with a single space.
- **quickStart** – content under `## Quick Start`, `## Usage`, or `## Getting Started`.
- **features** – content under `## Features`, `## Key Features`, or `## Highlights`.
- **pitfalls** – content under `## Pitfalls`, `## Common Mistakes`, `## Gotchas`,
  or `## Caveats`.

```ts
parseReadme(markdown: string): ParsedReadme
```

**Parameters:**

- `markdown: string`
  **Returns:** `ParsedReadme`

## audit

### `auditSkill`

```ts
auditSkill(skill: ExtractedSkill, context: AuditContext): AuditResult
```

**Parameters:**

- `skill: ExtractedSkill`
- `context: AuditContext`
  **Returns:** `AuditResult`

## audit-formatter

### `formatAuditText`

Format an AuditResult as human-readable text suitable for TypeDoc logs.

Output groups issues by severity (fatal → error → warning → alert),
then lists passing checks at the end. Empty severity groups are omitted.

```ts
formatAuditText(result: AuditResult): string
```

**Parameters:**

- `result: AuditResult`
  **Returns:** `string`

### `formatAuditJson`

Format an AuditResult as pretty-printed JSON for machine consumption.

Returns the full result object serialized with 2-space indentation so it
can be parsed by downstream tooling without any further transformation.

```ts
formatAuditJson(result: AuditResult): string
```

**Parameters:**

- `result: AuditResult`
  **Returns:** `string`
