# Contract — `@to-skills/mcp/adapter-utils` Subpath Module

**Owner**: `@to-skills/mcp`
**Stability**: public-stable across `@to-skills/mcp@0.x`. Major bump to break.
**Subpath import**: `import { ... } from '@to-skills/mcp/adapter-utils'`

---

## Why this module exists

Three CLI invocation adapters (`target-mcpc`, `target-fastmcp`, hypothetical third parties) share ~100 lines of byte-identical helper code. This module is the single source of truth — adapters import from here instead of copying.

The host-side `@to-skills/mcp` is not the natural place for these helpers from the user's perspective (they're adapter-author concerns), so they live under a subpath that consumers reach explicitly.

## Exported symbols

| Export                     | Purpose                                                                       | Stability |
| -------------------------- | ----------------------------------------------------------------------------- | --------- |
| `resolveLaunchCommand`     | Pick stdio vs. HTTP launch shape from `AdapterRenderContext`                  | stable    |
| `formatCliMarker`          | `'mcpc@^2.1'` → `'mcpc 2.1.x'` for the human-readable fingerprint trace line  | stable    |
| `shellQuote`               | Minimal POSIX shell quoting for tokens emitted into copy/paste-ready commands | stable    |
| `collapseTrailingNewlines` | Trim runs of trailing `\n` to a single `\n` (CodeQL ReDoS-safe)               | stable    |
| `renderToolsBody`          | Shared Markdown-body emitter for CLI Tools sections                           | stable    |
| `planForTool`              | Synthesize `Map<string, ParameterPlan>` from `ExtractedFunction`              | stable    |
| `parameterToSchema`        | `ExtractedParameter` → minimal `JSONSchema7` for `classifyParameters`         | stable    |

## `renderToolsBody` signature

```ts
export function renderToolsBody(
  functions: readonly ExtractedFunction[],
  skillName: string,
  encodeOne: (plan: ParameterPlan) => string,
  cliVerb: string // e.g. 'mcpc {skillName} tools-call' or 'pyfastmcp call'
): string;
```

Each adapter passes its own `encodeOne` (the only piece of per-CLI argument-syntax variation) and `cliVerb` (the per-CLI command prefix). Everything else — function header, description block, command line, parameters table — comes from the shared body.

**Behavioral guarantee**: byte-identical to the inline implementations in PR 20. Existing inline-snapshot tests in `target-mcpc` and `target-fastmcp` MUST continue to pass without snapshot updates.

## `package.json` exports declaration

```jsonc
{
  "name": "@to-skills/mcp",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./adapter-utils": {
      "types": "./dist/adapter/cli-tools-helpers.d.ts",
      "import": "./dist/adapter/cli-tools-helpers.js"
    }
  }
}
```

## Versioning policy

- New symbols added: minor version bump.
- Signature changes: major version bump.
- Removal of a stable symbol: major version bump + 1-version deprecation window in CHANGELOG.

## Consumer adapters in-tree

- `packages/target-mcpc/src/render.ts` — uses all 7 exports.
- `packages/target-fastmcp/src/render.ts` — uses all 7 exports.
- `packages/target-mcp-protocol/src/render.ts` — does NOT consume this module (it doesn't render CLI tool tables).
