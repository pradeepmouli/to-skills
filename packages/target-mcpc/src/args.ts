/**
 * mcpc argument encoder — converts classifier output into mcpc CLI argv shape.
 *
 * @remarks
 * mcpc (Apify's MCP CLI) accepts tool arguments in two forms:
 *
 * - `key=value` — literal string. Used for `string` schemas and enums.
 * - `key:=value` — JSON-typed. Used for `number`/`integer`/`boolean` and
 *   for arrays/objects passed as JSON literals.
 *
 * For Tier 3 fallback (anything we couldn't safely flatten), we emit a
 * single `--json '<JSON-payload>'` argument. The payload is a placeholder —
 * this encoder is for documentation rendering, not runtime invocation, so
 * actual values are substituted by the consumer at call time.
 *
 * @module args
 */

import type { ParameterPlan } from '@to-skills/mcp';

/** Encoder result — separated into normal flags vs Tier 3 fallback. */
export interface EncodedArgs {
  /**
   * Encoded arguments for Tier 1 + Tier 2 plans, one string per CLI token.
   * Order matches insertion order of the input plan map (which itself
   * preserves classifier walk order).
   */
  tier12: string[];
  /**
   * When ANY plan in the input has `tier === 3`, this is the single
   * `--json '<JSON-payload>'` token string. Otherwise `null`. mcpc accepts
   * one `--json` per call carrying the structural arguments that couldn't
   * be flattened into typed flags.
   */
  tier3Fallback: string | null;
}

/**
 * Encode a classifier plan map as mcpc argv tokens (documentation form).
 *
 * Encoding rules per tier:
 *
 * - Tier 1 + `type === 'scalar'` + scalarType `string` → `<path>=<value>`.
 * - Tier 1 + `type === 'scalar'` + scalarType `number`/`integer` → `<path>:=<value>`.
 * - Tier 1 + `type === 'scalar'` + scalarType `boolean` → `<path>:=<true|false>`.
 * - Tier 1 + `type === 'enum'` → `<path>=<one-of-...>`.
 * - Tier 1 + `type === 'string-array'` → `<path>:=<json-array>`.
 * - Tier 2 → same as the leaf's Tier 1 form, with `<path>` joined by `.`.
 * - Tier 3 → contributes nothing to `tier12`; sets `tier3Fallback`.
 *
 * Path is always joined with `.` (mcpc convention).
 *
 * @param plan - classifier output (`Map<string, ParameterPlan>`)
 * @returns split encoding result — Tier 1/2 tokens + optional Tier 3 fallback string
 */
export function encodeMcpcArgs(plan: Map<string, ParameterPlan>): EncodedArgs {
  const tier12: string[] = [];
  let hasTier3 = false;

  for (const [, p] of plan) {
    if (p.tier === 3) {
      hasTier3 = true;
      continue;
    }
    const key = p.path.join('.');
    tier12.push(encodeOne(key, p));
  }

  return {
    tier12,
    tier3Fallback: hasTier3 ? `--json '<JSON-payload>'` : null
  };
}

function encodeOne(key: string, plan: ParameterPlan): string {
  // Tier 1/2 leaves only — Tier 3 short-circuited above.
  if (plan.type === 'scalar') {
    // String scalars use literal-string form `key=`. Number/integer/boolean
    // scalars use typed form `key:=`. When `scalarType` is unset (older
    // plans not produced by the current classifier), default to typed form
    // because mcpc can also coerce strings via JSON parsing.
    if (plan.scalarType === 'string') {
      return `${key}=<value>`;
    }
    if (plan.scalarType === 'boolean') {
      return `${key}:=<true|false>`;
    }
    // number/integer fallthrough — and unspecified scalar.
    return `${key}:=<value>`;
  }
  if (plan.type === 'enum') {
    if (plan.enum && plan.enum.length > 0) {
      return `${key}=<one-of-${plan.enum.join('|')}>`;
    }
    return `${key}=<value>`;
  }
  if (plan.type === 'string-array') {
    return `${key}:=<json-array>`;
  }
  // Catch-all for object/json types that somehow reached here despite tier
  // filtering. Encoding as typed is safest because object/array literals
  // require JSON form.
  return `${key}:=<value>`;
}
