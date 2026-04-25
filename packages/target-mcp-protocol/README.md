# @to-skills/target-mcp-protocol

> Default invocation-target adapter for `@to-skills/mcp`. Emits `mcp:` frontmatter for agent harnesses that speak MCP natively.

Pairs with [`@to-skills/mcp`](../mcp/) — when a host extracts or bundles an MCP server, this adapter renders a SKILL.md whose frontmatter is consumed directly by MCP-native harnesses (OpenCode, Codex, Cursor, Claude Code) so the harness can wire up the server without a separate connect step.

This is the **default** adapter — when you don't pass `--invocation`, this is what runs.

---

## Install

This adapter ships as a runtime dependency of `@to-skills/mcp`. You do not need to install it explicitly. It's listed here for clarity:

```bash
npm install --save-dev @to-skills/target-mcp-protocol
```

---

## When to pick this target

Pick `mcp-protocol` (or omit `--invocation` entirely) when **the agent harness speaks the MCP protocol natively** — i.e., it can hold an MCP session and dispatch `tools/call`, `resources/read`, and `prompts/get` requests against the server.

This covers most modern agent harnesses:

- Claude Code (Anthropic CLI)
- Codex
- Cursor
- OpenCode
- Any IDE plugin that wires `mcp:` config into its agent

Don't pick it for shell-only harnesses (those need `cli:mcpc` or `cli:fastmcp` — see the sibling target packages).

---

## What it emits

`SKILL.md` frontmatter is augmented with an `mcp:` block:

```yaml
---
name: filesystem
description: 'Secure file system access scoped to /tmp...'
license: MIT
mcp:
  filesystem:
    command: npx
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp']
---
```

For HTTP transports the block uses `url` + `headers` instead of `command` + `args`. The host (`@to-skills/mcp`) decides which form via `AdapterRenderContext.httpEndpoint` vs `.launchCommand`.

The body of the SKILL.md (Quick Reference, References section, tool/resource/prompt content) comes from the default core renderer — this adapter does not override `skipDefaultFunctionsRef`. It only injects `additionalFrontmatter`.

---

## Adapter contract

| Field                        | Value                                         |
| ---------------------------- | --------------------------------------------- |
| `target`                     | `'mcp-protocol'`                              |
| `fingerprint.adapter`        | `'@to-skills/target-mcp-protocol'`            |
| `fingerprint.version`        | This package's `version` from `package.json`. |
| `fingerprint.targetCliRange` | _absent_ (this target invokes no CLI).        |

The fingerprint is embedded in `SKILL.md` frontmatter under `generated-by:` so consumers can detect drift between the rendered file and the adapter that produced it.

---

## Programmatic use

```ts
import McpProtocolAdapter from '@to-skills/target-mcp-protocol';
import { renderSkill } from '@to-skills/core';

const rendered = await renderSkill(skill, { invocation: McpProtocolAdapter });
```

---

## Further reading

- [`@to-skills/mcp` README](../mcp/README.md) — host package, CLI usage, programmatic API.
- [`docs/adapter-authoring.md`](../mcp/docs/adapter-authoring.md) — building your own invocation adapter.

## License

MIT
