# to-skills Development Guidelines

## Project Overview

Generate AI agent skills (SKILL.md) from TypeScript API documentation. TypeDoc plugin + CLI + Docusaurus/VitePress integrations.

## Tech Stack

- TypeScript 5, Node.js >=20
- Vitest (testing), oxlint/oxfmt (lint/format)
- pnpm workspaces (monorepo), changesets (releases)

## Project Structure

```text
packages/core/           # Shared types, renderer, token budgeting
packages/typedoc/        # TypeDoc plugin (@to-skills/typedoc)
packages/typedoc-plugin/ # Auto-discovered TypeDoc plugin (typedoc-plugin-to-skills)
packages/cli/            # CLI extraction (@to-skills/cli)
packages/docusaurus/     # Docusaurus integration (@to-skills/docusaurus)
packages/vitepress/      # VitePress integration (@to-skills/vitepress)
website/                 # Documentation site
skills/                  # Bundled skill outputs
```

## Commands

```bash
pnpm install        # Install dependencies
pnpm test           # Run tests
pnpm run type-check # TypeScript strict mode
pnpm run build      # Build all packages
pnpm run lint       # oxlint
pnpm run format     # oxfmt
```

## Code Style

- TypeScript strict mode, no `any`
- oxlint for linting, oxfmt for formatting
- Conventional commits

## Key Patterns

- **Skill renderer** — `renderSkill()` produces SKILL.md + reference files from ExtractedSkill
- **Token budgeting** — per-reference-file token limits to fit LLM context windows
- **Plugin architecture** — TypeDoc plugin hooks into reflection events to extract API metadata
- **llms.txt generation** — optional companion output alongside skills

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
