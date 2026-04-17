import type { AuditResult } from './audit-types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A skill-judge score estimate derived from audit check results.
 *
 * Maps the 20+ audit checks to the 8 skill-judge dimensions and produces
 * a total score, percentage, letter grade, and top improvement suggestions.
 *
 * @category Audit
 */
export interface SkillJudgeEstimate {
  dimensions: {
    /** /20 — How much new knowledge the skill imparts */
    d1_knowledgeDelta: number;
    /** /15 — Quality of usage procedures and conditions */
    d2_procedures: number;
    /** /15 — Coverage of known pitfalls and anti-patterns */
    d3_antiPatterns: number;
    /** /15 — Clarity and completeness of descriptions */
    d4_description: number;
    /** /15 — Progressive disclosure: discovery vs. depth */
    d5_progressiveDisclosure: number;
    /** /15 — Freedom from prescriptive over-constraints */
    d6_freedom: number;
    /** /10 — Pattern consistency and grouping */
    d7_pattern: number;
    /** /15 — Developer usability: params, returns, examples */
    d8_usability: number;
  };
  /** Sum of all dimensions (max 120) */
  total: number;
  /** total / 120 * 100, rounded to one decimal */
  percentage: number;
  /** Letter grade based on percentage */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Top 3 actionable improvement suggestions (may be fewer if all dimensions pass 80%) */
  improvements: string[];
}

// ---------------------------------------------------------------------------
// Dimension maxima
// ---------------------------------------------------------------------------

const MAX_D1 = 20;
const MAX_D2 = 15;
const MAX_D3 = 15;
const MAX_D4 = 15;
const MAX_D5 = 15;
const MAX_D6 = 15;
const MAX_D7 = 10;
const MAX_D8 = 15;
const MAX_TOTAL = MAX_D1 + MAX_D2 + MAX_D3 + MAX_D4 + MAX_D5 + MAX_D6 + MAX_D7 + MAX_D8; // 120

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function passes(audit: AuditResult, code: string): boolean {
  return audit.passing.some((p) => p.code === code);
}

function hasFatalCode(audit: AuditResult, code: string): boolean {
  return audit.issues.some((i) => i.code === code && i.severity === 'fatal');
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(0, value), max);
}

// ---------------------------------------------------------------------------
// Core estimator
// ---------------------------------------------------------------------------

/**
 * Estimate the 8-dimension skill-judge score from an {@link AuditResult}.
 *
 * Each dimension starts at a baseline and adds/deducts based on which audit
 * checks pass or fail. Dimensions are capped at their respective maxima.
 *
 * @param audit - The completed audit result to score
 * @returns A {@link SkillJudgeEstimate} with dimension breakdown, total, grade, and improvements
 *
 * @category Audit
 * @useWhen
 * - You want a quick human-readable quality rating after running an audit
 * - Building dashboards that track skill quality over time
 * @avoidWhen
 * - Using as a hard CI gate — prefer explicit audit codes (F1, E4, etc.) for gating
 */
