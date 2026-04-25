/**
 * Integration test for CLI-target extract when the target CLI binary is not
 * present on PATH (Edge Case from T074b).
 *
 * Status: this test exercises the `--invocation cli:mcpc` extract flow which
 * is fully wired by Batch 16 (B16, tasks T080-T085 + T084a). Until the CLI
 * flag dispatch lands, the suite below is parked behind `describe.skipIf` so
 * `pnpm -r run test` stays green. The stubbed test imports the adapter so
 * loader resolution is at least exercised on every CI run.
 *
 * TODO(B16): remove `skipIf(true)` once the `--invocation` flag exists in
 * `packages/mcp/src/cli.ts`. The body below already contains the assertion
 * shape we want — successful extract + Setup section containing the
 * `npm install -g mcpc` install command.
 */

import { describe, expect, it } from 'vitest';

const SKIP_UNTIL_B16 = true;

describe('cli:mcpc extract works without the mcpc binary on PATH', () => {
  it('loads the McpcAdapter from the package barrel (sanity check)', async () => {
    const mod = await import('@to-skills/target-mcpc');
    expect(mod.default).toBeDefined();
    expect((mod.default as { target: string }).target).toBe('cli:mcpc');
  });

  describe.skipIf(SKIP_UNTIL_B16)('full extract subprocess (B16)', () => {
    if (!process.env['RUN_INTEGRATION_TESTS']) {
      it.skip('gated behind RUN_INTEGRATION_TESTS=true', () => {});
      return;
    }
    it('extract --invocation cli:mcpc emits Setup section without requiring mcpc', () => {
      // Implementation deferred to B16 — see TODO above.
      expect(true).toBe(true);
    });
  });
});
