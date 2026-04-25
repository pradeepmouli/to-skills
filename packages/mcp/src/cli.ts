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
 * Config-file (`--config`) batches over `mcpServers` from a Claude-Desktop
 * shaped config file, with per-entry error containment and worst-code exit
 * mapping (Phase 7 / US3).
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
import path, { join } from 'node:path';
import { Command, InvalidArgumentError } from 'commander';
import { renderSkill, writeSkills } from '@to-skills/core';
import { loadAdapterAsync } from './adapter/loader.js';
import type { InvocationAdapter } from './adapter/types.js';
import { bundleMcpSkill } from './bundle.js';
// Internal import: the bundle CLI does its own pre-flight DUPLICATE_SKILL_NAME
// check (so --force semantics fire BEFORE bundleMcpSkill calls writeSkills,
// which always rmSyncs the destination). readBundleConfig is the cleanest
// hook — it returns normalized entries with skillName resolved, and we want
// to short-circuit on collision without re-implementing config parsing. This
// is an internal-only import; readBundleConfig stays out of the public API.
import { readBundleConfig } from './bundle/config.js';
import { readMcpConfigFile } from './config/file-reader.js';
import type {
  BundleFailure,
  McpBundleOptions,
  McpExtractOptions,
  McpServerConfig
} from './types.js';
import type { InvocationTarget } from './adapter/types.js';
import { McpError, type McpErrorCode } from './errors.js';
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
    .option(
      '--config <path>',
      'Path to mcp.json / claude_desktop_config.json (batch extract over mcpServers)'
    )
    .option('-o, --out <dir>', 'Output directory', 'skills')
    .option('--max-tokens <n>', 'Per reference-file token budget', parsePositiveInt, 4000)
    .option('--llms-txt', 'Emit llms.txt alongside SKILL.md')
    .option('--force', 'Overwrite existing skill directory')
    .option('--skip-audit', 'Skip audit rules')
    .option('--canonicalize', 'Run canonicalization pass on output (default true)', true)
    .option('--no-canonicalize', 'Disable canonicalization pass')
    .option('--skill-name <name>', 'Override skill directory name (default: derived from server)')
    .option(
      '--invocation <target>',
      'Render with this invocation target (repeatable). Default: mcp-protocol',
      collect,
      [] as string[]
    )
    .action(runExtract);

  program
    .command('bundle')
    .description('Bundle an MCP server into its host package as a generated skill')
    .option('--package-root <dir>', 'Path to the host package (default: cwd)')
    .option('-o, --out <dir>', 'Output directory (default: <packageRoot>/skills)')
    .option('--max-tokens <n>', 'Per reference-file token budget', parsePositiveInt, 4000)
    .option('--llms-txt', 'Emit llms.txt alongside SKILL.md')
    .option('--force', 'Overwrite existing skill directories')
    .option('--skip-audit', 'Skip audit rules')
    .option('--canonicalize', 'Run canonicalization pass on output (default true)', true)
    .option('--no-canonicalize', 'Disable canonicalization pass')
    .option(
      '--invocation <target>',
      'Override per-entry invocation target (repeatable)',
      collect,
      [] as string[]
    )
    .action(runBundle);

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
  invocation: string[];
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

  // Config-file batch mode (Phase 7 / US3). Delegates to runConfigExtract,
  // which handles per-entry containment + worst-code aggregation. We dispatch
  // BEFORE the single-entry --canonicalize / --skip-audit notices because
  // those notices fire inside runConfigExtract once per batch instead.
  if (opts.config !== undefined) {
    await runConfigExtract(opts);
    return;
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

  // Compute the requested invocation targets — empty `--invocation` means
  // default to the MCP-native adapter. Repeated `--invocation` produces a
  // multi-target run with disambiguated output directories (FR-IT-009).
  const targets: InvocationTarget[] =
    opts.invocation.length > 0
      ? (opts.invocation as InvocationTarget[])
      : (['mcp-protocol'] as InvocationTarget[]);

  // Eager target validation (T081) — load every adapter BEFORE we spawn the
  // server, so a typo on `--invocation` exits 5 without paying the spawn
  // cost. The loader's per-process cache makes the subsequent
  // loadAdapterAsync() calls in the render loop free.
  const adapters = await validateTargets(targets);

  // Early collision check — fires BEFORE spawning the server when the user
  // supplied --skill-name (the common fast-feedback case). When the name
  // depends on server introspection, the check repeats post-extract per
  // target directory.
  if (opts.skillName !== undefined) {
    for (const adapter of adapters) {
      const earlyDir = join(opts.out, dirNameForTarget(opts.skillName, adapter, adapters.length));
      if (existsSync(earlyDir) && !opts.force) {
        throw new McpError(
          `Output directory already exists: ${earlyDir}. Pass --force to overwrite.`,
          'DUPLICATE_SKILL_NAME'
        );
      }
    }
  }

  // Extract once — the IR is target-agnostic, so the loop below renders
  // (and writes) one skill directory per requested target from the same IR.
  const skill =
    opts.url !== undefined
      ? await extractMcpSkill({
          transport: {
            type: 'http',
            url: opts.url,
            headers: Object.keys(opts.header).length > 0 ? opts.header : undefined
          },
          skillName: opts.skillName,
          maxTokens: opts.maxTokens
        })
      : await extractMcpSkill({
          transport: {
            type: 'stdio',
            command: opts.command!,
            args: opts.arg,
            env: Object.keys(opts.env).length > 0 ? opts.env : undefined
          },
          skillName: opts.skillName,
          maxTokens: opts.maxTokens
        });

  // Per-target render+write loop. Each iteration writes its own directory and
  // emits one stdout line. Collision detection moves into the loop so each
  // target dir is checked independently.
  for (const adapter of adapters) {
    const dirName = dirNameForTarget(skill.name, adapter, adapters.length);
    const skillDir = join(opts.out, dirName);
    if (existsSync(skillDir) && !opts.force) {
      throw new McpError(
        `Output directory already exists: ${skillDir}. Pass --force to overwrite.`,
        'DUPLICATE_SKILL_NAME'
      );
    }

    const renderOptions: Parameters<typeof renderSkill>[1] = {
      invocation: adapter,
      maxTokens: opts.maxTokens,
      // Multi-target runs disambiguate the output directory by passing
      // namePrefix; single-target keeps today's <outDir>/<skillName>/ shape.
      ...(adapters.length > 1 ? { namePrefix: dirName } : {})
    };
    if (opts.url !== undefined) {
      renderOptions.invocationHttpEndpoint = {
        url: opts.url,
        ...(Object.keys(opts.header).length > 0 ? { headers: opts.header } : {})
      };
    } else {
      renderOptions.invocationLaunchCommand = {
        command: opts.command!,
        args: opts.arg,
        env: Object.keys(opts.env).length > 0 ? opts.env : undefined
      };
    }

    const rendered = await renderSkill(skill, renderOptions);
    writeSkills([rendered], { outDir: opts.out });

    process.stdout.write(`Wrote ${skillDir}/SKILL.md (${rendered.references.length} references)\n`);
  }

  // Optional llms.txt emission — stubbed for Phase 10 (T111). Emitted once
  // per CLI invocation regardless of target count.
  if (opts.llmsTxt) {
    process.stderr.write('[to-skills-mcp] --llms-txt is not yet implemented (Phase 10).\n');
  }
}

