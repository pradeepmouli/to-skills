/**
 * Smoke test for `@to-skills/mcp/adapter-utils` subpath export.
 *
 * Asserts the subpath module exposes the 7 helpers mandated by
 * `contracts/adapter-utils.md` and that each is callable. Behavioral
 * correctness is gated by the inline-snapshot tests in `target-mcpc` and
 * `target-fastmcp` — this file only protects against accidental removal of
 * a public symbol.
 */

import { describe, expect, it } from 'vitest';
import {
  collapseTrailingNewlines,
  formatCliMarker,
  parameterToSchema,
  planForTool,
  renderToolsBody,
  resolveLaunchCommand,
  shellQuote
} from '../../src/adapter/cli-tools-helpers.js';

describe('@to-skills/mcp/adapter-utils — public surface', () => {
  it('exports the 7 mandated helpers as functions', () => {
    expect(typeof resolveLaunchCommand).toBe('function');
    expect(typeof formatCliMarker).toBe('function');
    expect(typeof shellQuote).toBe('function');
    expect(typeof collapseTrailingNewlines).toBe('function');
    expect(typeof renderToolsBody).toBe('function');
    expect(typeof planForTool).toBe('function');
    expect(typeof parameterToSchema).toBe('function');
  });
});
