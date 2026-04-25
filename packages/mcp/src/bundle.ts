/**
 * Bundle-mode orchestrator (T060a, T060b, T060c, T060d, T063).
 *
 * `bundleMcpSkill(options)` reads `to-skills.mcp` from the host package's
 * `package.json`, then for each declared server it:
 *   1. spawns the server (stdio) and runs the existing extract pipeline,
 *   2. renders SKILL.md for each requested invocation target with
 *      {@link AdapterRenderContext.packageName} set to the host package name
 *      (so the emitted skill instructs MCP harnesses to launch via
 *      `npx -y <packageName>` per FR-033),
 *   3. writes the rendered files under `<packageRoot>/skills/<skillName>/`.
 *
 * Batch semantics: a single server's failure is recorded on
 * {@link BundleResult.failures} and the loop continues with the remaining
 * entries. The CLI (T065, deferred to B13) maps the worst code in the
 * failures map to an exit code.
 *
 * Multi-target rendering (one server → multiple `invocation` entries → multiple
 * skill directories with disambiguated names) is wired in Phase 6 (T083). This
 * batch supports single-target only — when `invocation.length > 1`, we render
 * the first target and surface a stderr warning.
 *
 * @module bundle
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderSkill, writeSkills } from '@to-skills/core';
import type { RenderedSkill } from '@to-skills/core';
import { loadAdapterAsync } from './adapter/loader.js';
import { type NormalizedBundleEntry, readBundleConfig } from './bundle/config.js';
import { McpError } from './errors.js';
import { extractMcpSkill } from './extract.js';
import type { BundleFailure, BundleResult, McpBundleOptions, WrittenSkill } from './types.js';
import type { InvocationTarget } from './adapter/types.js';

/**
 * Run bundle mode against the host package at `options.packageRoot`.
 *
 * @param options bundle-mode options. `packageRoot` defaults to `process.cwd()`,
 *   `outDir` defaults to `<packageRoot>/skills`.
 * @returns a {@link BundleResult} keyed by `skillName` for both successful
 *   writes (`skills`) and per-server failures (`failures`). The
 *   `packageJsonWarnings` array carries non-fatal `files`-field hints
 *   (FR-035).
 *
 * @public
 */
export async function bundleMcpSkill(options: McpBundleOptions = {}): Promise<BundleResult> {
  const packageRoot = path.resolve(options.packageRoot ?? process.cwd());
  const outDir = path.resolve(packageRoot, options.outDir ?? 'skills');

  const rawEntries = await readBundleConfig(packageRoot);

  // `options.invocation` overrides the per-entry `invocation` declared in
  // package.json. Normalize string-or-array → readonly array, then apply.
  const override = normalizeInvocationOverride(options.invocation);
  const entries: NormalizedBundleEntry[] = override
    ? rawEntries.map((e) => ({ ...e, invocation: override }))
    : rawEntries;

  // Read package.json once more for the package-name self-reference and the
  // files-field warning. readBundleConfig() already validated this file is
  // parseable, so a parse error here would be a TOCTOU race we don't care
  // about — let it propagate.
  const pkgRaw = await readFile(path.join(packageRoot, 'package.json'), 'utf8');
  const pkg = JSON.parse(pkgRaw) as {
    name?: string;
    files?: string[];
  };
  const packageName = pkg.name;

  const result: BundleResult = {
    skills: {},
    failures: {},
    packageJsonWarnings: []
  };

  for (const entry of entries) {
    await processEntry(entry, { packageRoot, outDir, packageName, result });
  }

  // Files-field check runs after writes so we only nag the user when there's
  // something to publish.
  result.packageJsonWarnings = checkFilesField(
    pkg,
    existsSync(path.join(packageRoot, 'dist')),
    path.relative(packageRoot, outDir) || 'skills'
  );
  for (const w of result.packageJsonWarnings) {
    process.stderr.write(`[to-skills-mcp] ${w}\n`);
  }

  return result;
}

/**
 * Per-entry pipeline: extract → render → write. Failures are recorded on
 * `result.failures` and the function returns; the caller continues with the
 * next entry.
 */
