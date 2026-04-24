/**
 * `McpProtocolAdapter` — default invocation adapter for MCP-native harnesses.
 *
 * Delegates body rendering to `@to-skills/core`'s default path and injects the
 * `mcp:` frontmatter that tells OpenCode/Codex/Cursor how to launch the server.
 * Inherits resources/prompts reference emission from core's shared helpers.
 *
 * @module render
 */

import type {
  AdapterFingerprint,
  AdapterRenderContext,
  ExtractedSkill,
  RenderedSkill
} from '@to-skills/core';
import { renderSkill } from '@to-skills/core';
import type { InvocationAdapter } from '@to-skills/mcp';
import { McpError } from '@to-skills/mcp';
import { emitMcpFrontmatter, type McpLaunchCommand } from './frontmatter.js';
import { PACKAGE_VERSION } from './version.js';

/**
 * Default invocation adapter: emits SKILL.md with `mcp:` frontmatter that
 * MCP-native agent harnesses parse to launch the server over stdio.
 *
 * Launch-command resolution (per research.md §7):
 *
 * 1. **Bundle mode** — if `ctx.packageName` is set (the host's bundle command
 *    flagged this skill as self-referential), the adapter emits
 *    `command: npx` + `args: [-y, <packageName>]`. This wins over any
 *    explicit `launchCommand`.
 * 2. **Extract mode** — otherwise, `ctx.launchCommand` is used verbatim. The
 *    host extract pipeline derives this from the user-supplied stdio config.
 * 3. **Neither set** — `render()` throws a `TypeError`. The host always
 *    populates one or the other.
 *
 * @remarks
 * The adapter does NOT render its own body content — it calls `renderSkill`
 * with `invocation: undefined` to dispatch through core's default synchronous
 * path, then injects the structured frontmatter object via
 * `additionalFrontmatter`. This guarantees parity with non-MCP skills and means
 * future renderer features (Quick Reference enhancements, new sections) work
 * out of the box for MCP skills too.
 */
export class McpProtocolAdapter implements InvocationAdapter {
  readonly target = 'mcp-protocol' as const;
  readonly fingerprint: AdapterFingerprint;

  constructor() {
    this.fingerprint = {
      adapter: '@to-skills/target-mcp-protocol',
      version: PACKAGE_VERSION
    };
  }

  /**
   * Render an `ExtractedSkill` into a `RenderedSkill` carrying `mcp:` frontmatter.
   *
   * @throws `McpError` with code `MISSING_LAUNCH_COMMAND` when neither
   *   `ctx.packageName` nor `ctx.launchCommand` is set.
   */
  async render(skill: ExtractedSkill, ctx: AdapterRenderContext): Promise<RenderedSkill> {
    let launchCommand: McpLaunchCommand;
    if (ctx.packageName) {
      // Bundle mode: emit npx-by-name self-reference. Wins over any explicit
      // launchCommand because the package is the canonical self-launch entry point.
      launchCommand = { command: 'npx', args: ['-y', ctx.packageName] };
    } else if (ctx.launchCommand) {
      launchCommand = ctx.launchCommand;
    } else {
      throw new McpError(
        'McpProtocolAdapter.render: neither ctx.packageName nor ctx.launchCommand provided',
        'MISSING_LAUNCH_COMMAND'
      );
    }

    const additionalFrontmatter = emitMcpFrontmatter(ctx.skillName, launchCommand);

    // Delegate body rendering + references emission to core's default path.
    // `invocation: undefined` dispatches the synchronous overload; `namePrefix`
    // ensures core's toSkillName() yields the same skillName the host computed.
    const baseRendered = renderSkill(skill, {
      maxTokens: ctx.maxTokens,
      additionalFrontmatter,
      invocation: undefined,
      namePrefix: ctx.skillName
    });

    return baseRendered;
  }
}
