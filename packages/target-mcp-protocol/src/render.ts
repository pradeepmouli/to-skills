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
 * MCP-native agent harnesses parse to launch the server over stdio or
 * connect to it over HTTP.
 *
 * Launch-shape resolution (per research.md §7):
 *
 * 1. **Bundle mode** — if `ctx.packageName` is set (the host's bundle command
 *    flagged this skill as self-referential), the adapter emits
 *    `command: npx` + `args: [-y, <packageName>]`. This wins over both
 *    `httpEndpoint` and `launchCommand`.
 * 2. **HTTP-extract mode** — else if `ctx.httpEndpoint` is set, emits a
 *    `{ url, headers }` shape (no shell launch).
 * 3. **Stdio-extract mode** — else `ctx.launchCommand` is used verbatim. The
 *    host extract pipeline derives this from the user-supplied stdio config.
 * 4. **None set** — `render()` throws `McpError(MISSING_LAUNCH_COMMAND)`. The
 *    host always populates exactly one of the three.
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
   * @throws `McpError` with code `MISSING_LAUNCH_COMMAND` when none of
   *   `ctx.packageName`, `ctx.httpEndpoint`, or `ctx.launchCommand` is set.
   */
  async render(skill: ExtractedSkill, ctx: AdapterRenderContext): Promise<RenderedSkill> {
    let launchCommand: McpLaunchCommand;
    if (ctx.packageName) {
      // Bundle mode: emit npx-by-name self-reference. Wins over any explicit
      // launchCommand because the package is the canonical self-launch entry point.
      // When the host also passes binName (multi-bin packages, FR-034), use the
      // explicit `--package=` form so npx invokes the right bin rather than the
      // package's "directories.bin" or single-bin default.
      launchCommand = ctx.binName
        ? { command: 'npx', args: ['-y', `--package=${ctx.packageName}`, ctx.binName] }
        : { command: 'npx', args: ['-y', ctx.packageName] };
    } else if (ctx.httpEndpoint) {
      // HTTP-extract mode: emit {url, headers} shape. No shell launch.
      launchCommand = ctx.httpEndpoint.headers
        ? { url: ctx.httpEndpoint.url, headers: ctx.httpEndpoint.headers }
        : { url: ctx.httpEndpoint.url };
    } else if (ctx.launchCommand) {
      launchCommand = ctx.launchCommand;
    } else {
      throw new McpError(
        'McpProtocolAdapter.render: none of ctx.packageName, ctx.httpEndpoint, or ctx.launchCommand provided',
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
