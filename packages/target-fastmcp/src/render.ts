/**
 * `FastMcpAdapter` — CLI-as-proxy invocation adapter for the Python `fastmcp` CLI.
 *
 * @remarks
 * Emits SKILL.md output usable by any agent with a shell tool, by routing
 * tool calls through `fastmcp` (https://gofastmcp.com). Unlike the
 * `mcp-protocol` adapter, this adapter does NOT emit an `mcp:` frontmatter
 * block — the MCP server connection is established via the shell
 * `pyfastmcp connect` command described in the Setup section. Instead it
 * emits a `generated-by:` block carrying the adapter's fingerprint
 * (FR-IT-012).
 *
 * The body delegates to core's default render path with two extensions:
 *
 * 1. `bodyPrefix` — the Setup section is prepended to the SKILL.md body so
 *    the consumer sees install/connect instructions before the standard
 *    skill content.
 * 2. `skipDefaultFunctionsRef` — the default `references/functions.md` is
 *    suppressed; the adapter emits its own `references/tools.md` carrying
 *    fastmcp command-shape rows produced by `renderCliParamTable`.
 *
 * Resources/prompts/types/etc. references are inherited from core
 * unchanged — the only kind requiring CLI-specific rendering is functions
 * (which become tools in the fastmcp dialect).
 *
 * @module render
 */

import type {
  AdapterFingerprint,
  AdapterRenderContext,
  ExtractedFunction,
  ExtractedParameter,
  ExtractedSkill,
  RenderedFile,
  RenderedSkill
} from '@to-skills/core';
import { estimateTokens, renderSkill, truncateToTokenBudget } from '@to-skills/core';
import type { InvocationAdapter, ParameterPlan } from '@to-skills/mcp';
import {
  McpError,
  classifyParameters,
  generatedByFrontmatter,
  renderCliParamTable,
  splitToolsByNamespace
} from '@to-skills/mcp';
import type { JSONSchema7 } from 'json-schema';
import { encodeFastMcpArgs } from './args.js';
import { renderFastMcpSetup, type StdioLaunchCommand, type HttpLaunchEndpoint } from './setup.js';
import { PACKAGE_VERSION } from './version.js';

/**
 * fastmcp CLI-as-proxy adapter — emits shell-command skills consumable by
 * any agent with a `bash`/`shell` tool.
 *
 * @public
 */
export class FastMcpAdapter implements InvocationAdapter {
  readonly target = 'cli:fastmcp' as const;
  readonly fingerprint: AdapterFingerprint;

  constructor() {
    this.fingerprint = {
      adapter: '@to-skills/target-fastmcp',
      version: PACKAGE_VERSION,
      targetCliRange: 'fastmcp@^2'
    };
  }

  /**
   * Render an `ExtractedSkill` into a `RenderedSkill` carrying fastmcp
   * command-shape SKILL.md output.
   *
   * @throws `McpError` with code `MISSING_LAUNCH_COMMAND` when neither
   *   `ctx.launchCommand` nor `ctx.httpEndpoint` is set. (`packageName` is
   *   accepted only as a fallback into npx-by-name stdio launch.)
   */
  async render(skill: ExtractedSkill, ctx: AdapterRenderContext): Promise<RenderedSkill> {
    const launchCommand = resolveLaunchCommand(ctx);

    // Frontmatter — `generated-by:` only. Do NOT emit `mcp:` block.
    const additionalFrontmatter = generatedByFrontmatter(this.fingerprint);

    // Setup section — install + connect commands + FR-IT-012 trace line.
    const bodyPrefix = renderFastMcpSetup(ctx.skillName, launchCommand, this.fingerprint);

    // Delegate body to core's default path. We disable:
    //  - the default functions.md emission (we emit our own tools.md below)
    //  - the inner canonicalize pass — because we mutate `references` after
    //    this call, and a single canonicalize run at the host's outer wrapper
    //    is sufficient (and avoids a redundant second pass on the body).
    const baseRendered = renderSkill(skill, {
      maxTokens: ctx.maxTokens,
      additionalFrontmatter,
      bodyPrefix,
      skipDefaultFunctionsRef: true,
      canonicalize: false,
      invocation: undefined,
      namePrefix: ctx.skillName
    });

    // Append our own tools.md (or per-namespace tools-<ns>.md split) if
    // there are any tools. The host's outer canonicalize wrapper (in
    // renderSkill's invocation-adapter dispatch) runs exactly once over
    // this final shape, including the tools file(s).
    const toolsRefs = renderToolsReference(skill.functions, ctx.skillName, ctx.maxTokens);
    for (const ref of toolsRefs) {
      baseRendered.references.push(ref);
    }

    return baseRendered;
  }
}