/**
 * `extract --config <path>` action body (Phase 7 / US3).
 *
 * Reads the Claude-Desktop-shaped config file, then runs the full
 * extract → render → write pipeline once per enabled entry. Failures are
 * contained per-entry: a single server's crash records a {@link BundleFailure}
 * and the loop continues so partially-successful runs still produce the
 * remaining skills. After the loop, if any entry failed, throws an
 * {@link McpError} carrying the worst code in the failure set so `bin.ts`
 * maps to a non-zero exit (the worst-code hierarchy mirrors `runBundle`).
 *
 * `--invocation` is supported in batch mode: the same multi-target render
 * loop used by stdio/http extract runs per-entry, producing disambiguated
 * `<skillName>-<targetSuffix>` directories when multiple targets are
 * requested. This keeps the CLI surface consistent across modes.
 *
 * Disabled entries (`disabled: true`) are skipped silently — the spec
 * defines them as "configured but turned off", not failure conditions.
 *
 * @internal
 */
async function runConfigExtract(opts: ExtractOpts): Promise<void> {
  // Notices for not-yet-wired flags — emitted ONCE per CLI invocation, not
  // per-entry, to mirror the bundle-mode pattern and avoid stderr spam on
  // many-server configs.
  if (!opts.canonicalize) {
    process.stderr.write(
      '[to-skills-mcp] --no-canonicalize is not yet wired; canonicalization currently always runs (Phase 10).\n'
    );
  }
  if (opts.skipAudit) {
    process.stderr.write('[to-skills-mcp] --skip-audit is not yet implemented (Phase 10).\n');
  }
  if (opts.llmsTxt) {
    process.stderr.write('[to-skills-mcp] --llms-txt is not yet implemented (Phase 10).\n');
  }

  const configFile = await readMcpConfigFile(opts.config!);

  // Resolve invocation targets eagerly — same approach as runExtract so a
  // typo on `--invocation` exits 5 BEFORE we spawn anything for any entry.
  const targets: InvocationTarget[] =
    opts.invocation.length > 0
      ? (opts.invocation as InvocationTarget[])
      : (['mcp-protocol'] as InvocationTarget[]);
  const adapters = await validateTargets(targets);

  const failures: Record<string, BundleFailure> = {};

  for (const [entryName, entry] of Object.entries(configFile.mcpServers)) {
    if (entry.disabled === true) {
      continue;
    }

    try {
      await runConfigEntry(entryName, entry, opts, adapters);
    } catch (err) {
      // Per-entry containment — only McpError is contained; anything else
      // (programming errors, unexpected throws) propagates so we don't mask
      // bugs as "transport failures".
      if (err instanceof McpError) {
        failures[entryName] = { code: err.code, message: err.message };
        process.stderr.write(`Failed [${err.code}] ${entryName}: ${err.message}\n`);
        continue;
      }
      throw err;
    }
  }

  // Exit-code policy: ≥1 entries failed → throw with the worst code so
  // bin.ts maps to a non-zero exit. Hierarchy matches runBundle so multi-mode
  // runs converge on a deterministic code.
  const codes = Object.values(failures).map((f) => f.code);
  if (codes.length > 0) {
    const worst = pickWorstCode(codes);
    throw new McpError(
      `extract --config: ${codes.length} ${codes.length === 1 ? 'entry' : 'entries'} failed. See stderr above.`,
      worst
    );
  }
}