async function processEntry(
  entry: NormalizedBundleEntry,
  ctx: {
    packageRoot: string;
    outDir: string;
    packageName: string | undefined;
    result: BundleResult;
  }
): Promise<void> {
  const { outDir, packageName, result } = ctx;

  // T060c, single-target only: this batch renders the first target. Multi-
  // target disambiguation (separate skill directories per target) lands in
  // Phase 6 (T083). When the user declared multiple targets, surface a notice
  // so the missing skills are at least discoverable from CLI output.
  if (entry.invocation.length > 1) {
    process.stderr.write(
      `[to-skills-mcp] entry "${entry.skillName}" declares ${entry.invocation.length} invocation targets; ` +
        `bundle mode currently renders only the first ("${entry.invocation[0]}"). Multi-target ` +
        `support lands in Phase 6.\n`
    );
  }
  const target: InvocationTarget = entry.invocation[0]!;

  // 1. Extract via stdio transport.
  let skill: import('@to-skills/core').ExtractedSkill;
  try {
    const env = entry.env ? Object.fromEntries(Object.entries(entry.env)) : undefined;
    skill = await extractMcpSkill({
      transport: env
        ? {
            type: 'stdio',
            command: entry.command,
            args: [...entry.args],
            env
          }
        : {
            type: 'stdio',
            command: entry.command,
            args: [...entry.args]
          },
      skillName: entry.skillName
    });
  } catch (err) {
    recordFailure(result, entry.skillName, err);
    return;
  }

  // 2. Render with the target's adapter; bundle mode passes packageName so the
  //    emitted skill instructs MCP harnesses to launch via `npx -y <packageName>`
  //    rather than embedding the local launch command (FR-033). When the entry
  //    has a binName (multi-bin packages), thread it so the adapter can emit
  //    `--package=<pkg> <binName>` (FR-034).
  let rendered: RenderedSkill;
  try {
    const adapter = await loadAdapterAsync(target);
    const renderOptions: Parameters<typeof renderSkill>[1] = {
      invocation: adapter,
      ...(packageName !== undefined ? { invocationPackageName: packageName } : {}),
      ...(packageName !== undefined && entry.binName !== undefined
        ? { invocationBinName: entry.binName }
        : {})
    };
    rendered = await renderSkill(skill, renderOptions);
  } catch (err) {
    recordFailure(result, entry.skillName, err);
    return;
  }

  // 3. Write under <packageRoot>/skills/<skillName>/. The renderer emits
  //    filenames relative to outDir already (e.g. "<skillName>/SKILL.md").
  try {
    writeSkills([rendered], { outDir });
  } catch (err) {
    recordFailure(result, entry.skillName, err);
    return;
  }

  const skillDir = path.join(outDir, entry.skillName);
  // The renderer emits filenames relative to outDir, so the absolute path of
  // each rendered file is `path.join(outDir, file.filename)`. Relativize against
  // skillDir so `WrittenSkill.files` is always relative to its `dir`, regardless
  // of whether the adapter prefixes with skillName or emits at the root.
  const toRelative = (filename: string): string =>
    path.relative(skillDir, path.join(outDir, filename));
  const written: WrittenSkill = {
    dir: skillDir,
    files: [
      toRelative(rendered.skill.filename),
      ...rendered.references.map((r) => toRelative(r.filename))
    ],
    target,
    audit: { issues: [], worstSeverity: 'none' }
  };
  result.skills[entry.skillName] = written;
}

/**
 * Normalize the public `McpBundleOptions.invocation` override (string-or-array)
 * into a readonly array. Returns undefined when no override was supplied — the
 * caller then preserves each entry's per-package `invocation`.
 */
function normalizeInvocationOverride(
  invocation: McpBundleOptions['invocation']
): readonly InvocationTarget[] | undefined {
  if (invocation === undefined) return undefined;
  return Array.isArray(invocation) ? invocation : [invocation];
}

/**
 * Convert an unknown thrown value into a {@link BundleFailure} record on
 * `result.failures`. Preserves the McpError code where possible; non-McpError
 * throws fall through as TRANSPORT_FAILED so the CLI exit-code mapper has a
 * stable code to read.
 */
function recordFailure(result: BundleResult, skillName: string, err: unknown): void {
  if (err instanceof McpError) {
    result.failures[skillName] = { code: err.code, message: err.message };
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  result.failures[skillName] = { code: 'TRANSPORT_FAILED', message };
}

/**
 * FR-035: warn when the host's `package.json` declares a `files` array that
 * would exclude the generated skill from `npm publish`. We never mutate
 * `package.json` — the warning is appended to stderr and to
 * {@link BundleResult.packageJsonWarnings}.
 *
 * Implicit-include semantics: if `files` is absent, npm includes everything by
 * default and we stay quiet.
 */
function checkFilesField(pkg: { files?: string[] }, hasDist: boolean, outDirRel: string): string[] {
  const warnings: string[] = [];
  if (!pkg.files) return warnings; // implicit-include: no warning

  const filesGlobs = pkg.files;
  const matches = (entry: string): boolean =>
    filesGlobs.some(
      (g) => g === entry || g === `${entry}/` || g.startsWith(`${entry}/**`) || g === `${entry}/**`
    );

  if (hasDist && !matches('dist')) {
    warnings.push(`Add "dist" to package.json "files" array so the server binary is published.`);
  }
  if (!matches(outDirRel)) {
    warnings.push(
      `Add "${outDirRel}" to package.json "files" array so the generated skill is published.`
    );
  }
  return warnings;
}
