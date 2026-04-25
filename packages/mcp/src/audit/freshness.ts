/**
 * Audit rule M5 — adapter freshness (FR-IT-013).
 *
 * @remarks
 * When a CLI-as-proxy adapter (`@to-skills/target-mcpc`, `target-fastmcp`,
 * etc.) renders a SKILL.md, it embeds its fingerprint (`adapter` + `version`)
 * into the YAML frontmatter via `generated-by:`. Later, when the skill is
 * audited (extract or bundle re-run), the embedded fingerprint is compared
 * against the currently-installed adapter's fingerprint. If the embedded
 * version is older than the installed version, the rendered output may be
 * stale (newer adapter likely produces different command shapes / setup
 * instructions) and we surface a `warning`-severity issue suggesting the user
 * re-run the bundle/extract command.
 *
 * Newer-than-installed (consumer downgraded an adapter intentionally) and
 * exactly-equal versions emit no issue — neither is a freshness concern from
 * the auditor's perspective.
 *
 * The wire-up of this rule into `extract.ts` / `bundle.ts` is deferred to
 * Phase 10 (T106). This module only provides the rule.
 *
 * @module audit/freshness
 */

import type { AdapterFingerprint, ExtractedSkill } from '@to-skills/core';
import type { InvocationAdapter } from '../adapter/types.js';
import type { AuditIssue } from '../types.js';

/**
 * Audit rule M5 — adapter freshness.
 *
 * Compares the fingerprint embedded in a skill's `generated-by` frontmatter
 * (`embeddedFingerprint`) against the currently-installed adapter's
 * fingerprint. When `embeddedFingerprint.version < installedAdapter.fingerprint.version`
 * (semver compare), emits a single warning-severity AuditIssue with code M5.
 *
 * Newer-than-installed (consumer downgraded) and equal versions emit no issue.
 *
 * Per FR-IT-013.
 *
 * @param _skill the skill being audited. Currently unused — FR-IT-013 reserves
 *   it for future per-tool freshness checks (e.g. detecting stale Setup
 *   sections per-function). Prefixed with `_` to silence unused-param lints.
 * @param embeddedFingerprint the fingerprint extracted from the rendered
 *   skill's `generated-by` frontmatter
 * @param installedAdapter the adapter currently resolved by the loader
 *
 * @public
 */
export function auditAdapterFreshness(
  _skill: ExtractedSkill,
  embeddedFingerprint: AdapterFingerprint,
  installedAdapter: InvocationAdapter
): AuditIssue[] {
  const installedVersion = installedAdapter.fingerprint.version;
  const embeddedVersion = embeddedFingerprint.version;

  if (compareSemver(embeddedVersion, installedVersion) < 0) {
    return [
      {
        code: 'M5',
        severity: 'warning',
        message:
          `Adapter ${installedAdapter.fingerprint.adapter} is newer (${installedVersion}) than ` +
          `the one used to generate this skill (${embeddedVersion}). Consider re-running the ` +
          `bundle/extract command to refresh.`
      }
    ];
  }

  return [];
}

/**
 * Minimal semver comparator.
 *
 * @remarks
 * We deliberately avoid pulling in the `semver` package — this is a one-rule
 * comparator and the dependency cost is unjustified. The implementation:
 *
 * 1. Strips a leading `v` if present.
 * 2. Drops any prerelease/build suffix (`-alpha`, `+build`) — prerelease
 *    semantics are not relevant to the freshness check (a `1.0.0-rc.1` and
 *    a `1.0.0` register as equal here, which is fine: stale prerelease
 *    output is not actionable in the same way as a stale stable release,
 *    and Phase 10 can add finer rules if needed).
 * 3. Splits the remaining string on `.` and parses the first three parts as
 *    integers, treating missing parts as 0.
 * 4. Compares left-to-right and returns -1 / 0 / 1.
 *
 * Critically this avoids the `'1.0.10' < '1.0.2'` lexicographic bug that a
 * naive string compare would hit.
 */
function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    const ai = pa[i] ?? 0;
    const bi = pb[i] ?? 0;
    if (ai < bi) return -1;
    if (ai > bi) return 1;
  }
  return 0;
}

function parseSemver(v: string): number[] {
  // Strip leading `v`
  let s = v.startsWith('v') ? v.slice(1) : v;
  // Drop prerelease (`-alpha`) and build (`+sha`) suffixes
  const dashIdx = s.indexOf('-');
  if (dashIdx !== -1) s = s.slice(0, dashIdx);
  const plusIdx = s.indexOf('+');
  if (plusIdx !== -1) s = s.slice(0, plusIdx);
  return s.split('.').map((part) => {
    const n = Number.parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });
}