/**
 * Run extract → render → write for a single config entry. Mirrors the
 * single-entry path in `runExtract`; factored out so the batch loop can
 * catch each iteration independently.
 *
 * @internal
 */
async function runConfigEntry(
  entryName: string,
  entry: McpServerConfig,
  opts: ExtractOpts,
  adapters: InvocationAdapter[]
): Promise<void> {
  // Build the McpExtractOptions from the entry. Stdio if `command` set,
  // HTTP if `url` set. The reader has already enforced one-or-the-other.
  let extractOpts: McpExtractOptions;
  if (entry.command !== undefined) {
    extractOpts = {
      transport: {
        type: 'stdio',
        command: entry.command,
        ...(entry.args !== undefined ? { args: entry.args } : {}),
        ...(entry.env !== undefined ? { env: entry.env } : {})
      },
      skillName: entryName,
      maxTokens: opts.maxTokens
    };
  } else if (entry.url !== undefined) {
    extractOpts = {
      transport: {
        type: 'http',
        url: entry.url,
        ...(entry.headers !== undefined ? { headers: entry.headers } : {})
      },
      skillName: entryName,
      maxTokens: opts.maxTokens
    };
  } else {
    // Defensive — readMcpConfigFile guarantees one of the two is set, but
    // narrowing requires us to handle the case explicitly.
    throw new McpError(`Entry "${entryName}" has neither command nor url.`, 'TRANSPORT_FAILED');
  }

  // Pre-flight collision check, per target. Mirrors runExtract so --force
  // semantics fire before writeSkills rmSyncs anything.
  for (const adapter of adapters) {
    const dirName = dirNameForTarget(entryName, adapter, adapters.length);
    const skillDir = join(opts.out, dirName);
    if (existsSync(skillDir) && !opts.force) {
      throw new McpError(
        `Output directory already exists: ${skillDir}. Pass --force to overwrite.`,
        'DUPLICATE_SKILL_NAME'
      );
    }
  }

  const skill = await extractMcpSkill(extractOpts);

  for (const adapter of adapters) {
    const dirName = dirNameForTarget(skill.name, adapter, adapters.length);
    const skillDir = join(opts.out, dirName);

    const renderOptions: Parameters<typeof renderSkill>[1] = {
      invocation: adapter,
      maxTokens: opts.maxTokens,
      ...(adapters.length > 1 ? { namePrefix: dirName } : {})
    };
    if (entry.url !== undefined) {
      renderOptions.invocationHttpEndpoint = {
        url: entry.url,
        ...(entry.headers !== undefined ? { headers: entry.headers } : {})
      };
    } else {
      renderOptions.invocationLaunchCommand = {
        command: entry.command!,
        ...(entry.args !== undefined ? { args: entry.args } : { args: [] }),
        ...(entry.env !== undefined ? { env: entry.env } : {})
      };
    }

    const rendered = await renderSkill(skill, renderOptions);
    writeSkills([rendered], { outDir: opts.out });

    process.stdout.write(`Wrote ${skillDir}/SKILL.md (${rendered.references.length} references)\n`);
  }
}

