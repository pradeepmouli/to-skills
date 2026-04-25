/**
 * Fingerprint frontmatter helper — shared across CLI-as-proxy adapters.
 *
 * @remarks
 * CLI adapters (`@to-skills/target-mcpc`, `@to-skills/target-fastmcp`) emit
 * a `generated-by:` block in their SKILL.md frontmatter so freshness audits
 * can detect when the rendered output drifts from the adapter that produced
 * it (FR-IT-012). This helper centralizes the shape so every adapter emits
 * an identical key layout.
 *
 * Unlike the `mcp-protocol` adapter, CLI adapters do NOT emit an `mcp:`
 * block — that block is reserved for MCP-native harness discovery. The
 * `generated-by:` block carries the adapter package metadata only.
 *
 * @module fingerprint
 */

import { parse as parseYaml } from 'yaml';
import { McpError } from '../errors.js';
import type { AdapterFingerprint } from './types.js';

/**
 * Build the `generated-by:` frontmatter object for a CLI adapter render.
 *
 * @param fingerprint - the adapter's fingerprint (`adapter`, `version`, optional `targetCliRange`)
 * @returns a plain object suitable for merging into `SkillRenderOptions.additionalFrontmatter`
 *
 * @example
 * ```ts
 * const fm = generatedByFrontmatter({
 *   adapter: '@to-skills/target-mcpc',
 *   version: '0.1.0',
 *   targetCliRange: 'mcpc@^2.1'
 * });
 * // → { 'generated-by': { adapter: '@to-skills/target-mcpc', version: '0.1.0', 'target-cli-range': 'mcpc@^2.1' } }
 * ```
 */
export function generatedByFrontmatter(fingerprint: AdapterFingerprint): Record<string, unknown> {
  const inner: Record<string, unknown> = {
    adapter: fingerprint.adapter,
    version: fingerprint.version
  };
  if (fingerprint.targetCliRange !== undefined) {
    inner['target-cli-range'] = fingerprint.targetCliRange;
  }
  return { 'generated-by': inner };
}

/**
 * Frontmatter ⇄ Setup-section fingerprint consistency check (FR-IT-012).
 *
 * @remarks
 * CLI adapters must emit the adapter+version fingerprint twice in the rendered
 * SKILL.md: once in the YAML frontmatter (`generated-by:` block, via
 * {@link generatedByFrontmatter}) and once as a human-readable trace line in
 * the Setup section ("Generated for &lt;cli&gt; … via &lt;adapter&gt; &lt;version&gt;"). The
 * two carriers MUST agree — drift indicates a render bug.
 *
 * This helper parses the SKILL.md content, extracts both placements, and
 * throws when they disagree. Used by the contract test in
 * `tests/contract/fingerprint.test.ts` and available to adapter authors who
 * want to assert the invariant in their own tests.
 *
 * @param skillContent the rendered SKILL.md body (frontmatter + body)
 * @param fingerprint  the adapter's expected fingerprint — both placements
 *   are validated against this reference shape
 * @throws McpError with code `INITIALIZE_FAILED` when:
 *   - the frontmatter cannot be parsed,
 *   - `generated-by.adapter` / `generated-by.version` are missing, or
 *   - the body's `via &lt;adapter&gt; &lt;version&gt;` trace disagrees with the frontmatter.
 *
 * @public
 */
export function assertFingerprintConsistency(
  skillContent: string,
  fingerprint: AdapterFingerprint
): void {
  const fmMatch = skillContent.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) {
    throw new McpError('Fingerprint check: no YAML frontmatter found', 'INITIALIZE_FAILED');
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(fmMatch[1]!);
  } catch (err) {
    throw new McpError(
      `Fingerprint check: frontmatter is not valid YAML: ${(err as Error).message}`,
      'INITIALIZE_FAILED',
      err
    );
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new McpError('Fingerprint check: frontmatter is not a YAML mapping', 'INITIALIZE_FAILED');
  }
  const fm = parsed as Record<string, unknown>;
  const generatedBy = fm['generated-by'];
  if (typeof generatedBy !== 'object' || generatedBy === null) {
    throw new McpError(
      'Fingerprint check: frontmatter is missing `generated-by` block',
      'INITIALIZE_FAILED'
    );
  }
  const gb = generatedBy as Record<string, unknown>;
  const fmAdapter = gb['adapter'];
  const fmVersion = gb['version'];
  if (typeof fmAdapter !== 'string' || typeof fmVersion !== 'string') {
    throw new McpError(
      'Fingerprint check: frontmatter `generated-by` is missing `adapter`/`version`',
      'INITIALIZE_FAILED'
    );
  }

  if (fmAdapter !== fingerprint.adapter || fmVersion !== fingerprint.version) {
    throw new McpError(
      `Fingerprint check: frontmatter \`generated-by\` (${fmAdapter} ${fmVersion}) ` +
        `disagrees with expected adapter (${fingerprint.adapter} ${fingerprint.version})`,
      'INITIALIZE_FAILED'
    );
  }

  // Body trace: "via <adapter> <version>". Adapter names contain `/` and `@`
  // and `-` so build a literal-prefix regex from the expected adapter to keep
  // the search precise.
  const body = skillContent.slice(fmMatch[0].length);
  const traceRegex = new RegExp(`via\\s+${escapeRegExp(fmAdapter)}\\s+(\\S+)`);
  const traceMatch = body.match(traceRegex);
  if (!traceMatch) {
    throw new McpError(
      `Fingerprint check: Setup section trace line "via ${fmAdapter} <version>" not found in body`,
      'INITIALIZE_FAILED'
    );
  }
  const traceVersion = traceMatch[1]!;
  if (traceVersion !== fmVersion) {
    throw new McpError(
      `Fingerprint check: Setup-section version (${traceVersion}) disagrees with ` +
        `frontmatter \`generated-by.version\` (${fmVersion})`,
      'INITIALIZE_FAILED'
    );
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
