/**
 * Integration test (T096) — US6 AC1: programmatic `extractMcpSkill` populates
 * the IR with all three MCP capability surfaces (tools/resources/prompts).
 *
 * Calls `extractMcpSkill` directly (no CLI subprocess) against
 * `@modelcontextprotocol/server-everything` — the reference server that
 * advertises every MCP primitive — and asserts:
 *
 *   1. `functions.length > 0`     (tools/list returned at least one tool)
 *   2. `resources.length > 0`     (capability gated; server-everything has it)
 *   3. `prompts.length > 0`       (capability gated; server-everything has it)
 *   4. `configSurfaces` is undefined or empty — the MCP IR doesn't populate
 *      this field. configSurfaces is the TypeDoc/CLI extractor's territory;
 *      asserting its absence guards against future cross-pollination.
 *   5. No `mcp:` block on the IR — that lives in the rendered SKILL.md
 *      frontmatter only, emitted by target-mcp-protocol at render time.
 *   6. No `setup` field on the IR — Setup-section emission is the cli:* adapter's
 *      render-time concern, not the IR's.
 *
 * Gated via `RUN_INTEGRATION_TESTS=true` so the default `pnpm test` doesn't
 * spawn a child npx process.
 */
import { describe, expect, it } from 'vitest';
import { extractMcpSkill } from '../../src/index.js';

const RUN = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!RUN)('programmatic extract — server-everything (US6 AC1)', () => {
  it('returns IR with functions + resources + prompts populated, and no render-time fields', async () => {
    const skill = await extractMcpSkill({
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everything']
      }
    });

    // 1. tools/list always runs.
    expect(skill.functions.length).toBeGreaterThan(0);

    // 2. resources advertised by server-everything.
    expect(skill.resources).toBeDefined();
    expect(skill.resources!.length).toBeGreaterThan(0);

    // 3. prompts advertised by server-everything.
    expect(skill.prompts).toBeDefined();
    expect(skill.prompts!.length).toBeGreaterThan(0);

    // 4. configSurfaces is NOT populated by the MCP extractor. Either undefined
    //    or empty is acceptable; the contract is that the IR carries no CLI/
    //    TypeDoc-specific configuration data.
    const irWithSurfaces = skill as unknown as { configSurfaces?: unknown[] };
    if (irWithSurfaces.configSurfaces !== undefined) {
      expect(Array.isArray(irWithSurfaces.configSurfaces)).toBe(true);
      expect((irWithSurfaces.configSurfaces as unknown[]).length).toBe(0);
    }

    // 5. No `mcp:` block in the IR — render-time concern only.
    expect(skill).not.toHaveProperty('mcp');

    // 6. No `setup` field in the IR — render-time concern only (cli:* adapters).
    expect(skill).not.toHaveProperty('setup');
  }, 60_000);
});