/**
 * Pick the most-actionable McpErrorCode from a multi-failure set. Hierarchy
 * mirrors `runBundle` so config-mode and bundle-mode partial failures map to
 * the same exit code when failure sets overlap.
 *
 * @internal
 */
function pickWorstCode(codes: readonly McpErrorCode[]): McpErrorCode {
  const ordered: McpErrorCode[] = [
    'DUPLICATE_SKILL_NAME',
    'MISSING_LAUNCH_COMMAND',
    'UNKNOWN_TARGET',
    'ADAPTER_NOT_FOUND',
    'SCHEMA_REF_CYCLE',
    'SERVER_EXITED_EARLY',
    'PROTOCOL_VERSION_UNSUPPORTED',
    'INITIALIZE_FAILED',
    'TRANSPORT_FAILED'
  ];
  return ordered.find((c) => codes.includes(c)) ?? codes[0]!;
}

/**
 * Compute the per-target output directory name. Single-target runs keep the
 * canonical `<skillName>` shape; multi-target runs append a `-<targetSuffix>`
 * disambiguator (FR-IT-009). `targetSuffix` is the literal `target` string
 * with `:` replaced by `-` (so `cli:mcpc` → `mcpc`, `mcp-protocol` stays
 * `mcp-protocol`).
 */
function dirNameForTarget(
  skillName: string,
  adapter: InvocationAdapter,
  totalTargets: number
): string {
  if (totalTargets <= 1) return skillName;
  const suffix = adapter.target.replace(/:/g, '-');
  return `${skillName}-${suffix}`;
}

/**
 * Eagerly resolve every requested target before any extract spawn (T081).
 * Wraps `loadAdapterAsync` errors with a hint enumerating the installed
 * adapters so the user can fix `--invocation` typos and missing-package
 * issues without consulting the docs.
 */
async function validateTargets(targets: readonly InvocationTarget[]): Promise<InvocationAdapter[]> {
  const adapters: InvocationAdapter[] = [];
  let installedHint: string | undefined;
  for (const t of targets) {
    try {
      adapters.push(await loadAdapterAsync(t));
    } catch (err) {
      if (
        err instanceof McpError &&
        (err.code === 'UNKNOWN_TARGET' || err.code === 'ADAPTER_NOT_FOUND')
      ) {
        // Compute the installed-adapter hint lazily — it's only needed on
        // failure, and probing every candidate target costs a require() each.
        installedHint ??= await formatInstalledAdaptersHint();
        throw new McpError(`${err.message}\n\n${installedHint}`, err.code, err);
      }
      throw err;
    }
  }
  return adapters;
}

/**
 * Probe each known target package and return a human-readable hint listing
 * the resolvable ones plus an install-pointer for the rest.
 *
 * The known-target list is hardcoded — for now we only ship `mcp-protocol`,
 * `cli:mcpc`, `cli:fastmcp`. Third-party adapters that follow the
 * `to-skills-target-<name>` naming convention won't appear in this hint, but
 * they remain loadable.
 */
async function formatInstalledAdaptersHint(): Promise<string> {
  const known: InvocationTarget[] = ['mcp-protocol', 'cli:mcpc', 'cli:fastmcp'];
  const installed: string[] = [];
  for (const t of known) {
    try {
      await loadAdapterAsync(t);
      installed.push(t);
    } catch {
      // Not installed — silently skip; the hint only enumerates resolvable adapters.
    }
  }
  return (
    `Installed adapters: ${installed.length > 0 ? installed.join(', ') : '(none)'}\n` +
    `To install a missing adapter: npm install @to-skills/target-<name>`
  );
}

/** Parsed `bundle` subcommand options as produced by commander. @internal */
interface BundleOpts {
  packageRoot?: string;
  out?: string;
  maxTokens: number;
  llmsTxt?: boolean;
  force?: boolean;
  skipAudit?: boolean;
  canonicalize: boolean;
  invocation: string[];
}

/**
 * `bundle` action body. Reads `to-skills.mcp` from the host package, performs
 * a pre-flight collision check (so --force semantics fire BEFORE writeSkills
 * does an unconditional rmSync on each destination), then runs
 * `bundleMcpSkill` and surfaces per-skill stdout / per-failure stderr lines.
 *
 * Throws `McpError` when any entry failed so `bin.ts` maps to a non-zero exit.
 * The chosen code follows a stable hierarchy
 * (DUPLICATE_SKILL_NAME → MISSING_LAUNCH_COMMAND → INITIALIZE_FAILED →
 *  TRANSPORT_FAILED) so multi-failure runs converge on a deterministic code.
 *
 * @internal
 */
