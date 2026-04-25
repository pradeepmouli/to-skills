/**
 * Audit rule M2 — missing or invalid `inputSchema` (FR-040).
 *
 * @remarks
 * The Phase-3 `listTools` introspector tags any function whose `inputSchema`
 * failed to resolve due to a `$ref` cycle (or other resolver failure) with
 * `tags.schemaError === 'true'` and stores the offending tool's name in
 * `tags.schemaErrorTool`. We surface those as `error` severity because the
 * tool is technically callable (an MCP harness can still send a `tools/call`
 * request), but the agent has no usable parameter information — call sites
 * will fail at validation time on the server side.
 *
 * We deliberately do NOT flag tools whose `inputSchema` is `undefined` /
 * `null` / non-object: the introspector treats those as "tool takes no
 * input", which is a valid configuration for tools like `ping` or
 * `list_databases`. Conflating "absent schema" with "broken schema" here
 * would generate false positives on every parameterless tool.
 *
 * @module audit/rule-m2
 */

import type { ExtractedSkill } from '@to-skills/core';
import type { AuditIssue } from '../types.js';

/**
 * Run rule M2 against a skill: emit one error-severity issue per function
 * carrying the `tags.schemaError` marker emitted by the introspector.
 *
 * @public
 */
export function runM2(skill: ExtractedSkill): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const fn of skill.functions) {
    if (fn.tags['schemaError'] !== 'true') continue;
    // The introspector currently only tags `$ref` cycles. Future-proof: if a
    // different reason gets surfaced via `tags.schemaError`, we still emit a
    // generic message rather than mis-classifying.
    const reason =
      fn.tags['schemaErrorTool'] !== undefined ? 'cycle in $ref' : 'missing or non-object';
    issues.push({
      code: 'M2',
      severity: 'error',
      message: `Tool "${fn.name}" has invalid inputSchema (${reason}).`,
      location: { tool: fn.name }
    });
  }
  return issues;
}