/**
 * Pick the launch shape passed to `renderFastMcpSetup`.
 *
 * Resolution order — same general intent as `McpProtocolAdapter` but the
 * CLI adapter doesn't have a "bundle wins" override because fastmcp skills
 * are extract-time artifacts (you wouldn't usually fastmcp-proxy your own
 * bundle). Still, when `packageName` is set with no other launch info, we
 * fall back to `npx -y <packageName>` so the connect command remains valid.
 *
 * 1. `ctx.httpEndpoint` — emit `{ url, headers? }` shape.
 * 2. `ctx.launchCommand` — verbatim stdio command.
 * 3. `ctx.packageName` — synthesize `{ command: 'npx', args: ['-y', name] }`.
 *
 * Throws `MISSING_LAUNCH_COMMAND` if none of the three are set.
 */
function resolveLaunchCommand(ctx: AdapterRenderContext): StdioLaunchCommand | HttpLaunchEndpoint {
  if (ctx.httpEndpoint) {
    return ctx.httpEndpoint.headers
      ? { url: ctx.httpEndpoint.url, headers: ctx.httpEndpoint.headers }
      : { url: ctx.httpEndpoint.url };
  }
  if (ctx.launchCommand) {
    return ctx.launchCommand;
  }
  if (ctx.packageName) {
    const args = ctx.binName
      ? ['-y', `--package=${ctx.packageName}`, ctx.binName]
      : ['-y', ctx.packageName];
    return { command: 'npx', args };
  }
  throw new McpError(
    'FastMcpAdapter.render: none of ctx.httpEndpoint, ctx.launchCommand, or ctx.packageName provided',
    'MISSING_LAUNCH_COMMAND'
  );
}

/**
 * Build the `references/tools.md` file(s) with fastmcp command-shape rows.
 *
 * Returns an empty array when the IR has no tools (so the adapter doesn't
 * emit an empty file). When the rendered body fits inside `maxTokens`, a
 * single `references/tools.md` is returned. Otherwise the helper splits
 * the surface by first-segment namespace (FR-022) and returns one
 * `references/tools-<ns>.md` per namespace. Each emitted file has its
 * content passed through `truncateToTokenBudget` so even a single
 * oversized namespace cannot blow past the budget; the `tokens` field
 * reports the pre-truncation estimate, matching the convention used by
 * core's renderer.
 */
function renderToolsReference(
  functions: readonly ExtractedFunction[],
  skillName: string,
  maxTokens: number
): RenderedFile[] {
  if (functions.length === 0) return [];

  const groups = splitToolsByNamespace(
    functions,
    (subset) => estimateTokens(renderToolsBody(subset, skillName)),
    maxTokens
  );

  const files: RenderedFile[] = [];
  for (const group of groups) {
    const content = renderToolsBody(group.tools, skillName);
    const filename =
      group.name === 'tools'
        ? `${skillName}/references/tools.md`
        : `${skillName}/references/tools-${group.name}.md`;
    files.push({
      filename,
      content: truncateToTokenBudget(content, maxTokens),
      tokens: estimateTokens(content)
    });
  }
  return files;
}

/**
 * Render the textual body for a (possibly partial) tool list. Extracted
 * from `renderToolsReference` so the namespace-splitter's cost estimator
 * can call it on candidate subsets without duplicating layout code.
 */
