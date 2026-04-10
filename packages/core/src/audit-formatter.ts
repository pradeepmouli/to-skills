import type { AuditIssue, AuditResult, AuditSeverity } from './audit-types.js';

// ---------------------------------------------------------------------------
// Severity display configuration
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: AuditSeverity[] = ['fatal', 'error', 'warning', 'alert'];

const SEVERITY_EMOJI: Record<AuditSeverity, string> = {
  fatal: '🔴',
  error: '🔴',
  warning: '🟡',
  alert: '🔵'
};

const SEVERITY_LABEL: Record<AuditSeverity, string> = {
  fatal: 'FATAL',
  error: 'ERROR',
  warning: 'WARNING',
  alert: 'ALERT'
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileRef(issue: AuditIssue): string {
  return issue.line !== null ? `${issue.file}:${issue.line}` : issue.file;
}

function groupBySeverity(issues: AuditIssue[]): Map<AuditSeverity, AuditIssue[]> {
  const map = new Map<AuditSeverity, AuditIssue[]>();
  for (const sev of SEVERITY_ORDER) {
    map.set(sev, []);
  }
  for (const issue of issues) {
    map.get(issue.severity)!.push(issue);
  }
  return map;
}

function groupByFile(issues: AuditIssue[]): Map<string, AuditIssue[]> {
  const map = new Map<string, AuditIssue[]>();
  for (const issue of issues) {
    const ref = fileRef(issue);
    if (!map.has(ref)) map.set(ref, []);
    map.get(ref)!.push(issue);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Format an {@link AuditResult} as human-readable text suitable for TypeDoc logs.
 *
 * Output groups issues by severity (fatal → error → warning → alert),
 * then lists passing checks at the end. Empty severity groups are omitted.
 */
export function formatAuditText(result: AuditResult): string {
  const lines: string[] = [];

  // Header
  lines.push(`📊 Skill Documentation Audit: ${result.package}`);
  const { fatal, error, warning, alert } = result.summary;
  lines.push(
    `   ${fatal} fatal · ${error} error · ${warning} warning · ${alert} alert`
  );

  // Issue groups
  const bySeverity = groupBySeverity(result.issues);

  for (const sev of SEVERITY_ORDER) {
    const sevIssues = bySeverity.get(sev)!;
    if (sevIssues.length === 0) continue;

    lines.push('');
    lines.push(`${SEVERITY_EMOJI[sev]} ${SEVERITY_LABEL[sev]} (${sevIssues.length})`);
    lines.push('');

    const byFile = groupByFile(sevIssues);
    for (const [ref, fileIssues] of byFile) {
      lines.push(`  ${ref}`);
      for (const issue of fileIssues) {
        lines.push(`    ⚠ ${issue.message}`);
        lines.push(`      Suggestion: ${issue.suggestion}`);
      }
    }
  }

  // Passing checks
  if (result.passing.length > 0) {
    lines.push('');
    lines.push(`✅ PASSING (${result.passing.length} checks)`);
    for (const pass of result.passing) {
      const detail = pass.detail ? ` — ${pass.detail}` : '';
      lines.push(`  ✓ ${pass.message}${detail}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format an {@link AuditResult} as pretty-printed JSON for machine consumption.
 *
 * Returns the full result object serialized with 2-space indentation so it
 * can be parsed by downstream tooling without any further transformation.
 */
export function formatAuditJson(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}
