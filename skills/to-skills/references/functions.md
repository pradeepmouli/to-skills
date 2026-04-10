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
