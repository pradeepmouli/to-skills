/**
 * Canonicalization pass — deterministic post-render normalization.
 *
 * Operates on `RenderedSkill` (string content), NOT on the `ExtractedSkill` IR.
 *
 * Division of responsibility (see specs/001-mcp-extract-bundle/research.md §2):
 *   - Array ordering of tools/resources/prompts is the ADAPTER's job. Each
 *     adapter emits items in sorted order directly from the IR. We do NOT
 *     parse rendered markdown sections and reorder entries here — that would
 *     be the wrong layer.
 *   - This module handles the post-render invariants that any adapter's
 *     output should satisfy to be content-identical across runs:
 *       1. YAML frontmatter key sort
 *       2. Line endings normalized to LF
 *       3. Trailing whitespace trimmed per line
 *       4. Runs of 2+ blank lines collapsed to 1
 *       5. Optional regex-based pattern stripping (e.g., timestamps)
 *
 * Must be idempotent: `canonicalize(canonicalize(x))` equals `canonicalize(x)`.
 *
 * @module canonical
 */

import YAML from 'yaml';
import type { RenderedFile, RenderedSkill } from './types.js';

export interface CanonicalizeOptions {
  /** Regex patterns whose matches are stripped from prose content (e.g. timestamps, PIDs). */
  stripPatterns?: RegExp[];
}

/**
 * Normalize a `RenderedSkill` so repeat runs produce content-identical output.
 *
 * @param skill - rendered skill to normalize; input is not mutated
 * @param opts - optional pattern list for stripping nondeterministic prose fragments
 * @returns new `RenderedSkill` with canonicalized content
 */
export function canonicalize(skill: RenderedSkill, opts?: CanonicalizeOptions): RenderedSkill {
  return {
    skill: canonicalizeFile(skill.skill, opts),
    references: skill.references.map((f) => canonicalizeFile(f, opts))
  };
}

function canonicalizeFile(file: RenderedFile, opts?: CanonicalizeOptions): RenderedFile {
  return {
    filename: file.filename,
    content: canonicalizeContent(file.content, opts),
    tokens: file.tokens
  };
}

function canonicalizeContent(content: string, opts?: CanonicalizeOptions): string {
  // 1. Line endings: normalize CRLF / CR to LF up front.
  let normalized = content.replace(/\r\n?/g, '\n');

  // 2. Frontmatter key sort (if a leading YAML block is present).
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (fmMatch && fmMatch[1] !== undefined) {
    const rawFrontmatter = fmMatch[1];
    const sortedFrontmatter = sortFrontmatter(rawFrontmatter);
    const rest = normalized.slice(fmMatch[0].length);
    normalized = `---\n${sortedFrontmatter}\n---\n${rest}`;
  }

  // 3. Optional pattern stripping (e.g., timestamps).
  if (opts?.stripPatterns) {
    for (const pattern of opts.stripPatterns) {
      // Preserve pattern as-is; callers own whether it's global.
      normalized = normalized.replace(pattern, '');
    }
  }

  // 4. Whitespace normalization.
  //    - Trim trailing whitespace on each line.
  //    - Collapse runs of 2+ blank lines to a single blank line.
  const lines = normalized.split('\n').map((line) => line.replace(/[ \t]+$/, ''));
  const collapsed: string[] = [];
  let blankRun = 0;
  for (const line of lines) {
    if (line === '') {
      blankRun += 1;
      if (blankRun <= 1) collapsed.push(line);
    } else {
      blankRun = 0;
      collapsed.push(line);
    }
  }
  return collapsed.join('\n');
}

/**
 * Sort keys in a YAML frontmatter block alphabetically while preserving the
 * original line formatting (quote style, indentation, block-vs-flow) for each
 * value.
 *
 * Strategy: split the block into top-level key "chunks" — a line starting with
 * `<key>:` at column 0, plus all subsequent lines that are either blank or
 * indented (continuations, block scalar bodies, nested mappings, arrays).
 * Sort chunks by key; rejoin. This round-trips losslessly because we never
 * re-serialize the values.
 *
 * If the frontmatter cannot be parsed as a simple top-level mapping (e.g. it's
 * a scalar or sequence at the root, or there are no top-level key lines), we
 * leave the block untouched. The `yaml` package still validates it — we parse
 * once to confirm it's a mapping, then discard the parsed value.
 */
function sortFrontmatter(raw: string): string {
  // Confirm the block parses to a mapping before attempting a line-based sort.
  let parsed: unknown;
  try {
    parsed = YAML.parse(raw);
  } catch {
    return raw; // malformed — preserve as-is (whitespace pass still applies)
  }
  if (
    parsed === null ||
    parsed === undefined ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    return raw;
  }

  const lines = raw.split('\n');
  // Group lines into chunks keyed by the first top-level `key:` we see.
  // A top-level key line matches: starts with a non-space character, contains `:`,
  // with key made of characters permitted in a YAML plain scalar key.
  const topLevelKeyRe = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:/;

  const chunks: Array<{ key: string; lines: string[] }> = [];
  let preamble: string[] = []; // lines before the first key (usually empty)
  let current: { key: string; lines: string[] } | null = null;

  for (const line of lines) {
    const m = line.match(topLevelKeyRe);
    if (m && !line.startsWith(' ') && !line.startsWith('\t')) {
      // New top-level key starts here.
      if (current) chunks.push(current);
      current = { key: m[1]!, lines: [line] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) chunks.push(current);

  if (chunks.length === 0) return raw;

  chunks.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  const out: string[] = [...preamble];
  for (const chunk of chunks) out.push(...chunk.lines);
  // Drop any trailing empty strings that arose from the original's trailing \n.
  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}
