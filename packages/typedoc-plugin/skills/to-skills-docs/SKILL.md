---
name: to-skills-docs
description: "Documentation conventions for generating high-quality AI agent skills from TypeScript source. Use when preparing a library for skill generation, auditing JSDoc quality, fixing audit warnings, writing @useWhen/@avoidWhen/@never tags, or asking about documentation conventions for skills. Use this even if the user just says 'audit my docs', 'improve my JSDoc', or 'make my skills better'."
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
**W6:** Add `## Troubleshooting` section to README — common issues, errors, and FAQs users encounter.

## JSDoc Tags for Expert-Quality Skills

These three custom tags are what separate a "passing" skill from a genuinely useful one. They provide the expert knowledge that Claude doesn't already have — decision procedures, anti-patterns, and freedom calibration.

The plugin auto-registers these as `blockTags` at load time — no `typedoc.json` config needed. If they're accidentally placed in `modifierTags`, the plugin auto-moves them with a warning (modifierTags strips content).

### `@useWhen` — When to reach for this function

Each bullet is a scenario where an LLM should use this function. Aggregated into the SKILL.md "When to Use" section.

```typescript
/**
 * @useWhen
 * - You need CPU-intensive work isolated from the main process
 * - You want automatic EventEmitter forwarding across processes
 */
```

### `@avoidWhen` — When NOT to use this function

Prevents misuse. Aggregated into SKILL.md "When to Use" as negative triggers.

```typescript
/**
 * @avoidWhen
 * - The class uses non-serializable state (closures, WeakMaps)
 * - You need sub-millisecond latency — IPC adds ~1ms overhead
 */
```

### `@never` — Anti-patterns from experience

NEVER + BECAUSE format. This is the highest-leverage tag — it directly scores on skill-judge D3 (Anti-Patterns, 15 points).

```typescript
/**
 * @never
 * - NEVER pass functions as constructor args — V8 serialization silently drops them
 * - NEVER call $terminate() inside a proxied method — creates IPC deadlock
 */
```

### `@remarks` — Expert knowledge beyond the summary

Extended explanation with trade-offs, design decisions, and context. Standard TSDoc tag. Goes in references/functions.md after the summary.

```typescript
/**
 * Render a single skill.
 *
 * @remarks
 * Token budgets are applied per-reference-file, not per-skill.
 * A skill with many functions may have functions.md truncated
 * but types.md will be unaffected. Set maxTokens to at least
 * 500 to avoid mid-signature truncation.
 */
```

### `@category` — Group exports by domain

Groups exports in SKILL.md Quick Reference and reference files. Overrides the automatic filename-based grouping.

```typescript
/** @category Rendering */
export function renderSkill(...) {}

/** @category Rendering */
export function writeSkills(...) {}

/** @category Token Management */
export function estimateTokens(...) {}
```

### Complete Example

```typescript
/**
 * Run class instances in isolated child processes.
 *
 * @remarks
 * All method calls become async via IPC. V8 serialization is 10x faster
 * than JSON but doesn't support functions or Symbols.
 *
 * @useWhen
 * - You need CPU-intensive work in a separate process
 * - You want EventEmitter forwarding across processes
 *
 * @avoidWhen
 * - The class has non-serializable state
 * - You need sub-millisecond latency
 *
 * @never
 * - NEVER pass functions as constructor args — silently dropped by V8
 * - NEVER call $terminate() inside a proxied method — IPC deadlock
 *
 * @param target Class constructor to proxy
 * @param modulePath Path to module exporting the class
 * @returns Proxied instance with all methods returning Promises
 * @throws {ProcxyError} When child process fails to start
 * @see sanitizeForV8 — check if values survive serialization
 * @category Core
 */
```

### Impact on Generated Skill Quality

| Without Tags            | With Tags    | What Changes                                                                                   |
| ----------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| Skill-judge ~42/120 (F) | ~94/120 (C+) | @useWhen/@avoidWhen → decision procedures, @never → anti-patterns, @remarks → expert knowledge |

The remaining gap to Grade B requires hand-tuned prose quality — but the tags create the scaffolding.

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

## Troubleshooting

- **Error X occurs when** — [cause and fix]
```

Accepted heading variants (case-insensitive):
| Canonical | Also Accepted |
|-----------|--------------|
| `## Quick Start` | `## Usage`, `## Getting Started` |
| `## Features` | `## Key Features`, `## Highlights` |
| `## Troubleshooting` | `## Common Issues`, `## Common Errors`, `## FAQ` |

## Why This Matters (Skill-Judge Alignment)

Generated skills are evaluated on 8 dimensions. The biggest gaps without conventions:

- **Knowledge Delta**: Function signatures are things Claude already knows. The value comes from @param prose, @returns meaning, @throws conditions, and Pitfalls.
- **Anti-Patterns**: Without a ## Troubleshooting section, skills score ~2/15 on anti-pattern quality.
- **Description**: Without proper package.json description + keywords, skills never trigger.

## Content Priority

The generator pulls content from multiple sources. When the auto-generated skill is thin on a dimension, add content at the highest-priority source:

| Priority | Source                               | What it provides                     | When to use                           |
| -------- | ------------------------------------ | ------------------------------------ | ------------------------------------- |
| 1        | `@example` on exports                | Quick Start, worked code in SKILL.md | Always — trumps README examples       |
| 2        | `@useWhen` / `@avoidWhen`            | Decision tables in "When to Use"     | Key exports (5-7 classes/functions)   |
| 3        | `@never`                             | NEVER rules in "When to Use"         | Any export with non-obvious footguns  |
| 4        | `@remarks` on exports                | Expert knowledge in reference files  | Complex functions needing context     |
| 5        | `@packageDocumentation` `@remarks`   | Thinking framework in SKILL.md body  | Architecture decisions, mental models |
| 6        | `@packageDocumentation` `@example`   | Quick Start fallback                 | When no export has `@example`         |
| 7        | README `## Features`                 | Features section in SKILL.md         | Describe capabilities                 |
| 8        | README `## Troubleshooting`          | Troubleshooting section in SKILL.md  | Common errors and fixes               |
| 9        | README `## Quick Start` / `## Usage` | Quick Start fallback                 | When no `@example` exists anywhere    |

`@example` and `@remarks` are escape hatches — when the auto-generated output scores low on a skill-judge dimension, add inline content at the right priority level:

- **D1 Knowledge Delta low?** → Add `@remarks` with trade-offs, design decisions
- **D2 Procedures low?** → Add `@packageDocumentation @remarks` with "before X, ask yourself..." frameworks
- **D3 Anti-Patterns low?** → Add `@never` with NEVER + BECAUSE rules
- **D8 Usability low?** → Add `@example` with worked code patterns

## Workflow

1. Run `pnpm typedoc` — see audit output and score estimate
2. Fix fatals first (package.json description, missing JSDoc)
3. Add `@example` to key exports (surfaces as Quick Start and worked examples)
4. Add `@useWhen`/`@avoidWhen`/`@never` to key exports (biggest quality jump)
5. Add `@remarks` to `@packageDocumentation` — architectural context and thinking frameworks
6. Fix errors — `@param`/`@returns` on non-self-documenting params
7. Re-run — verify score improvement
8. Iterate until audit estimate plateaus
9. **Mandatory: Run skill-judge** on the generated `skills/<name>/SKILL.md` — the audit estimate overestimates by 10-20 points. Skill-judge catches: token bloat, missing thinking frameworks, description trigger quality, orphaned references.

A skill is not ready to ship until skill-judge confirms Grade B (96+) or higher.
