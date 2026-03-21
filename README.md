# to-skills

Generate structured AI agent skills ([SKILL.md](https://agentskills.io)) and [llms.txt](https://llmstxt.org) from your documentation sources.

Install the TypeDoc plugin and your API docs become discoverable agent skills — compatible with Claude Code, Cursor, Copilot, and [500+ other agents](https://github.com/VoltAgent/awesome-agent-skills).

## Quick Start

```bash
# Install (auto-discovered by TypeDoc — zero config)
pnpm add -D typedoc-plugin-to-skills

# Generate skills alongside your normal docs
pnpm typedoc
```

That's it. TypeDoc finds the plugin automatically. Skills are written to `skills/<package-name>/SKILL.md`, ready for discovery via:

```bash
npx skills add your-org/your-repo
```

## What It Generates

### SKILL.md (Agent Skills)

Structured files following the [agentskills.io specification](https://agentskills.io/specification) with:

- YAML frontmatter (name, description, license)
- "When to Use" triggers derived from your API surface
- Quick reference of all exports
- Full function signatures, parameters, return types
- Class members, types, enums
- Usage examples from `@example` JSDoc tags
- Token-budgeted output (default 4000 tokens per skill)

### llms.txt (opt-in)

Summary index and full API dump following the [llmstxt.org](https://llmstxt.org) specification:

```bash
# Enable in typedoc.json
{ "llmsTxt": true }
```

Generates both `llms.txt` (summary with truncated descriptions) and `llms-full.txt` (complete API content).

## Packages

| Package | Description |
|---------|-------------|
| [`@to-skills/core`](packages/core) | Shared types, SKILL.md renderer, llms.txt renderer, token budgeting |
| [`@to-skills/typedoc`](packages/typedoc) | TypeDoc plugin — extracts from the reflection tree |
| [`typedoc-plugin-to-skills`](packages/typedoc-plugin) | Auto-discovery wrapper (just install, no config) |

## Configuration

Add options to your `typedoc.json`:

```json
{
  "plugin": ["typedoc-plugin-to-skills"],
  "skillsOutDir": "skills",
  "skillsPerPackage": true,
  "skillsIncludeExamples": true,
  "skillsIncludeSignatures": true,
  "skillsMaxTokens": 4000,
  "skillsLicense": "MIT",
  "llmsTxt": false,
  "llmsTxtOutDir": "."
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `skillsOutDir` | `"skills"` | Output directory for SKILL.md files |
| `skillsPerPackage` | `true` | One skill per package in monorepos |
| `skillsIncludeExamples` | `true` | Include `@example` JSDoc tags |
| `skillsIncludeSignatures` | `true` | Include type signatures |
| `skillsMaxTokens` | `4000` | Max token budget per skill |
| `skillsNamePrefix` | `""` | Custom prefix for skill names |
| `skillsLicense` | auto | License (reads from package.json) |
| `llmsTxt` | `false` | Generate llms.txt and llms-full.txt |
| `llmsTxtOutDir` | `"."` | Output directory for llms.txt files |

## How It Works

1. TypeDoc parses your TypeScript source into a reflection tree
2. `@to-skills/typedoc` extracts functions, classes, types, enums with their JSDoc
3. `@to-skills/core` renders structured SKILL.md files with frontmatter
4. Skills are written to `skills/<name>/SKILL.md` for discovery by [skills.sh](https://skills.sh)

## Ecosystem

- **[agentskills.io](https://agentskills.io)** — the SKILL.md specification
- **[skills.sh](https://skills.sh)** — skill registry and CLI (`npx skills add`)
- **[llmstxt.org](https://llmstxt.org)** — the llms.txt specification

## License

MIT
