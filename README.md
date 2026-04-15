# to-skills

> **to-skills** — Compile inline documentation into AI agent skills. Your code is the source of truth.

Write expert knowledge once, in your source code — to-skills extracts, structures, and distributes it as [SKILL.md](https://agentskills.io) files that AI agents can discover and use.

## Why Inline?

When an agent updates your code, inline docs update atomically. There's no separate file to remember, no coordination problem, no drift. The agent edits ONE location and the truth propagates mechanically.

```typescript
/**
 * Parse a configuration file.
 *
 * @useWhen
 * - Loading config from user-provided paths
 * - Dynamic config resolution at startup
 *
 * @pitfalls
 * - NEVER trust user paths without sanitization — resolves relative to cwd
 *
 * @param path Path to the config file
 * @returns Parsed and validated configuration
 */
export function loadConfig(path: string): Config { ... }
```

`pnpm typedoc` → the generated skill tells every LLM _when_ to use this function, _what_ to watch out for, and _how_ to call it. The code is the single source of truth.

## Quick Start

```bash
# Install (auto-discovered by TypeDoc — zero config)
pnpm add -D typedoc-plugin-to-skills

# Generate skills alongside your normal docs
pnpm typedoc
```

Skills are written to `skills/<package-name>/SKILL.md`, ready for discovery via:

```bash
npx skills add your-org/your-repo
```

## What Gets Extracted

| Source                            | What                                | Where It Goes                                 |
| --------------------------------- | ----------------------------------- | --------------------------------------------- |
| JSDoc summaries                   | Function/type descriptions          | SKILL.md Quick Reference + references         |
| `@useWhen` / `@avoidWhen`         | Decision procedures                 | SKILL.md "When to Use"                        |
| `@pitfalls`                       | Anti-patterns (NEVER + BECAUSE)     | SKILL.md "Pitfalls"                           |
| `@remarks`                        | Expert knowledge beyond the summary | references/functions.md                       |
| `@category`                       | Export grouping                     | Quick Reference + reference file structure    |
| `@config` interfaces              | Config surface documentation        | SKILL.md Configuration + references/config.md |
| `@example`                        | Usage examples                      | SKILL.md Quick Start + references/examples.md |
| `@param` / `@returns` / `@throws` | API contract                        | references/functions.md                       |
| README `## Features`              | Feature list                        | SKILL.md                                      |
| `docs/` directory                 | Prose guides, tutorials             | references/ (one file per page)               |
| Commander/yargs programs          | CLI commands, flags                 | references/commands.md                        |

Everything that CAN be inline SHOULD be inline. Escape hatches (`@remarks`, `docs/`, README sections) handle the rest.

## Features

- **Code Is the Source of Truth** — write docs inline, generate skills mechanically. No separate files to maintain.
- **Progressive Disclosure** — lean SKILL.md (~200 tokens) for discovery, detailed reference files loaded on demand
- **Documentation Audit** — 25 checks across fatal/error/warning/alert with file:line references and fix suggestions
- **Multi-Source Extraction** — TypeDoc for API, commander/yargs for CLI, VitePress/Docusaurus for prose docs
- **Token Budgeting** — per-file token limits prevent context window overflow
- **Config Surface Detection** — typed interfaces with `@config` tag rendered as configuration documentation

## Packages

| Package                                               | Description                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [`typedoc-plugin-to-skills`](packages/typedoc-plugin) | Auto-discovery wrapper — just install, no config             |
| [`@to-skills/core`](packages/core)                    | Shared types, renderer, audit engine, token budgeting        |
| [`@to-skills/typedoc`](packages/typedoc)              | TypeDoc plugin — API extraction from the reflection tree     |
| [`@to-skills/cli`](packages/cli)                      | CLI extraction — commander introspection + `--help` fallback |
| [`@to-skills/vitepress`](packages/vitepress)          | VitePress plugin — sidebar-driven docs extraction            |
| [`@to-skills/docusaurus`](packages/docusaurus)        | Docusaurus adapter — `_category_.json` + docs scanning       |

## Configuration

Add to your `typedoc.json`:

```json
{
  "plugin": ["typedoc-plugin-to-skills"],
  "skillsOutDir": "skills",
  "skillsPerPackage": true,
  "skillsAudit": true,
  "blockTags": ["@useWhen", "@avoidWhen", "@pitfalls", "@config"]
}
```

| Option                   | Default    | Description                                     |
| ------------------------ | ---------- | ----------------------------------------------- |
| `skillsOutDir`           | `"skills"` | Output directory for SKILL.md files             |
| `skillsPerPackage`       | `true`     | One skill per package in monorepos              |
| `skillsMaxTokens`        | `4000`     | Max token budget per reference file             |
| `skillsAudit`            | `true`     | Run documentation audit during generation       |
| `skillsAuditFailOnError` | `false`    | Fail build on fatal/error audit issues (for CI) |
| `skillsIncludeDocs`      | `false`    | Include prose docs from `docs/` directory       |
| `llmsTxt`                | `false`    | Generate llms.txt and llms-full.txt             |

See the [full options reference](packages/typedoc/src/plugin.ts) for all 14 options.

## How It Works

```
Source code (JSDoc + convention tags)
    → TypeDoc parses into reflection tree
    → @to-skills/typedoc extracts functions, types, config surfaces
    → @to-skills/core renders SKILL.md + token-budgeted references
    → Audit checks for completeness (25 checks, 4 severity levels)
    → Skills written to skills/<name>/SKILL.md
```

For CLI tools, `@to-skills/cli` introspects commander/yargs programs and correlates flags with typed option interfaces. For prose docs, `@to-skills/vitepress` reads VitePress sidebar configuration for authoritative page ordering.

## Ecosystem

- **[agentskills.io](https://agentskills.io)** — the SKILL.md specification
- **[skills.sh](https://skills.sh)** — skill registry and CLI (`npx skills add`)
- **[llmstxt.org](https://llmstxt.org)** — the llms.txt specification

## License

MIT
