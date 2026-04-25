/**
 * Integration test: call `extractMcpSkill` directly (bypassing the CLI) and
 * verify the returned IR object. Complements the subprocess CLI tests —
 * exercises the programmatic surface consumers would use.
 *
 * Gated via `RUN_INTEGRATION_TESTS=true`.
 */
import { describe, expect, it } from 'vitest';
import { extractMcpSkill } from '../../src/index.js';

const RUN = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!RUN)('programmatic extract — server-everything', () => {
  it('returns ExtractedSkill with tools, resources, prompts populated', async () => {
    const skill = await extractMcpSkill({
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everything']
      }
    });

    expect(skill.functions.length).toBeGreaterThan(0);
    expect(skill.resources?.length ?? 0).toBeGreaterThan(0);
    expect(skill.prompts?.length ?? 0).toBeGreaterThan(0);
    // IR has no `mcp:` frontmatter — that's an adapter render-time concern.
    expect(skill).not.toHaveProperty('mcp');
  }, 60_000);
});
