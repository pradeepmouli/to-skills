---
description: 'Task list for @to-skills/mcp — Extract and Bundle MCP Servers as Agent Skills'
---

# Tasks: `@to-skills/mcp` — Extract and Bundle MCP Servers as Agent Skills

**Input**: Design documents from `/specs/001-mcp-extract-bundle/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. The plan explicitly mandates unit + integration + contract testing with Vitest. Integration tests target the reference `@modelcontextprotocol/server-everything` server for stdio and a mock SSE server for HTTP.

**Organization**: Grouped by user story for independent implementation and testing. P1 stories (US1, US2, US4, US5) are prerequisites for MVP; P2/P3 stories extend reach.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User-story label (US1–US7) on story-phase tasks only
- Paths shown relative to repo root `/Users/pmouli/GitHub.nosync/active/ts/to-skills/`

## Path Conventions

- Core types live in `packages/core/src/`
- New host package: `packages/mcp/src/`
- Adapter packages: `packages/target-mcp-protocol/src/`, `packages/target-mcpc/src/`, `packages/target-fastmcp/src/`
- Tests colocated at `packages/*/tests/` (Vitest convention in this workspace)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: pnpm workspace scaffolding for the four new packages. No feature code yet.

- [x] T001 Create `packages/mcp/` directory with `package.json` declaring `@to-skills/mcp@0.1.0`, `type: module`, `bin: { "to-skills-mcp": "./dist/bin.js" }`, `main`/`types` pointing at `./dist/index.js`/`./dist/index.d.ts`, and `files: ["dist", "README.md"]` per existing workspace convention (match `packages/cli/package.json`)
- [x] T002 [P] Create `packages/target-mcp-protocol/package.json` declaring `@to-skills/target-mcp-protocol@0.1.0`, default export shape, and dependency on `@to-skills/core` (workspace:\*) + peer dependency on `@to-skills/mcp`
- [x] T003 [P] Create `packages/target-mcpc/package.json` declaring `@to-skills/target-mcpc@0.1.0` mirroring T002
- [x] T004 [P] Create `packages/target-fastmcp/package.json` declaring `@to-skills/target-fastmcp@0.1.0` mirroring T002
- [x] T005 Add runtime deps to `packages/mcp/package.json`: `@modelcontextprotocol/sdk@^1.0.0`, `@apidevtools/json-schema-ref-parser@^11.0.0`, `yaml@^2.0.0`, `commander@^14.0.3`, `@to-skills/core` (workspace:\*)
- [x] T006 [P] Create `packages/mcp/tsconfig.json` and `packages/mcp/tsconfig.build.json` mirroring `packages/cli/tsconfig*.json` (strict, ES2022 target, module NodeNext)
- [x] T007 [P] Create `tsconfig.json`/`tsconfig.build.json` in each of the three `packages/target-*/` dirs, same shape as T006
- [x] T008 Add `vitest.config.ts` to `packages/mcp/` with `test.include: ['tests/**/*.test.ts']`, `test.coverage.provider: 'v8'`, and per-package node environment
- [x] T009 [P] Update root `pnpm-workspace.yaml` to confirm new packages are matched by the existing `packages/*` glob (no change expected; verify by running `pnpm install` and checking all four packages resolve)
- [x] T010 [P] Add `README.md` stubs (one paragraph, "Generated from specs/001-mcp-extract-bundle") to each of the four new packages so `npm publish` dry-runs don't warn

**Checkpoint**: `pnpm install && pnpm --filter @to-skills/mcp run type-check` succeeds (empty src dirs are OK at this point)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core IR extensions, canonicalization primitive, adapter plugin interface + loader, shared schema utilities. All user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Core IR extensions (backward-compatible)

- [ ] T011 Extend `packages/core/src/types.ts` with `ExtractedResource` interface (uri, name, description, optional mimeType, optional sourceModule) per data-model.md §1.1
- [ ] T012 Extend `packages/core/src/types.ts` with `ExtractedPrompt` and `ExtractedPromptArgument` interfaces per data-model.md §1.2
- [ ] T013 Extend `packages/core/src/types.ts` with `SkillSetup` and `AdapterFingerprint` interfaces per data-model.md §1.3
- [ ] T014 Add optional `resources?: ExtractedResource[]`, `prompts?: ExtractedPrompt[]`, `setup?: SkillSetup` fields to `ExtractedSkill` interface in `packages/core/src/types.ts` per data-model.md §1.4
- [ ] T015 Add optional `invocation?: InvocationAdapter` field to `SkillRenderOptions` in `packages/core/src/types.ts`; use `import type` for a forward-declared `InvocationAdapter` interface to avoid `@to-skills/core → @to-skills/mcp` dependency cycle
- [ ] T016 Re-export `ExtractedResource`, `ExtractedPrompt`, `SkillSetup`, `AdapterFingerprint` from `packages/core/src/index.ts`

### Canonicalization pass

- [ ] T017 Create `packages/core/src/canonical.ts` exporting `canonicalize(skill: RenderedSkill, opts?: CanonicalizeOptions): RenderedSkill` that applies: sorted object keys in YAML frontmatter, stable-sort arrays by name (tools/resources/prompts), stripped timestamps (regex list), LF line endings, collapsed blank-line runs, trimmed trailing whitespace
- [ ] T018 [P] Add unit test `packages/core/tests/canonical.test.ts` asserting idempotence (`canonicalize(canonicalize(x)) === canonicalize(x)`), stable key order, and timestamp stripping
- [ ] T019 Extend `renderSkill` in `packages/core/src/renderer.ts` to accept optional `invocation: InvocationAdapter`; when present, delegate to `invocation.render(skill, ctx)` for frontmatter + body; when absent, preserve today's TypeDoc/CLI-extractor output shape; always run canonicalization pass on the returned `RenderedSkill`

### Adapter plugin interface (lives in host package)

- [ ] T020 Create `packages/mcp/src/adapter/types.ts` exporting `InvocationTarget` string union, `InvocationAdapter` interface (target, fingerprint, render method), and `AdapterContext` type per data-model.md §2.4
- [ ] T021 [P] Create `packages/mcp/src/adapter/loader.ts` implementing `loadAdapter(target: InvocationTarget): InvocationAdapter` using `createRequire(import.meta.url)` + the candidate-list resolution from research.md §5 (mcp-protocol → `@to-skills/target-mcp-protocol`; cli:\* → scoped then unscoped fallback)
- [ ] T022 [P] Add unit test `packages/mcp/tests/unit/loader.test.ts` covering resolution success (mock fs), scoped-name preference, unscoped fallback, and `ADAPTER_NOT_FOUND` error on miss
- [ ] T023 Create `packages/mcp/src/errors.ts` exporting `McpError` class with `code`, `cause`, message; export string-literal union `McpErrorCode` covering `UNKNOWN_TARGET`, `ADAPTER_NOT_FOUND`, `TRANSPORT_FAILED`, `INITIALIZE_FAILED`, `PROTOCOL_VERSION_UNSUPPORTED`, `SCHEMA_REF_CYCLE`, `SERVER_EXITED_EARLY`, `MISSING_LAUNCH_COMMAND`, `DUPLICATE_SKILL_NAME`

### Shared tier classifier for CLI adapters

- [ ] T024 Create `packages/mcp/src/adapter/classify.ts` exporting `classifyParameters(inputSchema: JSONSchema7): Map<string, ParameterPlan>` and the `ParameterPlan` type per contracts/adapter.md — implements Tier 1/2/3 decision logic from research.md §6
- [ ] T025 [P] Add unit test `packages/mcp/tests/unit/classify.test.ts` with fixture schemas for every tier (scalars → T1; enum → T1; nested one level → T2; nested two levels → T3; recursive $ref → T3; required+optional mix)

### JSON Schema $ref resolution

- [ ] T026 Create `packages/mcp/src/introspect/schema.ts` exporting `resolveSchema(schema: JSONSchema7): Promise<JSONSchema7>` wrapping `@apidevtools/json-schema-ref-parser` — dereferences in place; catches ref-cycle errors and re-throws as `McpError('SCHEMA_REF_CYCLE')`
- [ ] T027 [P] Add unit test `packages/mcp/tests/unit/schema.test.ts` covering simple $ref resolution, nested definitions, external-ref rejection (must throw), cyclic ref (must throw `SCHEMA_REF_CYCLE`)

### Option-bag and result types

- [ ] T028 Create `packages/mcp/src/types.ts` exporting `McpExtractOptions`, `McpTransport`, `McpBundleOptions`, `BundleResult`, `WrittenSkill`, `AuditResult`, `AuditIssue`, `AuditOptions`, `McpServerConfig`, `McpConfigFile` per data-model.md §2
- [ ] T029 Create `packages/mcp/src/index.ts` skeleton that re-exports all public types from T020/T023/T028 (no implementation yet — just the surface)

**Checkpoint**: `pnpm --filter @to-skills/core --filter @to-skills/mcp run type-check` passes. `pnpm --filter @to-skills/core run test` passes (canonicalization tests). Foundation is ready — user stories can now be implemented in parallel where independent.

---

## Phase 3: User Story 1 — Extract from a Local stdio MCP Server (Priority: P1) 🎯 MVP

**Goal**: `npx @to-skills/mcp extract --command "..."` produces `skills/<name>/SKILL.md` with `mcp:` frontmatter and `references/tools.md` from a live stdio MCP server.

**Independent Test**: Run the CLI against `npx -y @modelcontextprotocol/server-filesystem /tmp`. Verify `skills/filesystem/SKILL.md` exists with YAML frontmatter containing `name`, `description`, `license`, `mcp:` block, and a Quick Reference table listing all filesystem tools. Verify `references/tools.md` has each tool with its parameter table derived from `inputSchema`.

### Introspection helpers (tools + resources + prompts)

- [ ] T030 [P] [US1] Create `packages/mcp/src/introspect/tools.ts` exporting `listTools(client: McpClient): Promise<ExtractedFunction[]>` — paginates `tools/list` until cursor exhausted; for each tool, resolves inputSchema via `resolveSchema` (T026); maps to `ExtractedFunction` with `parameters` derived from schema properties
- [ ] T031 [P] [US1] Create `packages/mcp/src/introspect/resources.ts` exporting `listResources(client: McpClient): Promise<ExtractedResource[]>` — paginates `resources/list`; skips when server's initialize capabilities omit `resources`
- [ ] T032 [P] [US1] Create `packages/mcp/src/introspect/prompts.ts` exporting `listPrompts(client: McpClient): Promise<ExtractedPrompt[]>` — paginates `prompts/list`; skips when server's initialize capabilities omit `prompts`
- [ ] T033 [P] [US1] Add unit test `packages/mcp/tests/unit/introspect-tools.test.ts` with a mocked `McpClient` returning paginated responses; assert full list is collected

### Main extract entry point

- [ ] T034 [US1] Create `packages/mcp/src/extract.ts` exporting `extractMcpSkill(options: McpExtractOptions): Promise<ExtractedSkill>` — for stdio transport: imports `StdioClientTransport` from SDK, spawns the server via `command`+`args`+`env`, wraps in `Client` from SDK, performs `initialize` handshake with client name `@to-skills/mcp` and current package version, calls listTools/listResources/listPrompts from T030-T032, assembles ExtractedSkill, ensures transport is closed on success and failure
- [ ] T035 [US1] Add `initialize`-handshake error mapping in `packages/mcp/src/extract.ts`: convert SDK errors to `McpError` with code `INITIALIZE_FAILED`, `TRANSPORT_FAILED`, `SERVER_EXITED_EARLY`, or `PROTOCOL_VERSION_UNSUPPORTED` based on error shape
- [ ] T036 [US1] Add capability-gating in `packages/mcp/src/extract.ts`: only call listResources when `capabilities.resources` is set; only call listPrompts when `capabilities.prompts` is set (per FR-007)
- [ ] T037 [US1] Add initialize-response `protocolVersion` check in `packages/mcp/src/extract.ts`: warn (stderr) if newer than SDK supports; throw `PROTOCOL_VERSION_UNSUPPORTED` if older than SDK minimum (per Edge Case in spec.md)

### Default adapter: `target-mcp-protocol`

- [ ] T038 [US1] Create `packages/target-mcp-protocol/src/frontmatter.ts` exporting `emitMcpFrontmatter(skillName: string, launchCommand: { command: string; args?: string[]; env?: Record<string, string> }): string` — uses `yaml` lib with `sortMapEntries: false`, flow style for args arrays (per research.md §7); returns a YAML document fragment
- [ ] T039 [US1] Create `packages/target-mcp-protocol/src/render.ts` exporting `McpProtocolAdapter` implementing `InvocationAdapter` — composes frontmatter from T038 with core's standard SKILL.md body emission, sets target `'mcp-protocol'`, fingerprint with package version
- [ ] T039a [P] [US1] Extend `packages/target-mcp-protocol/src/render.ts` (and make the helper exportable from `packages/core/src/renderer.ts` or a new `packages/core/src/references-resources.ts`) to emit `references/resources.md` into the returned `RenderedSkill` when `skill.resources?.length > 0`. Each resource MUST render URI template, name, description, and MIME type (FR-019). SKILL.md Quick Reference MUST include resources with relative links to this file (FR-017)
- [ ] T039b [P] [US1] Parallel counterpart to T039a for prompts — emit `references/prompts.md` into the returned `RenderedSkill` when `skill.prompts?.length > 0`, rendering each prompt's name, description, and argument table (name, description, required) per FR-020. Wire Quick Reference entries
- [ ] T040 [US1] Create `packages/target-mcp-protocol/src/index.ts` with `export default new McpProtocolAdapter()` so `require('@to-skills/target-mcp-protocol').default` resolves correctly per adapter-loader contract
- [ ] T041 [P] [US1] Add unit test `packages/target-mcp-protocol/tests/frontmatter.test.ts` snapshotting the YAML output for single-arg, multi-arg, and env-set cases

### CLI wiring (extract subcommand, stdio form only for this phase)

- [ ] T042 [US1] Create `packages/mcp/src/cli.ts` using commander: `extract` subcommand with `--command <cmd>`, `--arg <a>` (repeatable, `.collect`), `--env K=V` (repeatable), `--out <dir>` (default `skills`), `--max-tokens <n>` (default 4000), `--llms-txt`, `--force`, `--skip-audit`, `--canonicalize`/`--no-canonicalize`; HTTP/config flags stubbed with "not yet implemented" error (wired in Phase 4/7)
- [ ] T043 [US1] Create `packages/mcp/src/bin.ts` — executable entry point that calls `cli.ts`'s `program.parseAsync(process.argv)`; add shebang `#!/usr/bin/env node`
- [ ] T044 [US1] Wire CLI to extractor in `packages/mcp/src/cli.ts`: on `extract --command "..."`, build `McpExtractOptions` with stdio transport, call `extractMcpSkill`, then call `renderSkill` with `invocation: loadAdapter('mcp-protocol')`, then write result via core's filesystem writer to `<outDir>/<skillName>/`
- [ ] T045 [US1] Add collision detection in CLI writer: if output directory exists and `--force` not passed, throw `McpError` with code `DUPLICATE_SKILL_NAME` (exit 4)

### SIGINT / cleanup

- [ ] T046 [US1] Add SIGINT handler in `packages/mcp/src/bin.ts`: on interrupt, call the SDK client's `close()` to terminate the spawned stdio server, exit with code 130

### Integration test

- [ ] T047 [P] [US1] Add integration test `packages/mcp/tests/integration/stdio-filesystem.test.ts` that runs the CLI as a subprocess against `npx -y @modelcontextprotocol/server-filesystem /tmp`, asserts exit code 0, asserts `skills/filesystem/SKILL.md` exists, parses its frontmatter, verifies `mcp:` block, verifies Quick Reference lists all expected tools
- [ ] T047a [P] [US1] Integration test `packages/mcp/tests/integration/stdio-third-party-ts.test.ts` against `@modelcontextprotocol/server-everything` (the reference server that exposes tools + resources + prompts, closer to the "third-party TypeScript" category than filesystem). Asserts successful extraction of all three IR sections. Exercises SC-008 (server category 2 of 3)
- [ ] T047b [P] [US1] Integration test `packages/mcp/tests/integration/stdio-python-fastmcp.test.ts` against a minimal FastMCP-based Python server placed in `packages/mcp/tests/fixtures/py-server/server.py`. Gate the `describe` block with `describe.skipIf(!isPythonAvailable())` so local offline runs don't fail. Exercises SC-008 (server category 3 of 3)
- [ ] T048 [P] [US1] Add integration test `packages/mcp/tests/integration/stdio-programmatic.test.ts` that calls `extractMcpSkill` directly against the same server; asserts returned `ExtractedSkill` has `functions.length > 0`, `resources` populated if server advertises them, no `mcp:` frontmatter in the IR (adapter adds it at render time, not extract time)

**Checkpoint**: US1 is shippable as MVP. `npx @to-skills/mcp extract --command "..."` works end-to-end against any stdio MCP server.

---

## Phase 4: User Story 2 — Extract from a Remote HTTP MCP Server (Priority: P1)

**Goal**: `npx @to-skills/mcp extract --url <url>` produces a valid skill from a hosted HTTP MCP endpoint.

**Independent Test**: Run against a local mock SSE server that advertises 3 tools; verify `skills/<name>/SKILL.md` is produced. Then run with `--header "Authorization: Bearer XXX"` against an auth-required mock endpoint; verify the header is forwarded on initialize + list requests.

- [ ] T049 [US2] Add HTTP transport path in `packages/mcp/src/extract.ts`: import `StreamableHTTPClientTransport` from SDK, construct with `new URL(options.transport.url)` and `requestInit: { headers: options.transport.headers ?? {} }`
- [ ] T050 [US2] Add content-negotiation fallback in `packages/mcp/src/extract.ts`: if `StreamableHTTPClientTransport` fails with 404/405 on initial POST, retry with `SSEClientTransport` (SDK's explicit fallback pattern)
- [ ] T051 [US2] Activate `--url` and `--header` flags in `packages/mcp/src/cli.ts`: remove the "not implemented" stub for HTTP; `--header` uses `.collect` with parser that splits on first `:` and trims
- [ ] T052 [US2] Add mutual-exclusion validation in `packages/mcp/src/cli.ts` for `--command` / `--url` / `--config`: exit code 2 with a clear error if more than one or none are supplied
- [ ] T053 [P] [US2] Create test fixture `packages/mcp/tests/fixtures/mock-sse-server.ts` — a minimal HTTP server that speaks enough MCP to respond to initialize/tools-list with canned JSON; used by HTTP integration tests without external dependencies
- [ ] T054 [P] [US2] Add integration test `packages/mcp/tests/integration/http-sse.test.ts` starting the mock server from T053, running the CLI with `--url http://localhost:<port>/sse`, asserting successful skill emission
- [ ] T055 [P] [US2] Add integration test `packages/mcp/tests/integration/http-auth.test.ts` with a mock server that 401s without a specific header; verify `--header "Authorization: Bearer test-token"` passes through
- [ ] T056 [P] [US2] Add integration test `packages/mcp/tests/integration/http-unreachable.test.ts` asserting `--url http://localhost:1/` (closed port) exits non-zero with stderr containing "Connection refused" or SDK equivalent

**Checkpoint**: Extract works against both stdio and HTTP servers. Both P1 extract stories complete.

---

## Phase 5: User Story 4 — Bundle an MCP Server Project at Build Time (Priority: P1)

**Goal**: Running `to-skills-mcp bundle` in an MCP server's package emits `skills/<name>/SKILL.md` into the package root with self-referential `mcp:` frontmatter.

**Independent Test**: Create a fixture package with `bin: "./dist/server.js"` and `to-skills.mcp: { skillName: "my-server" }`. Run `bundle`. Verify `skills/my-server/SKILL.md` exists, frontmatter's `mcp:` block references the package by name via `npx -y <packageName>`, and package.json was NOT modified.

### Config reader and normalizer

- [ ] T057 [US4] Create `packages/mcp/src/bundle/config.ts` exporting `readBundleConfig(packageRoot: string): Promise<NormalizedConfig[]>` — reads `package.json`, parses `to-skills.mcp` (object or array), validates each entry against the JSON Schema in `contracts/package-json-config.md`, returns a normalized array
- [ ] T058 [US4] Add `bin` derivation to `packages/mcp/src/bundle/config.ts`: when entry has no `command`, read `package.json` `bin` field, derive `command: "node"` + `args: [binPath]` for single-bin; for multi-bin object, require explicit `command` or throw `MISSING_LAUNCH_COMMAND`
- [ ] T059 [P] [US4] Add unit test `packages/mcp/tests/unit/bundle-config.test.ts` covering: single-server object, server array, bin-derived launch command, multi-bin rejection, kebab-pattern enforcement for skillName, DUPLICATE_SKILL_NAME detection

### Main bundle entry point

- [ ] T060a [US4] Create `packages/mcp/src/bundle.ts` exporting `bundleMcpSkill(options?: McpBundleOptions): Promise<BundleResult>` skeleton — resolves `packageRoot`, calls `readBundleConfig` (T057), returns an empty `BundleResult`. No per-server work yet; this task establishes the entry point and config-loading boundary
- [ ] T060b [US4] Extend `packages/mcp/src/bundle.ts` with the per-server extract step — iterate normalized config entries, for each call `extractMcpSkill` with derived transport; on `McpError`, record the failure on the result but continue (batch semantics)
- [ ] T060c [US4] Extend `packages/mcp/src/bundle.ts` with the per-server render+write step — loop over requested invocation targets (single-target in this phase; multi-target wired in Phase 6), call `renderSkill` with the target's adapter, invoke the core filesystem writer to `<packageRoot>/skills/<skillName>/`, populate `WrittenSkill` entries in `BundleResult.skills`
- [ ] T060d [US4] Extend `packages/mcp/src/bundle.ts` with final bookkeeping — compute overall audit worst-severity across all skills, collect package.json warnings (T063 contributes content), return the populated `BundleResult`
- [ ] T061 [US4] Add self-reference frontmatter in `packages/target-mcp-protocol/src/frontmatter.ts`: when `AdapterContext.packageName` is set (bundle mode), emit `mcp: { <skillName>: { command: "npx", args: ["-y", "<packageName>"] } }` instead of the extract-mode's launch command (implements FR-033)
- [ ] T062 [US4] Add multi-bin `--package` form in `packages/target-mcp-protocol/src/frontmatter.ts`: when bundle-mode config indicates a named bin, emit `args: ["-y", "--package=<packageName>", "<binName>"]` per FR-034
- [ ] T063 [US4] Add `files`-field verification in `packages/mcp/src/bundle.ts`: after write, read `package.json.files`; if missing `dist` or `skills`, add an entry to `BundleResult.packageJsonWarnings` with the exact line the user should add; never writes to package.json (FR-035)

### CLI wiring for bundle

- [ ] T064 [US4] Add `bundle` subcommand to `packages/mcp/src/cli.ts` with flags `--package-root`, `--out`, `--max-tokens`, `--llms-txt`, `--force`, `--skip-audit`, `--canonicalize`/`--no-canonicalize`; calls `bundleMcpSkill`
- [ ] T065 [US4] Add bundle-mode exit code mapping in `packages/mcp/src/cli.ts`: exit 4 when config missing/malformed; exit 5 on `MISSING_LAUNCH_COMMAND`

### Integration test

- [ ] T066 [P] [US4] Create test fixture `packages/mcp/tests/fixtures/fake-server-package/` — a minimal TypeScript package with `package.json` declaring `bin`, `to-skills.mcp`, a one-file MCP server in `dist/server.js` (pre-built; no tsc run in tests), and a lockfile
- [ ] T067 [P] [US4] Add integration test `packages/mcp/tests/integration/bundle-basic.test.ts` running `bundle` against the T066 fixture, asserting `skills/my-server/SKILL.md` is written with correct npx-by-name frontmatter, and asserting the fixture's `package.json` is byte-identical before and after (no mutation)
- [ ] T067a [P] [US4] Integration test `packages/mcp/tests/integration/bundle-idempotent.test.ts` running `bundleMcpSkill` twice against the T066 fixture; compute SHA-256 of `SKILL.md` and each `references/*.md` after each run; assert hashes match across runs. Exercises the content-identical guarantee from FR-038 / SC-009 (post-canonicalization)
- [ ] T068 [P] [US4] Add integration test `packages/mcp/tests/integration/bundle-multi-server.test.ts` using a fixture with an array `to-skills.mcp` of two servers; asserts two skill directories are written independently
- [ ] T069 [P] [US4] Add integration test `packages/mcp/tests/integration/bundle-files-warning.test.ts` using a fixture whose `package.json` omits `skills/` from `files`; assert stderr contains the warning line AND the file was still written AND package.json is unmodified

**Checkpoint**: Bundle mode complete for default target. MCP-native consumption path works end-to-end.

---

## Phase 6: User Story 5 — Emit Skills for Non-MCP Agents via CLI Invocation Targets (Priority: P1)

**Goal**: `extract --invocation cli:mcpc` produces skills whose Quick Reference lists `mcpc` shell commands and whose frontmatter embeds the adapter fingerprint instead of `mcp:`.

**Independent Test**: Extract against the reference server with `--invocation cli:mcpc`. Verify `SKILL.md`'s frontmatter contains `generated-by: { adapter, version, target-cli-range }` and NO `mcp:` block. Verify `references/tools.md` documents each tool as `mcpc @<server> tools-call <tool> key:=value` commands with correct argument-tier rendering.

### `target-mcpc` adapter (primary)

- [ ] T070 [US5] Create `packages/target-mcpc/src/args.ts` exporting `encodeMcpcArgs(plan: Map<string, ParameterPlan>): { tier12: string[], tier3Fallback: string | null }` — consumes the classifier output from T024; emits `key:=value` for typed Tier 1, `key=value` for string-typed Tier 1, `parent.child:=value` for Tier 2, and a `--json '{...}'` argument for any Tier 3 fallback
- [ ] T071 [US5] Create `packages/target-mcpc/src/setup.ts` exporting `renderMcpcSetup(skillName: string, launchCommand: McpTransport, fingerprint: AdapterFingerprint): string` — returns a Markdown Setup section with `npm install -g mcpc` instructions, `mcpc connect` command, and a "Generated for mcpc 2.1.x via @to-skills/target-mcpc 1.0.0" line per FR-IT-012
- [ ] T072a [US5] Create `packages/target-mcpc/src/render.ts` scaffolding exporting `McpcAdapter` implementing `InvocationAdapter` with target `'cli:mcpc'`, fingerprint from the package's own version (read at build time via a generated constant or `require('../package.json').version`). `.render()` is a stub that throws `'not implemented'` — subsequent sub-tasks fill it in
- [ ] T072b [US5] Fill in `McpcAdapter.render()` frontmatter emission in `packages/target-mcpc/src/render.ts`: uses `generatedByFrontmatter()` (T084) to emit `generated-by: { adapter, version, target-cli-range }`; MUST NOT emit `mcp:` block. Verify via the T085 contract test after T078d lands
- [ ] T072c [US5] Fill in `McpcAdapter.render()` body composition in `packages/target-mcpc/src/render.ts`: emits the Setup section via `renderMcpcSetup` (T071), then the SKILL.md overview and description from the IR
- [ ] T072d [US5] Fill in `McpcAdapter.render()` Quick Reference + references/tools.md emission in `packages/target-mcpc/src/render.ts`: Quick Reference rows use `mcpc @<server> tools-call <tool> …` command shape; references/tools.md uses `renderCliParamTable` (T074a) annotated with both MCP param name and mcpc key. Also emit references/resources.md and references/prompts.md via the shared helpers from T039a/T039b when populated
- [ ] T073 [US5] Create `packages/target-mcpc/src/index.ts` with `export default new McpcAdapter()`
- [ ] T074 [P] [US5] Add unit test `packages/target-mcpc/tests/args.test.ts` with fixture schemas for each tier; snapshot-assert the emitted command lines
- [ ] T074a [P] [US5] Create `packages/mcp/src/adapter/param-table.ts` exporting `renderCliParamTable(tool: ExtractedFunction, plan: Map<string, ParameterPlan>, encodeFlag: (plan: ParameterPlan) => string): string`. Rendered table MUST have columns: `MCP Name | CLI Flag/Key | Type | Required | Description`. Add unit test `packages/mcp/tests/unit/param-table.test.ts` snapshotting the rendered table for a mixed-tier tool. Consumed by T072d and T078d
- [ ] T074b [P] [US5] Integration test `packages/mcp/tests/integration/cli-target-without-binary.test.ts` that runs extract with `--invocation cli:mcpc` in a subprocess whose `PATH` excludes any `mcpc` binary (set `PATH=/usr/bin:/bin` explicitly); asserts successful skill generation AND asserts the Setup section contains the install command (`npm install -g mcpc`). Exercises the Edge Case where the target CLI is absent at authoring time
- [ ] T075 [P] [US5] Add unit test `packages/target-mcpc/tests/render.test.ts` with a fixture ExtractedSkill; assert no `mcp:` frontmatter, presence of Setup section, fingerprint embedded in both human-readable Setup and machine-readable frontmatter

### `target-fastmcp` adapter (secondary)

- [ ] T076 [P] [US5] Create `packages/target-fastmcp/src/args.ts` — mirrors T070 but emits `key=value` (always stringy, fastmcp convention) and single-JSON-argument form for Tier 3
- [ ] T077 [P] [US5] Create `packages/target-fastmcp/src/setup.ts` — mirrors T071 with `pip install fastmcp` and fastmcp-specific connection instructions
- [ ] T078a [P] [US5] Create `packages/target-fastmcp/src/render.ts` scaffolding exporting `FastMcpAdapter` implementing `InvocationAdapter` with target `'cli:fastmcp'`, fingerprint from package version. `.render()` stubbed as throwing `'not implemented'`
- [ ] T078b [P] [US5] Fill in `FastMcpAdapter.render()` frontmatter emission — uses `generatedByFrontmatter()` (T084); MUST NOT emit `mcp:` block
- [ ] T078c [P] [US5] Fill in `FastMcpAdapter.render()` body — Setup section via `renderFastMcpSetup` (T077), then overview/description from IR
- [ ] T078d [P] [US5] Fill in `FastMcpAdapter.render()` Quick Reference + references/tools.md (+ resources.md + prompts.md when populated) using `renderCliParamTable` (T074a) with fastmcp's `key=value` encoder from T076. Same shared resources/prompts helpers as T072d
- [ ] T078e [P] [US5] Create `packages/target-fastmcp/src/index.ts` with `export default new FastMcpAdapter()`
- [ ] T079 [P] [US5] Add unit test `packages/target-fastmcp/tests/args.test.ts` covering all tiers with fastmcp-specific encoding

### CLI wiring: `--invocation` flag + multi-target dispatch

- [ ] T080 [US5] Add `--invocation <target>` flag to both `extract` and `bundle` subcommands in `packages/mcp/src/cli.ts`, using `.collect` to accept repeated values; default `['mcp-protocol']` if none provided
- [ ] T081 [US5] Add target-validation in `packages/mcp/src/cli.ts`: for each `--invocation` value, call `loadAdapter()` eagerly before launching any server; exit 2 with `UNKNOWN_TARGET`/`ADAPTER_NOT_FOUND` listing installed adapters if any fail
- [ ] T082 [US5] Update `packages/mcp/src/cli.ts` extract-mode execution: after `extractMcpSkill` returns, loop over requested adapters, call `renderSkill` for each, write each to its own output dir; if more than one target, disambiguate via `<skillName>-<target>` suffix (FR-IT-009)
- [ ] T083 [US5] Update `packages/mcp/src/bundle.ts` multi-target support: read `invocation` field from normalized config (string or array), combine with CLI `--invocation` override, loop as in T082

### Fingerprint embedding contract enforcement

- [ ] T084 [US5] Add `generatedByFrontmatter(fingerprint: AdapterFingerprint): Record<string, unknown>` helper in `packages/mcp/src/adapter/fingerprint.ts`; used by all CLI adapters to produce identical `generated-by:` frontmatter shape
- [ ] T084a [US5] Tighten the fingerprint dual-placement contract in the CLI adapters: update T072b and T078b to call `generatedByFrontmatter(this.fingerprint)` and merge the result into the rendered YAML frontmatter. Update T071 (and `renderFastMcpSetup` in T077) to embed the human-readable fingerprint line ("Generated for mcpc 2.1.x via @to-skills/target-mcpc 1.4.0"). Add assertion logic used by T085 — when the Setup section's embedded fingerprint disagrees with frontmatter's `generated-by`, the test fails. Implements FR-IT-012 completely
- [ ] T085 [P] [US5] Add contract test `packages/mcp/tests/contract/fingerprint.test.ts` asserting that rendering any `cli:*` adapter against a fixture skill produces a SKILL.md whose frontmatter contains `generated-by` AND does NOT contain `mcp:`, AND the frontmatter `generated-by.adapter`/`version` exactly match the adapter/version substrings in the Setup section. Run parametrized against both target-mcpc and target-fastmcp

### Adapter freshness audit

- [ ] T086 [US5] Create `packages/mcp/src/audit/freshness.ts` exporting `auditAdapterFreshness(skill: ExtractedSkill, embeddedFingerprint: AdapterFingerprint, installedAdapter: InvocationAdapter): AuditIssue[]` — returns a warning-severity issue (code `M5`) when `embeddedFingerprint.version < installedAdapter.fingerprint.version` (semver compare) per FR-IT-013
- [ ] T087 [P] [US5] Add unit test `packages/mcp/tests/unit/audit-freshness.test.ts` covering: same version (no warning), older embedded (warning), newer embedded (no warning — user downgraded intentionally)

### Multi-target integration test

- [ ] T088 [P] [US5] Add integration test `packages/mcp/tests/integration/multi-target.test.ts` that runs one extract with `--invocation mcp-protocol --invocation cli:mcpc`, asserts two skill directories are produced (`<name>-mcp-protocol/`, `<name>-mcpc/`), asserts both point at the same tools (proves target-agnostic extraction per SC-011), asserts the two SKILL.md files differ only in frontmatter + invocation-specific sections (same Quick Reference tool set, different command shapes)
- [ ] T088a [P] [US5] End-to-end test `packages/mcp/tests/e2e/cli-proxy.test.ts` exercising the CLI-as-proxy model for SC-010: (1) generate a skill with `--invocation cli:mcpc` against `server-filesystem`, (2) install `mcpc` into a temp env via `npm i --prefix tmp mcpc`, (3) run `mcpc connect` + one of the documented `mcpc @filesystem tools-call list_directory` commands from the generated SKILL.md, (4) parse stdout and assert expected output shape. Gate with `describe.skipIf(!isOnlineAndHasMcpc())` so offline CI runs don't fail

### Spec scenario coverage

- [ ] T089 [P] [US5] Add integration test `packages/mcp/tests/integration/cli-target-unknown.test.ts` running extract with `--invocation cli:nonexistent`; assert exit code 2, stderr lists installed adapters
- [ ] T090 [P] [US5] Add integration test `packages/mcp/tests/integration/cli-target-bundle.test.ts` running bundle with `cli:mcpc`; assert NO `mcp:` frontmatter emitted, Setup section present, files-warning unchanged

**Checkpoint**: All P1 user stories complete. The package is a full MVP — extract/bundle × mcp-protocol/cli:mcpc/cli:fastmcp = six end-to-end paths.

---

## Phase 7: User Story 3 — Batch Extract from an MCP Config File (Priority: P2)

**Goal**: `extract --config mcp.json` produces one skill directory per server listed in a Claude-Desktop-shaped config file.

**Independent Test**: Write a 3-server `mcp.json` (one stdio local, one HTTP, one with `disabled: true`). Run `extract --config mcp.json`. Verify 2 skill directories (skipping disabled). Then kill one of the servers before running; verify the other still extracts and exit code is non-zero with a clear diagnostic about which failed.

- [ ] T091 [US3] Create `packages/mcp/src/config/file-reader.ts` exporting `readMcpConfigFile(path: string): Promise<McpConfigFile>` — reads JSON, validates shape (`mcpServers` key with `Record<string, McpServerConfig>`), surfaces clear errors on malformed input
- [ ] T092 [US3] Add `--config <path>` handling to `extract` subcommand in `packages/mcp/src/cli.ts`: reads via T091, iterates over entries, skips `disabled: true`, runs extraction per entry
- [ ] T093 [US3] Add per-entry error containment in `packages/mcp/src/cli.ts` batch path: catch `McpError` from each server's extraction, log to stderr, continue with remaining servers; at end, exit 0 only if ALL succeeded (exit 1 with summary otherwise)
- [ ] T094 [P] [US3] Add integration test `packages/mcp/tests/integration/config-batch.test.ts` with a 3-server config file (2 live via stdio, 1 with `disabled: true`); assert 2 skill directories produced, disabled server skipped without error
- [ ] T095 [P] [US3] Add integration test `packages/mcp/tests/integration/config-partial-failure.test.ts` with a 2-server config where one points at a nonexistent command; assert the other still extracts, exit code non-zero, stderr names the failing server

---

## Phase 8: User Story 6 — Programmatic API for Build Pipelines (Priority: P2)

**Goal**: Library authors can drive extract and bundle from Node scripts; one extraction can be rendered against multiple targets without re-extracting.

**Independent Test**: Write a Node script that imports `extractMcpSkill` + `renderSkill` + `loadAdapter`, calls extract once, renders with two different targets, writes both to disk, asserts both files exist and match the target-specific conventions.

**Note**: most of the surface is already built in Phases 3-6. This phase adds exhaustive programmatic tests and the specific "monorepo multi-package" and "same extraction, two renders" guarantees.

- [ ] T096 [P] [US6] Add integration test `packages/mcp/tests/integration/programmatic-extract.test.ts` — imports `extractMcpSkill`, asserts returned IR has `functions`, `resources`, `prompts`, `configSurfaces` populated correctly per US6 AC1
- [ ] T097 [P] [US6] Add integration test `packages/mcp/tests/integration/programmatic-render-twice.test.ts` — calls extract once, calls renderSkill twice with different adapters, asserts SC-011 (same underlying IR, distinct outputs)
- [ ] T098 [P] [US6] Add integration test `packages/mcp/tests/integration/monorepo-bundle.test.ts` using two fixture packages each with its own `to-skills.mcp` and `skills/` directory; run `bundleMcpSkill` from each package root in sequence; assert no collision, each package gets its own `skills/` dir per US6 AC4
- [ ] T098a [P] [US6] Snapshot-equivalence test `packages/mcp/tests/integration/programmatic-vs-bundle.test.ts` — run extract+renderSkill pipeline against a fixture server, then run `bundleMcpSkill` against the same server via a fixture package wrapping it; assert the resulting `SKILL.md` and every `references/*.md` are byte-identical after canonicalization. Exercises SC-007
- [ ] T099 [US6] Add TypeScript API surface test `packages/mcp/tests/contract/api-surface.test.ts` that imports every public export from `@to-skills/mcp/dist/index.d.ts` and asserts each is defined (prevents accidental export removal across refactors)

---

## Phase 9: User Story 7 — Annotation Enrichment via Extended Metadata (Priority: P3)

**Goal**: MCP servers that emit `_meta.toSkills.{useWhen, avoidWhen, pitfalls}` under tool or serverInfo metadata produce SKILL.md output enriched with "When to Use", "Avoid When", and NEVER sections.

**Independent Test**: Build a mock MCP server that returns tool metadata with `_meta.toSkills.useWhen = ["..."]`. Run extract. Verify the rendered SKILL.md includes a "When to Use" section populated from the array.

- [ ] T100 [P] [US7] Extend `packages/mcp/src/introspect/tools.ts` to read `_meta.toSkills` from each tool — populates `ExtractedFunction.tags` with `useWhen`, `avoidWhen`, `pitfalls` keys when present; populates the aggregated `ExtractedSkill.useWhen/avoidWhen/pitfalls` arrays via core's existing aggregation
- [ ] T101 [P] [US7] Add `_meta.toSkills` reading to `packages/mcp/src/extract.ts` at the server level: if `initialize` response's `serverInfo._meta.toSkills` is set, populate `ExtractedSkill.remarks`, `ExtractedSkill.useWhen`, `packageDescription` from those fields per US7 AC3
- [ ] T102 [P] [US7] Add unit test `packages/mcp/tests/unit/meta-extension.test.ts` with mocked tool listings containing `_meta.toSkills`; assert the extracted IR has corresponding fields populated
- [ ] T103 [P] [US7] Add integration test `packages/mcp/tests/integration/meta-passthrough.test.ts` running bundle against a fixture server that emits `_meta.toSkills`; assert the committed SKILL.md contains the rendered "When to Use" / "Avoid When" / NEVER sections per US7 AC4

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: audit rules (M1-M5), llms.txt, token budgeting, documentation, spec-delta handling.

### Audit rules (all codes M1-M5)

- [ ] T104a [P] Create `packages/mcp/src/audit/rule-m1.ts` implementing the M1 rule (missing tool description → fatal severity). Export a single function `runM1(skill: ExtractedSkill): AuditIssue[]`
- [ ] T104b [P] Create `packages/mcp/src/audit/rule-m2.ts` implementing M2 (missing or invalid `inputSchema` → error severity). Coordinates with the `SCHEMA_REF_CYCLE` handling from T026 — cycle-failed schemas surface here as M2
- [ ] T104c [P] Create `packages/mcp/src/audit/rule-m3.ts` implementing M3 (missing `useWhen` annotation → warning). Checks both tool-level and server-level `useWhen` aggregation
- [ ] T104d [P] Create `packages/mcp/src/audit/rule-m4.ts` implementing M4 (generic tool name → alert). Heuristic match against a configurable list: `get`, `set`, `run`, `do`, `list`, `find`, `help`, `test`
- [ ] T104e Create `packages/mcp/src/audit/rules.ts` exporting `runMcpAudit(skill: ExtractedSkill, adapterFingerprint?: AdapterFingerprint, installedAdapter?: InvocationAdapter): AuditIssue[]` — aggregates M1-M4 from T104a-d and delegates to `auditAdapterFreshness` (T086) for M5. Deterministic order (severity descending, then code ascending)
- [ ] T105 [P] Add unit test `packages/mcp/tests/unit/audit-rules.test.ts` with fixture ExtractedSkill instances exercising each of M1-M5; one assertion per rule
- [ ] T106 Wire audit into `packages/mcp/src/extract.ts` + `packages/mcp/src/bundle.ts`: run rules via `runMcpAudit`, populate `AuditResult`, include in `BundleResult.skills[name].audit`; in bundle mode, exit non-zero on fatal/error severity unless `--skip-audit` per FR-041
- [ ] T107 [P] Add integration test `packages/mcp/tests/integration/audit-failing.test.ts` with a fixture server whose tools have blank descriptions; assert exit code 3 on bundle with default audit settings, and exit code 0 with `--skip-audit`
- [ ] T107a [P] Performance test `packages/mcp/tests/integration/bundle-perf.test.ts` with a synthetic fixture server exposing 30 tools / 10 resources / 5 prompts (generated programmatically at test-setup to avoid shipping a large fixture); measure bundle wall-clock excluding server-spawn time; assert under 30000ms. Gate with `describe.skipIf(process.env.CI !== 'true' && !process.env.RUN_PERF_TESTS)` to avoid flakiness on developer laptops. Exercises SC-006

### Token budgeting + namespace splitting

- [ ] T108 Integrate core's `truncateToTokenBudget` into `packages/target-mcp-protocol/src/render.ts`, `packages/target-mcpc/src/render.ts`, `packages/target-fastmcp/src/render.ts` for `references/*.md`; default 4000 tokens (FR-021)
- [ ] T108a [P] Token-budget integration test `packages/mcp/tests/integration/token-budget.test.ts` using a 20-tool synthetic server (per SC-002 threshold). Assert rendered `SKILL.md` < 500 tokens via core's token counter; assert `references/tools.md` < 4000 tokens with no split triggered
- [ ] T109 Add namespace-splitting to `packages/mcp/src/introspect/tools.ts` or as a post-process in each adapter: when `references/tools.md` would exceed budget, split by namespace prefix (detect `.` in tool names; group `github.issues.*` separately from `github.pulls.*`) per FR-022
- [ ] T110 [P] Add unit test `packages/mcp/tests/unit/namespace-split.test.ts` with a 150-tool fixture that triggers a split; assert the output contains `references/tools-<ns>.md` files and SKILL.md Quick Reference links all of them

### llms.txt emission

- [ ] T111 Wire `--llms-txt` flag to core's existing llms.txt emitter from both CLI subcommands; write alongside `SKILL.md` when the flag is set

### Additional edge cases from spec

- [ ] T112 [P] Add integration test `packages/mcp/tests/integration/zero-tools.test.ts` against a fixture server that exposes only resources (no tools); assert SKILL.md is still produced with a note explaining the server exposes only resources
- [ ] T113 [P] Add integration test `packages/mcp/tests/integration/schema-ref-cycle.test.ts` with a fixture server whose tool has recursive $ref; assert the tool appears in Quick Reference, parameter table is omitted, audit M2 warning is logged
- [ ] T114 [P] Add integration test `packages/mcp/tests/integration/tool-name-collision.test.ts` with a tool literally named `connect` under `cli:mcpc`; assert the rendered command uses the session alias prefix per spec edge-case handling

### Documentation

- [ ] T115 [P] Write `packages/mcp/README.md` covering install, extract/bundle usage, programmatic API (copy-edit from quickstart.md), link to adapter authoring guide
- [ ] T116 [P] Write `packages/target-mcp-protocol/README.md` documenting the adapter's contract, fingerprint format, when a consumer would pick this target
- [ ] T117 [P] Write `packages/target-mcpc/README.md` documenting mcpc version compatibility, argument-encoding rules, and the Setup commands it emits
- [ ] T118 [P] Write `packages/target-fastmcp/README.md` mirroring T117
- [ ] T119 [P] Add a "Building a Custom Adapter" doc at `packages/mcp/docs/adapter-authoring.md` that walks through packaging, publishing, and testing a third-party `@org/to-skills-target-<n>` package

### Changesets

- [ ] T120 Add a changeset at `.changeset/feat-mcp-extract-bundle.md` describing the new package set, the new IR fields in core (minor bump), and the `renderSkill` extension (minor bump)

### Spec-delta handling

- [ ] T121 Record a spec-delta note at `specs/001-mcp-extract-bundle/spec-deltas.md` documenting the soften of FR-038 / SC-009 from "byte-identical" to "content-identical after canonicalization" per research.md §2; link this note from the checklist's open-items entry
- [ ] T122 [P] Run `pnpm -r run type-check && pnpm -r run test && pnpm -r run build` at repo root to verify the full workspace passes; fix any cross-package type issues surfaced by the new exports

---

## Dependencies

```text
Phase 1 (Setup) ────────────────────┐
                                    ↓
Phase 2 (Foundational) ─────────────┤
         ├─ core IR extensions      │
         ├─ canonicalization        │
         ├─ adapter interface       │
         ├─ classifier              │
         ├─ schema $ref             │
         └─ option types            │
                                    ↓
     ┌──────────┬──────────┬───────┴───────┬──────────┬──────────┐
     ↓          ↓          ↓               ↓          ↓          ↓
  Phase 3    Phase 4    Phase 5         Phase 6   Phase 7    Phase 8
  US1 (P1)   US2 (P1)   US4 (P1)        US5 (P1)  US3 (P2)   US6 (P2)
  stdio      HTTP       bundle          CLI       batch      programmatic
  extract    extract    mode            targets   config     tests
     │          │          │               │          │          │
     │          │          │               │          │          │
     └──────────┴──────────┴───────┬───────┴──────────┴──────────┘
                                   ↓
                               Phase 9
                               US7 (P3)
                               annotation
                               enrichment
                                   ↓
                               Phase 10
                               Polish
```

**Hard dependencies**:

- Phase 2 T020 (adapter interface) is a prerequisite for Phases 3-6.
- Phase 3 (US1) is a prerequisite for Phase 5 (US4) — bundle mode is extract mode + orchestration.
- Phase 5 (US4) and Phase 6 (US5) are independent of each other but both build on Phase 3.
- Phase 7 (US3) is independent of Phases 4-6; only needs Phase 3's stdio extraction primitive.
- Phase 9 (US7) is independent and can run anytime after Phase 3.

**Soft dependencies**: Phase 10 can start after any user story phase completes (audit rules benefit from having real fixture data from earlier integration tests).

---

## Parallel Execution Examples

### Within Phase 1 (Setup) — mostly parallel

T002, T003, T004 (adapter package.json files) can run in parallel.
T006, T007 (tsconfig) can run in parallel with each other.
T010 (README stubs) can run in parallel across all four packages.

### Within Phase 2 (Foundational) — mostly sequential (one cohesive type system)

Most tasks here touch `packages/core/src/types.ts` or `packages/mcp/src/adapter/*` — limit parallelism to:

- T018 (canonical test) parallel with T019 (renderer extension) once T017 is done
- T022, T025, T027 (loader/classifier/schema unit tests) all parallel after their implementations land

### Within Phase 3 (US1) — high parallelism

T030, T031, T032 (introspect tools/resources/prompts) run in parallel.
T033, T041, T047, T048 (tests) all parallel with each other and with their implementation peers.

### Within Phase 6 (US5) — adapter families parallel

The target-mcpc tasks (T070-T075) and target-fastmcp tasks (T076-T079) can run in two parallel streams.
All contract tests (T085, T087-T090) parallel with each other after dependencies.

---

## Implementation Strategy

**MVP scope** = Phase 1 + Phase 2 + Phase 3 + the mcp-protocol adapter from Phase 6 (already covered inline in Phase 3 as the default target).

At that point the package can:

- Extract from any local stdio MCP server
- Render with `mcp:` frontmatter
- Be consumed by OpenCode/Codex/Cursor-compatible harnesses

**Incremental delivery**:

1. **v0.1**: MVP (Phases 1-3). Release as `@to-skills/mcp@0.1.0`, `@to-skills/target-mcp-protocol@0.1.0`. Users can extract stdio servers.
2. **v0.2**: add HTTP (Phase 4). Users can target hosted servers.
3. **v0.3**: add bundle (Phase 5). Maintainers can ship dual-consumption packages.
4. **v0.4**: add CLI targets (Phase 6). Non-MCP agents unblocked. Publishes `target-mcpc` and `target-fastmcp`.
5. **v0.5**: add batch config (Phase 7) + programmatic completeness (Phase 8).
6. **v0.6**: annotation enrichment (Phase 9).
7. **v1.0**: polish (Phase 10) + docs + audit rules + changesets → first stable release.

---

## Total Task Count: 148 tasks (after superb.review gap closure)

- Phase 1 (Setup): 10 tasks (T001-T010)
- Phase 2 (Foundational): 19 tasks (T011-T029)
- Phase 3 (US1, P1, MVP): 23 tasks (T030-T048 + T039a, T039b, T047a, T047b)
- Phase 4 (US2, P1): 8 tasks (T049-T056)
- Phase 5 (US4, P1): 17 tasks (T057-T069 with T060 split into T060a/b/c/d, + T067a)
- Phase 6 (US5, P1): 32 tasks (T070-T090 with T072 split into T072a-d, T078 split into T078a-e, + T074a, T074b, T084a, T088a)
- Phase 7 (US3, P2): 5 tasks (T091-T095)
- Phase 8 (US6, P2): 5 tasks (T096-T099 + T098a)
- Phase 9 (US7, P3): 4 tasks (T100-T103)
- Phase 10 (Polish): 25 tasks (T104-T122 with T104 split into T104a-e, + T107a, T108a)

**Gap closure from superb.review**: +12 new tasks (T039a/b, T047a/b, T067a, T074a/b, T084a, T088a, T098a, T107a, T108a) + 14 sub-tasks from splitting T060, T072, T078, T104 for granularity. Net +26 tasks.

**Independently testable slices**: Each phase (3 through 9) ships a demonstrable capability; checkpoints after Phases 3, 4, 5, 6 each mark a shippable version.

**Parallelizable tasks**: 79 tasks carry the `[P]` marker.
