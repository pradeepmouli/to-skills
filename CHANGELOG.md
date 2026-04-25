# Changelog

## 0.2.0 — 2026-04-25

### Breaking

- **`AdapterRenderContext` is now a discriminated union** over `mode: 'bundle' | 'http' | 'stdio'`. Third-party invocation adapters that destructured `ctx.launchCommand` directly without checking `ctx.mode` will fail to compile. Migration: `switch (ctx.mode) { case 'bundle': ...; case 'http': ...; case 'stdio': ...; }`. See `specs/002-mcp-hardening/quickstart.md §1`.
- **`ParameterPlan` is now a discriminated union** over `type: 'scalar' | 'enum' | 'string-array' | 'json'`. Third-party CLI adapters that imported `ParameterPlan` and read `plan.scalarType` / `plan.enum` without checking `plan.type` will fail to compile. The `'object'` arm is dropped (was never constructed). Migration: `specs/002-mcp-hardening/quickstart.md §2`.

### Features

- `extractMcpSkill` return value now carries `auditIssues?: readonly McpAuditIssue[]` for programmatic CI gates. Tri-state semantics: `undefined` (audit skipped or non-MCP extractor), `[]` (ran clean), `[…]` (issues found).
- `McpExtractOptions.transport.stdio.initializeTimeoutMs?: number` (default 30 000 ms) bounds the SDK's initialize handshake. Pass `0` to disable.
- Malformed `_meta.toSkills` annotations now surface as warning-severity M3 audit issues instead of being silently dropped.
- New subpath export `@to-skills/mcp/adapter-utils` — third-party CLI invocation adapters can import the 7 shared helpers (`resolveLaunchCommand`, `formatCliMarker`, `shellQuote`, `collapseTrailingNewlines`, `renderToolsBody`, `planForTool`, `parameterToSchema`) instead of copying.

### Fixes

- stdio extract no longer hangs indefinitely on stuck servers (default 30 s timeout — see Features above).
- stderr capture in stdio extract is now bounded at 64 KiB (ring-buffer style). Chatty servers can no longer exhaust memory before the initialize handshake completes.
- stdio extract no longer leaks `data` listeners across bundle iterations (named-listener cleanup in `finally`).

### Refactor

- Shared CLI invocation-adapter helpers consolidated into `@to-skills/mcp/adapter-utils`. ~250 LOC removed across `target-mcpc` and `target-fastmcp`.
- `readMcpConfigFile` now returns `ConfigEntry[]` with parsed `McpTransport` per entry. The un-validated `McpServerConfig` wire shape no longer leaks past the file boundary.
- `WrittenSkill.files`, `AuditResult.issues`, `ParameterPlan.path` now `readonly` at the type level.

### Internal

- New compile-time test (Vitest typecheck mode) asserts `AdapterRenderContext` two-arms-set construction is rejected.
- Two new integration tests gated on `RUN_INTEGRATION_TESTS=true`: HTTP `--header` end-to-end and bundle multi-target.
- Phase/task tokens stripped from source comments — kept in spec audit trail.