function renderToolsBody(functions: readonly ExtractedFunction[], skillName: string): string {
  const lines: string[] = ['# Tools', ''];
  for (const fn of functions) {
    lines.push(`## ${fn.name}`);
    lines.push('');
    if (fn.description) {
      lines.push(fn.description);
      lines.push('');
    }

    const plan = planForTool(fn);
    const encoded = encodeFastMcpArgs(plan);

    // Command line — fastmcp invokes a tool via:
    //   pyfastmcp call <skillName> <tool> <encoded-args>
    // Tier 3 fallback (a single `--input-json '...'` token) is appended at
    // the end since fastmcp accepts it as one of the argument tokens.
    const argv = [...encoded.tier12];
    if (encoded.tier3Fallback) argv.push(encoded.tier3Fallback);
    const argvSuffix = argv.length > 0 ? ' ' + argv.join(' ') : '';
    lines.push('```sh');
    lines.push(`pyfastmcp call ${skillName} ${fn.name}${argvSuffix}`);
    lines.push('```');
    lines.push('');

    if (plan.size > 0) {
      lines.push('### Parameters');
      lines.push('');
      lines.push(renderCliParamTable(fn, plan, encodePlanForTable));
      lines.push('');
    }
  }

  return collapseTrailingNewlines(lines.join('\n'));
}

/**
 * Trim runs of trailing newlines down to a single `\n`. We avoid the regex
 * `s.replace(/\n+$/, '\n')` because CodeQL flags the unbounded `+` repeat
 * as a polynomial-ReDoS risk on adversarial input. Manual slice is O(n) and
 * has the same observable behavior.
 */
function collapseTrailingNewlines(s: string): string {
  let end = s.length;
  while (end > 0 && s.charCodeAt(end - 1) === 0x0a) end--;
  return s.slice(0, end) + '\n';
}

/**
 * Encoder used by `renderCliParamTable`. Identical encoding rules to
 * `encodeFastMcpArgs` but operates on a single plan so it can be the
 * per-row-callback the table expects.
 */
function encodePlanForTable(plan: ParameterPlan): string {
  const key = plan.path.join('.');
  if (plan.tier === 3) return `--input-json '<JSON-payload>'`;
  if (plan.type === 'scalar') {
    if (plan.scalarType === 'boolean') return `${key}=<true|false>`;
    return `${key}=<value>`;
  }
  if (plan.type === 'enum') {
    if (plan.enum && plan.enum.length > 0) {
      return `${key}=<one-of-${plan.enum.join('|')}>`;
    }
    return `${key}=<value>`;
  }
  if (plan.type === 'string-array') return `${key}=<comma-separated>`;
  return `${key}=<value>`;
}

/**
 * Synthesize a minimal JSON Schema from the IR's `ExtractedParameter` list and
 * classify it. The IR doesn't preserve the original `inputSchema`, so we
 * reconstruct enough structural information for `classifyParameters` to
 * decide tier and scalar type.
 *
 * Type-label mapping:
 * - `'string'` / `'number'` / `'integer'` / `'boolean'` → JSON Schema scalar
 * - `'string[]'` → string array (Tier 1 string-array)
 * - `'object'` → escalates to Tier 3 (we have no nested property info)
 * - anything else (`'union'`, `'array'`, custom labels) → Tier 3
 */
function planForTool(fn: ExtractedFunction): Map<string, ParameterPlan> {
  const properties: Record<string, JSONSchema7> = {};
  const required: string[] = [];

  for (const p of fn.parameters) {
    properties[p.name] = parameterToSchema(p);
    if (!p.optional) required.push(p.name);
  }

  const schema: JSONSchema7 = {
    type: 'object',
    properties
  };
  if (required.length > 0) schema.required = required;

  return classifyParameters(schema);
}

function parameterToSchema(param: ExtractedParameter): JSONSchema7 {
  const label = param.type.trim();
  if (label === 'string') return { type: 'string' };
  if (label === 'number') return { type: 'number' };
  if (label === 'integer') return { type: 'integer' };
  if (label === 'boolean') return { type: 'boolean' };
  if (label === 'string[]') return { type: 'array', items: { type: 'string' } };
  // Everything else is too ambiguous to classify Tier 1 — give the
  // classifier an empty schema so it falls through to Tier 3.
  return {};
}
