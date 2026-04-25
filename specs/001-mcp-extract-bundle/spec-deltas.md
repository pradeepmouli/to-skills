# Spec Deltas — `001-mcp-extract-bundle`

This file tracks places where the implementation deviated from the literal spec, with rationale. Each entry references the FR/SC/task number and the commit that resolved it. T121 (Phase 10 Polish) seeds this file; subsequent batches append as needed.

---

## Delta 1 — FR-038 / SC-009: byte-identical → content-identical idempotency

**Spec text**: "Output produced by re-running extract or bundle MUST be byte-identical when the upstream MCP server hasn't changed."

**Delta**: Softened to **content-identical after canonicalization**.

**Rationale**: The MCP SDK does not guarantee deterministic ordering for `tools/list` / `resources/list` / `prompts/list` responses. The `@apidevtools/json-schema-ref-parser` resolver also produces non-deterministic key ordering for resolved `$defs`. Both manifest as cosmetic byte-level diffs without any change in semantic content.

**Resolution** (Phase 2, B2 — `c4ff375`): Added `packages/core/src/canonical.ts` with a post-render `canonicalize()` pass that:

- Sorts YAML frontmatter keys
- Sorts arrays with stable name-keyed ordering
- Strips timestamps via regex
- LF line endings
- Collapses blank-line runs
- Trims trailing whitespace

The integration test `tests/integration/bundle-idempotent.test.ts` (T067a) verifies `SHA-256(SKILL.md_after_run_1) === SHA-256(SKILL.md_after_run_2)` post-canonicalization. Two consecutive runs against the same fixture produce identical hashes.

**Status**: ACTIVE — this is the operative contract going forward. Future SDK releases that stabilize their iteration order would let us tighten back to byte-identical pre-canonicalization, but the canonicalization pass is cheap and adapter-agnostic, so the relaxation is permanent.

---

## Delta 2 — T110: Quick Reference linking to namespace-split files (B22, partial)

**Spec text**: "Add unit test [...] with a 150-tool fixture that triggers a split; assert the output contains `references/tools-<ns>.md` files **and SKILL.md Quick Reference links all of them**."

**Delta**: Quick Reference linking to per-namespace split files is not implemented in B22.

**Rationale**: The Quick Reference section of SKILL.md is rendered by `@to-skills/core`'s default render path, which lists references **per export-kind** (functions, classes, types, etc.) rather than per file. The CLI adapters (`target-mcpc`, `target-fastmcp`) emit their own per-namespace `references/tools-<ns>.md` files post-`renderSkill`, so threading per-file links into core's Quick Reference would require core changes that go beyond Phase 10's scope.

The split files DO appear on disk and are token-budget-respecting (FR-022 emit). They just aren't enumerated in the SKILL.md "available references" hint. Agents that read the references directory directly (as most MCP harnesses do) discover the split files normally.

**Resolution** (Phase 10, B22 — `38ece5d`): The unit test asserts file emission via `rendered.references` — the second half of T110's acceptance criterion (Quick Reference text linking) is deferred. Documented in the test's docblock and in the helper's JSDoc.

**Status**: DEFERRED. To close the gap fully, core's `renderQuickReference` would need a per-file enumeration mode that adapters can opt into. Track as a future enhancement; the current behavior is functionally correct (split files exist) and only loses a navigation hint in the SKILL.md body.

---

## Delta 3 — T037: protocol-version runtime check (B7)

**Spec text**: "After `client.connect()` succeeds, call `checkProtocolVersion(serverVersion)` to validate against SDK min/max."

**Delta**: The `checkProtocolVersion` helper is implemented and unit-tested but not wired into `extractMcpSkill`.

**Rationale**: SDK 1.29.0 does not expose the negotiated protocol version via a public getter. `client.getServerVersion()` returns the server's `Implementation` (name + version), not the protocol version. The SDK's internal `connect()` already validates min/max protocol version against `SUPPORTED_PROTOCOL_VERSIONS`, so the helper would be belt-and-suspenders at this point.

**Resolution** (Phase 3, B7 — `cf71acb`): Helper landed at `packages/mcp/src/introspect/protocol-version.ts` with full unit tests. Integration deferred via JSDoc TODO in `extract.ts`. When the SDK exposes (e.g.) `client.getNegotiatedProtocolVersion()`, the integration is a one-line addition.

**Status**: DEFERRED. Not load-bearing — the SDK's internal validation covers the protocol-mismatch path.

---

## Delta 4 — Server-level `_meta.toSkills` enrichment (B20)

**Spec text** (US7 AC3): "When the server emits `serverInfo._meta.toSkills.{remarks, packageDescription, useWhen, avoidWhen, pitfalls}`, populate the corresponding skill-level fields."

**Delta**: Server-level `_meta` is read correctly but does NOT survive SDK validation in 1.29.0.

**Rationale**: The MCP SDK's `ImplementationSchema` uses Zod `$strip` semantics, which silently drops unknown keys (including `_meta`) during initialize-response validation on the client side. The reader code (`extract.ts::applyMetaEnrichment`) is in place and works correctly when given a non-stripped `serverInfo`, but with SDK 1.29.0 the input never carries `_meta`.

**Resolution** (Phase 9, B20 — `df268d5`): Per-tool `_meta.toSkills` works today (the `Tool` schema is looser). Server-level reader is forward-compat for a future SDK release that relaxes `ImplementationSchema`, or for non-SDK MCP clients that pass raw `Implementation` objects. Documented in `extract.ts` JSDoc and in `meta-passthrough.test.ts`.

**Status**: FORWARD-COMPAT. The unit tests bypass the SDK via `vi.mock` and verify both layers; the integration test asserts per-tool meta only.

---

## Delta 5 — `args: []` vs absent on bundle frontmatter (B18 fix)

**Implementation note**, not a spec deviation. Recorded for completeness.

When a bundle entry omits `args`, the MCP frontmatter formerly emitted `args: []` (empty array YAML key) while `extractOpts.transport.args` was `undefined`. The two paths represented the same launch but rendered differently.

**Resolution** (Phase 7, B18-fix — `2f9ec4a`): Frontmatter now omits the `args` key entirely when `entry.args` is undefined, matching the spawn shape.

---

## Conventions for adding deltas

When future batches need to record a deviation:

1. Add a new `## Delta N — <one-line summary>` section.
2. Quote the spec text being deviated from.
3. State the actual delta in one paragraph.
4. Explain the rationale (constraint, ambiguity, or trade-off).
5. Reference the resolving commit SHA + batch ID.
6. Mark status: ACTIVE / DEFERRED / FORWARD-COMPAT / RESOLVED-IN-LATER-PHASE.

Keep entries terse but specific enough for a future maintainer to understand why the deviation exists without re-reading the entire spec history.