export function estimateSkillJudgeScore(audit: AuditResult): SkillJudgeEstimate {
  // --- D1: Knowledge Delta /20 ---
  let d1 = 14;
  if (passes(audit, 'W10')) d1 += 3; // @remarks on complex functions
  if (passes(audit, 'W1')) d1 += 3; // @packageDocumentation >50 chars
  if (hasFatalCode(audit, 'F4')) d1 -= 5; // missing JSDoc on exports
  d1 = clamp(d1, MAX_D1);

  // --- D2: Procedures /15 ---
  let d2 = 5;
  if (passes(audit, 'W7')) d2 += 5; // @useWhen
  if (passes(audit, 'W8')) d2 += 3; // @avoidWhen
  if (passes(audit, 'E4')) d2 += 2; // @example
  d2 = clamp(d2, MAX_D2);

  // --- D3: Anti-Patterns /15 ---
  let d3 = 2;
  if (passes(audit, 'W9')) d3 += 8; // @pitfalls
  if (passes(audit, 'W3')) d3 += 3; // notable tags
  if (passes(audit, 'W6')) d3 += 2; // README troubleshooting
  d3 = clamp(d3, MAX_D3);

  // --- D4: Description /15 ---
  let d4 = 5;
  if (passes(audit, 'F1')) d4 += 4; // package.json description
  if (passes(audit, 'F3')) d4 += 3; // README description
  if (passes(audit, 'F2')) d4 += 2; // keywords
  if (passes(audit, 'E5')) d4 += 1; // repository URL
  d4 = clamp(d4, MAX_D4);

  // --- D5: Progressive Disclosure /15 ---
  let d5 = 10;
  if (passes(audit, 'W11')) d5 += 3; // @category
  if (passes(audit, 'W5')) d5 += 2; // README Features
  d5 = clamp(d5, MAX_D5);

  // --- D6: Freedom /15 ---
  let d6 = 12;
  if (passes(audit, 'W8')) d6 += 3; // @avoidWhen
  d6 = clamp(d6, MAX_D6);

  // --- D7: Pattern /10 ---
  let d7 = 5;
  if (passes(audit, 'W11')) d7 += 3; // @category
  if (passes(audit, 'W7')) d7 += 2; // @useWhen
  d7 = clamp(d7, MAX_D7);

  // --- D8: Usability /15 ---
  let d8 = 5;
  if (passes(audit, 'E1')) d8 += 3; // @param
  if (passes(audit, 'E2')) d8 += 3; // @returns
  if (passes(audit, 'E3')) d8 += 2; // property JSDoc
  if (passes(audit, 'E4')) d8 += 2; // @example
  d8 = clamp(d8, MAX_D8);

  const total = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8;
  const percentage = Math.round((total / MAX_TOTAL) * 1000) / 10;

  const grade = percentageToGrade(percentage);

  const improvements = buildImprovements(audit, {
    d1,
    d2,
    d3,
    d4,
    d5,
    d6,
    d7,
    d8
  });

  return {
    dimensions: {
      d1_knowledgeDelta: d1,
      d2_procedures: d2,
      d3_antiPatterns: d3,
      d4_description: d4,
      d5_progressiveDisclosure: d5,
      d6_freedom: d6,
      d7_pattern: d7,
      d8_usability: d8
    },
    total,
    percentage,
    grade,
    improvements
  };
}

// ---------------------------------------------------------------------------
// Grade calculation
// ---------------------------------------------------------------------------

