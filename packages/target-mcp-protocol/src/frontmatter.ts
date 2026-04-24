/**
 * Frontmatter composition for the `mcp-protocol` invocation target.
 *
 * @remarks
 * MCP-native agent harnesses (OpenCode, Codex, Cursor) discover MCP server
 * launch parameters from a `mcp:` frontmatter block in `SKILL.md`. This module
 * builds the structured object that the core renderer's `additionalFrontmatter`
 * mechanism serializes via the `yaml` package.
 *
 * Per research.md §7, the shape is:
 *
 * ```yaml
 * mcp:
 *   <skillName>:
 *     command: npx
 *     args:
 *       - -y
 *       - "@modelcontextprotocol/server-filesystem"
 *     env:
 *       FOO: bar
 * ```
 *
 * @module frontmatter
 */

/**
 * MCP launch command — what the agent harness should spawn to talk to this server
 * over stdio.
 */
export interface McpLaunchCommand {
  /** Executable to spawn (e.g. `npx`, `node`, `uvx`). */
  readonly command: string;
  /** Argument vector. Omitted from emitted YAML when empty/undefined. */
  readonly args?: readonly string[];
  /** Environment variables. Omitted from emitted YAML when empty/undefined. */
  readonly env?: Readonly<Record<string, string>>;
}

/**
 * Build the structured `mcp:` frontmatter object for the default invocation target.
 *
 * The returned object is a plain JavaScript object — NOT a YAML string. The host
 * renderer (in `@to-skills/core`) merges it into the SKILL.md frontmatter via
 * `SkillRenderOptions.additionalFrontmatter` and serializes through the `yaml`
 * package, which handles quoting and indentation.
 *
 * Field order in the inner `{ command, args?, env? }`:
 *
 * 1. `command` (always present)
 * 2. `args` (omitted when undefined or empty)
 * 3. `env` (omitted when undefined or empty)
 *
 * @param skillName - kebab-case skill identifier; becomes the inner mapping key.
 * @param launchCommand - command + args + env to embed.
 * @returns `{ mcp: { [skillName]: { command, args?, env? } } }` ready for yaml serialization.
 */
export function emitMcpFrontmatter(
  skillName: string,
  launchCommand: McpLaunchCommand
): Record<string, unknown> {
  const inner: Record<string, unknown> = { command: launchCommand.command };

  if (launchCommand.args && launchCommand.args.length > 0) {
    // Copy to a mutable plain array so YAML lib treats it as a sequence.
    inner['args'] = [...launchCommand.args];
  }

  if (launchCommand.env && Object.keys(launchCommand.env).length > 0) {
    inner['env'] = { ...launchCommand.env };
  }

  return { mcp: { [skillName]: inner } };
}
