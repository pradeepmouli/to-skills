---
name: to-skills-docs
description: "Documentation conventions for generating high-quality AI agent skills from TypeScript source. Use when preparing a library for skill generation, auditing JSDoc quality, fixing audit warnings from typedoc-plugin-to-skills, or asking about documentation conventions for skills. Use this even if the user just says 'audit my docs' or 'improve my documentation for AI agents'."
---

# Documentation Conventions for Skill Generation

typedoc-plugin-to-skills generates AI agent skills (SKILL.md) from your TypeScript documentation. The quality of the generated skill depends entirely on what you write in your source docs.

The generator runs an audit during `pnpm typedoc` that checks your docs against these conventions at four severity levels:

- **fatal** — skill is broken without this (fix first)
- **error** — LLMs can't write correct code from this
- **warning** — skill works but isn't as good as it could be
- **alert** — stylistic suggestion

## Fixing Audit Issues

Run `pnpm typedoc` and look for the audit output after `[skills]` lines. Fix fatals first, then errors.

### Fatal — Fix These First

**F1: package.json description** — One-sentence problem statement:

```json
{ "description": "Generate AI agent skills from TypeScript API documentation" }
```

NEVER: taglines ("Fast and lightweight"), tech-stack descriptions ("A TypeScript library").

**F2: package.json keywords** — 5+ domain-specific words:

```json
{ "keywords": ["proxy", "ipc", "child-process", "worker", "type-safe", "rpc"] }
```

NEVER: generic terms (typescript, library, npm, utils) — these are filtered out and add zero triggering value.

**F3: README description** — Blockquote after title:

```markdown
# my-lib

> Map process.env to strongly-typed nested config objects with camelCase fields.
```

**F4: JSDoc on every export** — At least one sentence:

```typescript
/** Render a single extracted skill into SKILL.md + progressive disclosure references */
export function renderSkill(skill: ExtractedSkill): RenderedSkill {
```

### Error — Fix These Next

**E1: @param descriptions** — Describe what each parameter controls, not what type it is:

```typescript
// GOOD:
/** @param options Configuration for rendering — controls token budgets and output format */

// BAD:
/** @param options The options */
```

**E2: @returns on non-void functions**:

```typescript
/** @returns Rendered skill with SKILL.md discovery file and on-demand reference files */
```

**E3: Interface property JSDoc**:

```typescript
export interface Config {
  /** Maximum token budget per reference file (default: 4000) */
  maxTokens: number;
}
```

**E4: At least one @example** — Realistic usage, not trivial:

````typescript
/**
 * @example
 * ```typescript
 * import { renderSkills, writeSkills } from '@to-skills/core';
 * const rendered = renderSkills(extracted, { maxTokens: 4000 });
 * writeSkills(rendered, { outDir: 'skills' });
 * ```
 */
````

**E5: package.json repository** — Add the repo URL.

### Warning — Polish for Quality

**W1:** Add `@packageDocumentation` to index.ts with overview and feature list.
**W2:** Add `@example` to every exported function.
**W3:** Use `@deprecated`, `@since`, `@throws`, `@see` tags where applicable.
**W4:** Add 10+ domain-specific keywords.
**W5:** Add `## Features` section to README.
**W6:** Add `## Pitfalls` section to README — expert "NEVER do X because Y" knowledge. This is what makes a skill genuinely useful vs just being an API reference.

## README Structure

The generator extracts specific sections by exact heading name:

```markdown
# package-name

> One-sentence problem statement.

Extended explanation with key capabilities.

## Quick Start

` ` `typescript
import { main } from 'pkg';
main();
` ` `

## Features

- **Feature** — what it does and why

## Pitfalls

- **NEVER do X** — because [non-obvious reason]
```

Accepted heading variants (case-insensitive):
| Canonical | Also Accepted |
|-----------|--------------|
| `## Quick Start` | `## Usage`, `## Getting Started` |
| `## Features` | `## Key Features`, `## Highlights` |
| `## Pitfalls` | `## Common Mistakes`, `## Gotchas`, `## Caveats` |

## Why This Matters (Skill-Judge Alignment)

Generated skills are evaluated on 8 dimensions. The biggest gaps without conventions:

- **Knowledge Delta**: Function signatures are things Claude already knows. The value comes from @param prose, @returns meaning, @throws conditions, and Pitfalls.
- **Anti-Patterns**: Without a ## Pitfalls section, skills score ~2/15 on anti-pattern quality.
- **Description**: Without proper package.json description + keywords, skills never trigger.

## Workflow

1. Run `pnpm typedoc` — see audit output
2. Fix fatals (5 minutes of work)
3. Fix errors (the biggest quality jump)
4. Re-run — verify improvements
5. Check `skills/<name>/SKILL.md` — does the description make sense?
