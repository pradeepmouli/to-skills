# @to-skills/target-mcpc

> CLI-as-proxy invocation-target adapter for `@to-skills/mcp`. Emits shell-command skills that use Apify's [`mcpc`](https://github.com/apify/mcpc) CLI to invoke MCP tools.

Pairs with [`@to-skills/mcp`](../mcp/). Where `@to-skills/target-mcp-protocol` emits `mcp:` frontmatter for harnesses that hold an MCP session natively, `@to-skills/target-mcpc` emits a SKILL.md whose body is a series of shell commands the agent runs through its standard shell tool. The CLI terminates the MCP protocol at the shell boundary; the agent never sees MCP.

Target CLI: **`mcpc@^2.1`**.

---

## Install

```bash
npm install --save-dev @to-skills/target-mcpc
```

The adapter is loaded by `@to-skills/mcp` on demand when you pass `--invocation cli:mcpc`. You also need `mcpc` available at run time on whatever machine consumes the skill — see Setup commands below.

---

## When to pick this target

Pick `cli:mcpc` when **the agent harness has a shell tool but cannot speak MCP natively**. Typical cases:

- Pipelines orchestrated by `gh` workflow runners or generic shell agents.
- IDE-side agents whose tool surface is `bash` only (no `mcp:` reader).
- Any time you'd rather give a non-MCP agent a "run this CLI" recipe than wire up a custom proxy.

---

## What it emits

A `SKILL.md` body whose Tools section pairs each MCP tool with its concrete shell invocation:

````markdown
## connect

Establish an outbound connection to a peer.

```sh
mcpc collision-server tools-call connect host=<value> port:=<value>
```

### Parameters

| MCP Name | CLI Flag/Key  | Type   | Required | Description   |
| -------- | ------------- | ------ | -------- | ------------- |
| host     | host=<value>  | string | yes      | Peer hostname |
| port     | port:=<value> | number | yes      | Peer TCP port |
````

Plus a Setup section with one-time install + `mcpc connect` registration commands, and a `generated-by:` frontmatter block carrying the adapter fingerprint (T119).

---

## Argument encoding

mcpc parses each positional after `tools-call <tool>` as `KEY=VALUE` (string) or `KEY:=VALUE` (JSON). The adapter encodes parameters with a three-tier strategy (driven by `args.ts`):

| Tier | Form                            | Used when                                                                    |
| ---- | ------------------------------- | ---------------------------------------------------------------------------- |
| 1    | `key=<value>`                   | Parameter is a string.                                                       |
| 2    | `key:=<value>`                  | Parameter is a number, boolean, or simple JSON literal.                      |
| 3    | `--json '<...>'` (single token) | Parameter is a complex object/array that doesn't survive shell tokenization. |

The Parameters table in the rendered Markdown shows the tier each parameter falls into so the consumer can copy-paste with confidence.

---

## Setup commands

The Setup section the adapter emits looks like this (verbatim):

```sh
# 1. Install mcpc (CLI for invoking MCP servers from shells; tested with mcpc 2.x)
npm install -g mcpc

# 2. Register this server with mcpc
mcpc connect <skill-name> -- <launchCommand>

# 3. (Optional) Verify the registration
mcpc list
```

The `mcpc connect <skill-name> -- ...` line is intentional: `connect` is a reserved mcpc subcommand that registers a server, and `<skill-name>` lands in the slot that mcpc parses as the connection name. This is unrelated to (and does not collide with) any MCP tool also named `connect` — tool dispatch lives at `mcpc <skill-name> tools-call <tool>`, where the tool name occupies a different positional slot.

---

## Adapter contract

| Field                        | Value                                         |
| ---------------------------- | --------------------------------------------- |
| `target`                     | `'cli:mcpc'`                                  |
| `fingerprint.adapter`        | `'@to-skills/target-mcpc'`                    |
| `fingerprint.version`        | This package's `version` from `package.json`. |
| `fingerprint.targetCliRange` | `'mcpc@^2.1'`                                 |

Future major versions of mcpc that change the `tools-call` arg shape MUST bump this adapter's major version and update `targetCliRange` so the freshness audit (M5) can detect drift.

---

## Programmatic use

```ts
import McpcAdapter from '@to-skills/target-mcpc';
import { renderSkill } from '@to-skills/core';

const rendered = await renderSkill(skill, { invocation: McpcAdapter });
```

---

## Further reading

- [`@to-skills/mcp` README](../mcp/README.md) — host package, CLI usage.
- [`docs/adapter-authoring.md`](../mcp/docs/adapter-authoring.md) — building your own invocation adapter.

## License

MIT
