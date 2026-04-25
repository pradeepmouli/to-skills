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