async function runBundle(opts: BundleOpts): Promise<void> {
  const packageRoot = path.resolve(opts.packageRoot ?? process.cwd());
  const outDir = opts.out !== undefined ? path.resolve(packageRoot, opts.out) : undefined;

  // Notices for not-yet-wired flags — mirrors the stdio extract pattern so
  // users get explicit feedback rather than silent acceptance.
  if (!opts.canonicalize) {
    process.stderr.write(
      '[to-skills-mcp] --no-canonicalize is not yet wired; canonicalization currently always runs (Phase 10).\n'
    );
  }
  if (opts.skipAudit) {
    process.stderr.write('[to-skills-mcp] --skip-audit is not yet implemented (Phase 10).\n');
  }
  if (opts.llmsTxt) {
    process.stderr.write('[to-skills-mcp] --llms-txt is not yet implemented (Phase 10).\n');
  }
  // --max-tokens is parsed for forward-compatibility but not yet threaded into
  // McpBundleOptions (no maxTokens field there). Notice the user only when
  // they explicitly chose a non-default value, so the default 4000 stays quiet.
  if (opts.maxTokens !== 4000) {
    process.stderr.write(
      '[to-skills-mcp] --max-tokens is not yet threaded into bundle mode; value ignored.\n'
    );
  }

  // Eager target validation (T081) — when the user supplied global
  // `--invocation` overrides, resolve every adapter NOW so a typo exits 5
  // before we read package.json or spawn anything. Per-entry targets (in the
  // package.json invocation field) get validated by bundle.ts inside the
  // multi-target loop.
  if (opts.invocation.length > 0) {
    await validateTargets(opts.invocation as InvocationTarget[]);
  }

  // Pre-flight DUPLICATE_SKILL_NAME check. bundleMcpSkill → writeSkills will
  // rmSync the destination unconditionally; that's fine when the user opted
  // in via --force, but otherwise we should bail before any extract spawns.
  // We import readBundleConfig from the internal config module to avoid
  // re-parsing package.json ourselves.
  const entries = await readBundleConfig(packageRoot);
  const resolvedOutDir = outDir ?? path.join(packageRoot, 'skills');
  if (!opts.force) {
    // Compute the effective per-entry targets so the pre-flight collision
    // check covers the same disambiguated directory names that bundle.ts
    // will write to. Global `--invocation` (when set) overrides per-entry.
    const overrideTargets =
      opts.invocation.length > 0 ? (opts.invocation as InvocationTarget[]) : undefined;
    for (const entry of entries) {
      const effective = overrideTargets ?? entry.invocation;
      for (const target of effective) {
        const dirName =
          effective.length > 1
            ? `${entry.skillName}-${target.replace(/:/g, '-')}`
            : entry.skillName;
        const dest = path.join(resolvedOutDir, dirName);
        if (existsSync(dest)) {
          throw new McpError(
            `Output directory already exists: ${dest}. Pass --force to overwrite.`,
            'DUPLICATE_SKILL_NAME'
          );
        }
      }
    }
  }

  const bundleOptions: McpBundleOptions = {
    packageRoot,
    ...(outDir !== undefined ? { outDir } : {}),
    ...(opts.invocation.length > 0 ? { invocation: opts.invocation as InvocationTarget[] } : {})
  };

  const result = await bundleMcpSkill(bundleOptions);

  // Stdout: one success line per written skill.
  for (const skill of Object.values(result.skills)) {
    const refCount = Math.max(0, skill.files.length - 1);
    process.stdout.write(`Wrote ${skill.dir}/SKILL.md (${refCount} references)\n`);
  }
  // Stderr: one line per failure. Files-field warnings were already emitted
  // by bundleMcpSkill — we don't re-emit.
  for (const [name, failure] of Object.entries(result.failures)) {
    process.stderr.write(`Failed [${failure.code}] ${name}: ${failure.message}\n`);
  }

  // Exit-code policy: when ≥1 entries failed, throw with the worst code so
  // bin.ts maps to a non-zero exit. Hierarchy below is intentional — when
  // multiple entries fail with different codes, we surface the
  // most-actionable one first (config issues over transport blips).
  const codes = Object.values(result.failures).map((f) => f.code);
  if (codes.length > 0) {
    // Worst-code hierarchy lives in `pickWorstCode` so config-mode and
    // bundle-mode converge on the same exit code for overlapping failure
    // sets — see the helper's JSDoc for the ordering rationale.
    const worst = pickWorstCode(codes);
    throw new McpError(
      `bundle: ${codes.length} ${codes.length === 1 ? 'entry' : 'entries'} failed. See stderr above.`,
      worst
    );
  }
}
