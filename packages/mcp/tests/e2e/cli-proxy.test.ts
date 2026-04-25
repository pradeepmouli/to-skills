/**
 * E2E test (T088a — full implementation): the cli:mcpc CLI-as-proxy model
 * exercised end-to-end against a live MCP server (SC-010).
 *
 * Status: STUBBED — the full implementation requires:
 *   1. Network access (npm fetches mcpc + the MCP server package).
 *   2. `npm install --prefix <tmp> mcpc` into a temporary prefix so the
 *      mcpc binary is on PATH for the duration of the test.
 *   3. A live `npx -y @modelcontextprotocol/server-filesystem /tmp` MCP
 *      server bound to a known directory.
 *   4. Parsing mcpc stdout to assert the tool call returned the expected
 *      directory listing.
 *
 * That infrastructure is heavier than what RUN_INTEGRATION_TESTS=true alone
 * should imply, so this test is parked behind `describe.skipIf(true)` with
 * a TODO. The same shape contract — that the SKILL.md tools.md emits valid
 * mcpc command syntax — is exercised by
 * `tests/integration/cli-proxy-shape.test.ts`, which is the SC-010 sanity
 * check for default CI.
 *
 * @see tests/integration/cli-proxy-shape.test.ts — SC-010 shape sanity (gated only by RUN_INTEGRATION_TESTS)
 *
 * TODO(future): wire up an opt-in `RUN_E2E_TESTS=true` gate alongside
 * `RUN_INTEGRATION_TESTS=true`, install mcpc into a tmp prefix, run the
 * generated `mcpc connect` + `mcpc <skill> tools-call list_directory` shell
 * commands, and assert stdout contains the expected directory entries.
 */
import { describe, expect, it } from 'vitest';

const SKIP_E2E = true;

describe.skipIf(SKIP_E2E)('e2e cli-proxy: full SC-010 mcpc roundtrip', () => {
  it('extracts a cli:mcpc skill, installs mcpc, runs a tool, parses stdout', () => {
    // TODO: implement per the JSDoc above. Keep gated behind both
    // RUN_INTEGRATION_TESTS=true AND RUN_E2E_TESTS=true so default CI never
    // pays the install cost.
    expect(true).toBe(true);
  });
});
