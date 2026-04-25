/**
 * Commander-based CLI wiring for `@to-skills/mcp`.
 *
 * Exposes `buildProgram()`, which constructs a `Command` tree with:
 * - `extract` — connects to a running MCP server, renders a SKILL.md, and
 *   writes it (plus `references/*.md`) under the configured output directory.
 * - `bundle` — stubbed; lands in Phase 5.
 *
 * The action bodies throw `McpError` on failure; `bin.ts` catches and maps
 * to exit codes. Flag parsing uses commander's built-in `InvalidArgumentError`
 * for shape-level validation (non-integer `--max-tokens`, malformed
 * `KEY=VALUE` pairs) so usage output stays consistent with commander's style.
 *
 * HTTP (`--url`) is wired to `extractMcpSkill`'s HTTP transport (Phase 4).
 * Config-file (`--config`) remains a Phase 7 stub.
 *
 * Header parser format decision (Phase 4): `--header` uses the same
 * `KEY=VALUE` syntax as `--env`, NOT the `KEY: VALUE` colon notation that
 * raw HTTP uses. Rationale: keeps the parser uniform with `--env`, avoids
 * bifurcating the `collectKv` helper, and works with shell quoting:
 * `--header "Authorization=Bearer mytoken"`. Document this when onboarding
 * users who expect colon-form.
 *
 * @module cli
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Command, InvalidArgumentError } from 'commander';
import { renderSkill, writeSkills } from '@to-skills/core';
import { loadAdapterAsync } from './adapter/loader.js';
import { McpError } from './errors.js';
import { extractMcpSkill } from './extract.js';
import { PACKAGE_VERSION } from './version.js';

/**
 * Build the top-level commander program for `to-skills-mcp`.
 *
 * Consumers that want to embed the CLI into a parent program (e.g. a
 * monorepo-wide `to-skills` wrapper) can call this and attach the returned
 * `Command` as a subcommand.
 *
 * @public
 */
export function buildProgram(): Command {
  const program = new Command()
    .name('to-skills-mcp')
    .description('Extract or bundle MCP servers as Agent Skills')
    .version(PACKAGE_VERSION);

  program
    .command('extract')
    .description('Extract a SKILL.md from a running MCP server')
    .option('--command <cmd>', 'Stdio launch command (mutually exclusive with --url, --config)')
    .option('--arg <a>', 'Arg to pass to the server command (repeatable)', collect, [])
    .option('--env <KEY=VALUE>', 'Environment variable for the server (repeatable)', collectKv, {})
    .option('--url <url>', 'HTTP/SSE endpoint (mutually exclusive with --command, --config)')
    .option(
      '--header <K=V>',
      'HTTP header in KEY=VALUE form (repeatable; e.g. --header "Authorization=Bearer X")',
      collectKv,
      {}
    )
    .option('--config <path>', '[Phase 7] Path to mcp.json or claude_desktop_config.json')
    .option('-o, --out <dir>', 'Output directory', 'skills')
    .option('--max-tokens <n>', 'Per reference-file token budget', parsePositiveInt, 4000)
    .option('--llms-txt', 'Emit llms.txt alongside SKILL.md')
    .option('--force', 'Overwrite existing skill directory')
    .option('--skip-audit', 'Skip audit rules')
    .option('--canonicalize', 'Run canonicalization pass on output (default true)', true)
    .option('--no-canonicalize', 'Disable canonicalization pass')
    .option('--skill-name <name>', 'Override skill directory name (default: derived from server)')
    .action(runExtract);

  program
    .command('bundle')
    .description('[Phase 5] Bundle MCP server into its own package as a skill')
    .action(() => {
      throw new McpError('Bundle mode not yet implemented (Phase 5).', 'TRANSPORT_FAILED');
    });

  return program;
}

/**
 * Commander `option()` collector — pushes each `--arg foo` occurrence onto a
 * growing array. Used for the repeatable `--arg` flag.
 * @internal
 */
function collect(value: string, prev: string[]): string[] {
  return [...prev, value];
}

/**
 * Commander `option()` collector that splits `KEY=VALUE` pairs into a record.
 * Used for the repeatable `--env` and `--header` flags. Throws
 * `InvalidArgumentError` on malformed input so commander emits a consistent
 * usage-style error.
 * @internal
 */
function collectKv(value: string, prev: Record<string, string>): Record<string, string> {
  const idx = value.indexOf('=');
  if (idx === -1) {
    throw new InvalidArgumentError(`Expected KEY=VALUE, got: ${value}`);
  }
  return { ...prev, [value.slice(0, idx)]: value.slice(idx + 1) };
}

/**
 * Commander `option()` parser for positive integer flags. Used by
 * `--max-tokens`. Throws `InvalidArgumentError` on non-integer / non-positive
 * input so commander emits a usage error.
 * @internal
 */
function parsePositiveInt(value: string): number {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0 || String(n) !== value.trim()) {
    throw new InvalidArgumentError(`Expected positive integer, got: ${value}`);
  }
  return n;
}

