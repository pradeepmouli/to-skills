// MCP tools/list introspection — paginates and maps to ExtractedFunction.

import type { ExtractedFunction, ExtractedParameter } from '@to-skills/core';
import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import { McpError } from '../errors.js';
import type { McpClient, McpToolListEntry } from './client-types.js';
import { resolveSchema } from './schema.js';

/**
 * Enumerate all tools exposed by an MCP server and convert each to the
 * `ExtractedFunction` shape consumed by the renderer.
 *
 * Pagination: the helper repeatedly calls `client.listTools({ cursor })` until
 * the server returns an undefined `nextCursor`. The first call passes no
 * cursor (per the MCP spec, an absent cursor requests the first page).
 *
 * Schema handling: each tool's `inputSchema` is deep-cloned and dereferenced
 * via `resolveSchema` before its top-level properties are mapped to
 * `ExtractedParameter` entries. Tools whose schema fails to resolve due to a
 * cycle, broken `$ref`, or external `$ref` are surfaced with empty
 * `parameters` and a `tags.schemaError === 'true'` marker so the M2 audit rule
 * (Phase 9) can flag them. All other resolver errors are propagated.
 *
 * Tools whose `inputSchema` is missing (`undefined`/`null`) produce empty
 * `parameters` without an error — the absence of a schema is a valid signal
 * that the tool takes no input.
 *
 * Tag-driven metadata (`_meta.toSkills.*` etc.) is intentionally NOT populated
 * here; that's the responsibility of US7 in Phase 9.
 *
 * @param client structural MCP client (real SDK `Client` or a test mock)
 * @returns one `ExtractedFunction` per tool, in the order returned by the server
 */
export async function listTools(client: McpClient): Promise<ExtractedFunction[]> {
  const all: McpToolListEntry[] = [];
  let cursor: string | undefined;

  // Initial page request: no cursor. Subsequent pages: pass the last
  // `nextCursor`. Loop terminates when `nextCursor` is undefined.
  do {
    const page = await client.listTools(cursor === undefined ? undefined : { cursor });
    all.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor !== undefined);

  const results: ExtractedFunction[] = [];
  for (const tool of all) {
    results.push(await mapTool(tool));
  }
  return results;
}

/**
 * Convert one `McpToolListEntry` to an `ExtractedFunction`. Splits out so the
 * pagination loop above stays focused on cursor management.
 */
async function mapTool(tool: McpToolListEntry): Promise<ExtractedFunction> {
  const name = tool.name;
  const description = tool.description ?? '';

  // No schema → no parameters. This is not an error condition.
  if (tool.inputSchema === undefined || tool.inputSchema === null) {
    return {
      name,
      description,
      signature: `${name}()`,
      parameters: [],
      returnType: 'unknown',
      examples: [],
      tags: {}
    };
  }

  // Deep-clone before passing to resolveSchema so that even if the resolver
  // were ever to mutate, the caller's tool object is safe. (resolveSchema
  // already clones internally — this is belt-and-braces given the schema
  // arrives typed as `unknown`.)
  const rawSchema = tool.inputSchema as JSONSchema7;
  const cloned = structuredClone(rawSchema);

  let resolved: JSONSchema7;
  try {
    resolved = await resolveSchema(cloned);
  } catch (err) {
    // Only swallow schema-cycle errors — every other error type is a bug or
    // environmental failure that should bubble.
    if (err instanceof McpError && err.code === 'SCHEMA_REF_CYCLE') {
      return {
        name,
        description,
        signature: `${name}()`,
        parameters: [],
        returnType: 'unknown',
        examples: [],
        tags: { schemaError: 'true' }
      };
    }
    throw err;
  }

  const parameters = extractParameters(resolved);
  return {
    name,
    description,
    signature: synthesizeSignature(name, parameters),
    parameters,
    returnType: 'unknown',
    examples: [],
    tags: {}
  };
}

/**
 * Walk the top-level `properties` of a resolved JSON Schema and produce one
 * `ExtractedParameter` per entry. Nested object structure is summarized via
 * the `type` field only — deep flattening is the renderer adapter's concern,
 * not this introspector's.
 */
function extractParameters(schema: JSONSchema7): ExtractedParameter[] {
  if (!isPlainObject(schema)) return [];
  const properties = schema.properties;
  if (!properties || typeof properties !== 'object') return [];

  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  const params: ExtractedParameter[] = [];

  for (const [paramName, raw] of Object.entries(properties)) {
    // JSON Schema `true`/`false` whole-schema is rare but legal. Treat as
    // unknown — there's no structural information to extract.
    if (typeof raw === 'boolean') {
      params.push({
        name: paramName,
        type: 'unknown',
        description: '',
        optional: !required.has(paramName)
      });
      continue;
    }

    const child: JSONSchema7 = raw;
    const param: ExtractedParameter = {
      name: paramName,
      type: deriveTypeLabel(child),
      description: child.description ?? '',
      optional: !required.has(paramName)
    };
    if (child.default !== undefined) {
      param.defaultValue = JSON.stringify(child.default);
    }
    params.push(param);
  }

  return params;
}

/**
 * Render a JSON Schema fragment into a short type label suitable for the
 * `ExtractedParameter.type` field. Order of precedence:
 *   1. `anyOf`/`oneOf`/`allOf` → `'union'`
 *   2. `type === 'array'` → `T[]` if items have a single resolvable type, else `'array'`
 *   3. `type === 'object'` → `'object'`
 *   4. Single primitive → the type name (`'string'`, `'number'`, ...)
 *   5. Fallback → `'unknown'`
 */
function deriveTypeLabel(schema: JSONSchema7): string {
  if (Array.isArray(schema.anyOf) || Array.isArray(schema.oneOf) || Array.isArray(schema.allOf)) {
    return 'union';
  }

  const types = normalizeTypes(schema);
  if (!types) return 'unknown';

  if (types.length === 1 && types[0] === 'array') {
    const items = schema.items;
    if (isPlainObject(items)) {
      const itemLabel = deriveTypeLabel(items);
      return `${itemLabel}[]`;
    }
    return 'array';
  }

  if (types.length === 1 && types[0] === 'object') {
    return 'object';
  }

  if (types.length === 1) {
    return types[0] as string;
  }

  // e.g. ['string', 'number'] without anyOf — surface as union.
  return 'union';
}

/**
 * Normalize JSON Schema's `type` field (single string or array of strings)
 * into the non-null type list. Returns null when no usable type is set.
 */
function normalizeTypes(schema: JSONSchema7): JSONSchema7TypeName[] | null {
  const t = schema.type;
  if (typeof t === 'string') return [t];
  if (Array.isArray(t)) {
    const nonNull = t.filter((x): x is JSONSchema7TypeName => x !== 'null');
    return nonNull.length > 0 ? nonNull : null;
  }
  return null;
}

function isPlainObject(value: unknown): value is JSONSchema7 {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Build a tool signature like `name(arg1, arg2?)`. Required parameters appear
 * bare; optional parameters are suffixed with `?`. Order matches the parameters
 * list (which itself follows `Object.entries` insertion order on `properties`).
 */
function synthesizeSignature(name: string, parameters: ExtractedParameter[]): string {
  if (parameters.length === 0) return `${name}()`;
  const parts = parameters.map((p) => (p.optional ? `${p.name}?` : p.name));
  return `${name}(${parts.join(', ')})`;
}