function percentageToGrade(pct: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

// ---------------------------------------------------------------------------
// Improvements builder
// ---------------------------------------------------------------------------

interface DimScores {
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  d6: number;
  d7: number;
  d8: number;
}

/**
 * For each dimension below 80% of its max, suggest the audit fix that would
 * help most. Return the top 3 by potential point gain.
 */
function buildImprovements(audit: AuditResult, dims: DimScores): string[] {
  const suggestions: Array<{ gain: number; text: string }> = [];

  // D1: highest single-fix gain is W10 (+3) or W1 (+3)
  if (dims.d1 < MAX_D1 * 0.8) {
    if (!passes(audit, 'W10')) {
      suggestions.push({
        gain: 3,
        text: 'Add @remarks to complex functions (3+ params) (+3 on D1)'
      });
    }
    if (!passes(audit, 'W1')) {
      suggestions.push({
        gain: 3,
        text: 'Add detailed @packageDocumentation description >50 chars (+3 on D1)'
      });
    }
  }

  // D2: highest gain is W7 (+5)
  if (dims.d2 < MAX_D2 * 0.8) {
    if (!passes(audit, 'W7')) {
      suggestions.push({ gain: 5, text: 'Add @useWhen to key exports (+5 on D2)' });
    }
    if (!passes(audit, 'W8')) {
      suggestions.push({ gain: 3, text: 'Add @avoidWhen to key exports (+3 on D2)' });
    }
    if (!passes(audit, 'E4')) {
      suggestions.push({ gain: 2, text: 'Add @example code blocks (+2 on D2)' });
    }
  }

  // D3: highest gain is W9 (+8)
  if (dims.d3 < MAX_D3 * 0.8) {
    if (!passes(audit, 'W9')) {
      suggestions.push({ gain: 8, text: 'Add @pitfalls to key exports (+8 on D3)' });
    }
    if (!passes(audit, 'W3')) {
      suggestions.push({ gain: 3, text: 'Add @deprecated/@since/@throws/@see tags (+3 on D3)' });
    }
    if (!passes(audit, 'W6')) {
      suggestions.push({ gain: 2, text: 'Add README Troubleshooting section (+2 on D3)' });
    }
  }

  // D4: highest gain is F1 (+4)
  if (dims.d4 < MAX_D4 * 0.8) {
    if (!passes(audit, 'F1')) {
      suggestions.push({ gain: 4, text: 'Add meaningful package.json description (+4 on D4)' });
    }
    if (!passes(audit, 'F3')) {
      suggestions.push({ gain: 3, text: 'Add README description/blockquote (+3 on D4)' });
    }
    if (!passes(audit, 'F2')) {
      suggestions.push({ gain: 2, text: 'Add 5+ domain-specific keywords (+2 on D4)' });
    }
    if (!passes(audit, 'E5')) {
      suggestions.push({ gain: 1, text: 'Add repository URL to package.json (+1 on D4)' });
    }
  }

  // D5: highest gain is W11 (+3)
  if (dims.d5 < MAX_D5 * 0.8) {
    if (!passes(audit, 'W11')) {
      suggestions.push({ gain: 3, text: 'Add @category for grouping (+3 on D5, +3 on D7)' });
    }
    if (!passes(audit, 'W5')) {
      suggestions.push({ gain: 2, text: 'Add README Features section (+2 on D5)' });
    }
  }

  // D6: only W8 (+3) — but D6 base is 12 so below 80% (12) rarely triggers unless W8 missing
  if (dims.d6 < MAX_D6 * 0.8) {
    if (!passes(audit, 'W8')) {
      suggestions.push({ gain: 3, text: 'Add @avoidWhen to key exports (+3 on D6)' });
    }
  }

  // D7: W11 (+3), W7 (+2)
  if (dims.d7 < MAX_D7 * 0.8) {
    if (!passes(audit, 'W11')) {
      // Avoid duplicate if already added from D5
      const alreadySuggested = suggestions.some((s) => s.text.includes('@category for grouping'));
      if (!alreadySuggested) {
        suggestions.push({ gain: 3, text: 'Add @category for grouping (+3 on D5, +3 on D7)' });
      }
    }
    if (!passes(audit, 'W7')) {
      const alreadySuggested = suggestions.some((s) => s.text.includes('@useWhen to key exports'));
      if (!alreadySuggested) {
        suggestions.push({ gain: 2, text: 'Add @useWhen to key exports (+2 on D7)' });
      }
    }
  }

  // D8: E1 (+3), E2 (+3), E3 (+2), E4 (+2)
  if (dims.d8 < MAX_D8 * 0.8) {
    if (!passes(audit, 'E1')) {
      suggestions.push({ gain: 3, text: 'Add @param descriptions to all parameters (+3 on D8)' });
    }
    if (!passes(audit, 'E2')) {
      suggestions.push({
        gain: 3,
        text: 'Add @returns descriptions to non-void functions (+3 on D8)'
      });
    }
    if (!passes(audit, 'E3')) {
      suggestions.push({ gain: 2, text: 'Add JSDoc to all interface/type properties (+2 on D8)' });
    }
    if (!passes(audit, 'E4')) {
      const alreadySuggested = suggestions.some((s) => s.text.includes('@example code blocks'));
      if (!alreadySuggested) {
        suggestions.push({ gain: 2, text: 'Add @example code blocks (+2 on D8)' });
      }
    }
  }

  // Sort by gain desc, deduplicate by text, take top 3
  suggestions.sort((a, b) => b.gain - a.gain);
  const seen = new Set<string>();
  const top: string[] = [];
  for (const s of suggestions) {
    if (!seen.has(s.text) && top.length < 3) {
      seen.add(s.text);
      top.push(s.text);
    }
  }

  return top;
}