/** Parsed `extract` subcommand options as produced by commander. @internal */
interface ExtractOpts {
  command?: string;
  arg: string[];
  env: Record<string, string>;
  url?: string;
  header: Record<string, string>;
  config?: string;
  out: string;
  maxTokens: number;
  llmsTxt?: boolean;
  force?: boolean;
  skipAudit?: boolean;
  canonicalize: boolean;
  skillName?: string;
}

/**
 * `extract` action body. Validates flag combinations, runs the extraction
 * pipeline, and writes the rendered skill.
 *
 * @internal
 * @throws {McpError} — on any failure; `bin.ts` maps to an exit code.
 */
async function runExtract(opts: ExtractOpts): Promise<void> {
  // Mutual exclusion + at-least-one validation
  const modes = [opts.command, opts.url, opts.config].filter(Boolean);
  if (modes.length === 0) {
    throw new McpError(
      'extract requires one of --command, --url, or --config.',
      'TRANSPORT_FAILED'
    );
  }
  if (modes.length > 1) {
    throw new McpError(
      '--command, --url, and --config are mutually exclusive.',
      'TRANSPORT_FAILED'
    );
  }

  // Phase 7 stub — config-file batch mode lands later.
  if (opts.config !== undefined) {
    throw new McpError('Config-file batch mode not yet implemented (Phase 7).', 'TRANSPORT_FAILED');
  }

  // Notices for accepted-but-unwired flags (Phase 10 / T111 / audit rules).
  // Mirrors the --llms-txt pattern below so users get explicit feedback
  // rather than silent acceptance.
  if (!opts.canonicalize) {
    process.stderr.write(
      '[to-skills-mcp] --no-canonicalize is not yet wired; canonicalization currently always runs (Phase 10).\n'
    );
  }
  if (opts.skipAudit) {
    process.stderr.write('[to-skills-mcp] --skip-audit is not yet implemented (Phase 10).\n');
  }

  // Early collision check — fires BEFORE spawning the server when the user
  // supplied --skill-name (the common fast-feedback case). When the name
  // depends on server introspection, the check repeats post-extract.
  if (opts.skillName !== undefined) {
    const earlyDir = join(opts.out, opts.skillName);
    if (existsSync(earlyDir) && !opts.force) {
      throw new McpError(
        `Output directory already exists: ${earlyDir}. Pass --force to overwrite.`,
        'DUPLICATE_SKILL_NAME'
      );
    }
  }

  if (opts.url !== undefined) {
    await runHttpExtract(opts);
  } else {
    await runStdioExtract(opts);
  }
}

/** Stdio-extract pipeline: spawn → introspect → render → write. */
async function runStdioExtract(opts: ExtractOpts): Promise<void> {
  const envEntries = Object.keys(opts.env);
  const skill = await extractMcpSkill({
    transport: {
      type: 'stdio',
      command: opts.command!,
      args: opts.arg,
      env: envEntries.length > 0 ? opts.env : undefined
    },
    skillName: opts.skillName,
    maxTokens: opts.maxTokens
  });

  const adapter = await loadAdapterAsync('mcp-protocol');
  const rendered = await renderSkill(skill, {
    invocation: adapter,
    invocationLaunchCommand: {
      command: opts.command!,
      args: opts.arg,
      env: envEntries.length > 0 ? opts.env : undefined
    },
    maxTokens: opts.maxTokens
  });

  finalizeWrite(opts, skill.name, rendered);
}

/** HTTP-extract pipeline: connect → introspect → render → write. */
async function runHttpExtract(opts: ExtractOpts): Promise<void> {
  const headerEntries = Object.keys(opts.header);
  const skill = await extractMcpSkill({
    transport: {
      type: 'http',
      url: opts.url!,
      headers: headerEntries.length > 0 ? opts.header : undefined
    },
    skillName: opts.skillName,
    maxTokens: opts.maxTokens
  });

  const adapter = await loadAdapterAsync('mcp-protocol');
  const rendered = await renderSkill(skill, {
    invocation: adapter,
    invocationHttpEndpoint: {
      url: opts.url!,
      ...(headerEntries.length > 0 ? { headers: opts.header } : {})
    },
    maxTokens: opts.maxTokens
  });

  finalizeWrite(opts, skill.name, rendered);
}

/**
 * Shared tail: post-extract collision check, write the rendered files, emit
 * the success line on stdout. Extracted so the stdio and http branches share
 * exactly the same write/notice semantics.
 */
function finalizeWrite(
  opts: ExtractOpts,
  skillName: string,
  rendered: import('@to-skills/core').RenderedSkill
): void {
  // Collision detection (post-extract) — covers the case where the skill name
  // came from server introspection rather than --skill-name.
  const skillDir = join(opts.out, skillName);
  if (existsSync(skillDir) && !opts.force) {
    throw new McpError(
      `Output directory already exists: ${skillDir}. Pass --force to overwrite.`,
      'DUPLICATE_SKILL_NAME'
    );
  }

  writeSkills([rendered], { outDir: opts.out });

  // Optional llms.txt emission — stubbed for Phase 10 (T111).
  if (opts.llmsTxt) {
    process.stderr.write('[to-skills-mcp] --llms-txt is not yet implemented (Phase 10).\n');
  }

  process.stdout.write(`Wrote ${skillDir}/SKILL.md (${rendered.references.length} references)\n`);
}
