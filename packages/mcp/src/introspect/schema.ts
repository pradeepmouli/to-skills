// JSON Schema $ref resolver for MCP tool inputSchemas.
//
// Research.md §3 selected @apidevtools/json-schema-ref-parser as the library.
// FR-010: all in-document $ref pointers must be resolved before rendering.
// FR-011: cycle detection produces an audit-worthy warning rather than a crash.
//
// The caller is responsible for treating `McpError('SCHEMA_REF_CYCLE')` as a
// non-fatal audit signal (record the tool in Quick Reference, omit parameter
// table, surface via M2 audit rule).

import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { JSONSchema7 } from 'json-schema';
import { McpError } from '../errors.js';

/**
 * Dereference all in-document `$ref` pointers in a tool's inputSchema.
 *
 * External refs are rejected; cycles are reported as `McpError('SCHEMA_REF_CYCLE')`.
 * The caller should treat cycle errors as audit warnings (omit parameter table,
 * continue extraction) rather than fatal failures (FR-011).
 *
 * Implementation notes (verified against @apidevtools/json-schema-ref-parser@11.9.3):
 * - Cyclic schemas throw with a message starting with `Circular $ref pointer found`
 *   when `dereference.circular` is `false`.
 * - External refs (file:// or http(s)://) throw `Unable to resolve $ref pointer ...`
 *   when `resolve.file` and `resolve.http` are disabled.
 * - Broken in-document refs throw `Missing $ref pointer ...` regardless.
 * All of these cases are normalised to `SCHEMA_REF_CYCLE` since the caller's
 * handling is identical: surface via the M2 audit rule.
 *
 * @param schema the raw inputSchema returned by the MCP server
 * @returns a deep-cloned schema with no $ref pointers
 * @throws McpError (code `SCHEMA_REF_CYCLE`) on any resolver-reported cycle,
 *         external ref, broken ref, or other dereference failure
 */
export async function resolveSchema(schema: JSONSchema7): Promise<JSONSchema7> {
  // Deep-clone the input so the caller's object isn't mutated. structuredClone
  // is available in Node 17+ (this project requires Node ≥20).
  const cloned = structuredClone(schema);

  let dereferenced: unknown;
  try {
    dereferenced = await $RefParser.dereference(cloned as object, {
      // Reject external refs — we only resolve in-document pointers. Disabling
      // the file and http resolvers causes $RefParser to throw rather than
      // fetching remote content, preserving the package's "metadata-only,
      // no network beyond MCP" principle.
      resolve: {
        file: false,
        http: false
      },
      // Reject circular schemas rather than returning a self-referencing object.
      dereference: {
        circular: false
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new McpError(`Failed to resolve inputSchema: ${message}`, 'SCHEMA_REF_CYCLE', err);
  }

  // Defensive post-check: if for any reason a $ref survived dereferencing
  // (e.g., a future library version that silently skips unresolvable refs),
  // treat it the same as a cycle/external-ref failure.
  if (containsRef(dereferenced)) {
    throw new McpError(
      'Failed to resolve inputSchema: unresolved $ref pointer remains after dereference',
      'SCHEMA_REF_CYCLE'
    );
  }

  return dereferenced as JSONSchema7;
}

/**
 * Recursively scan `value` for any object carrying a `$ref` property.
 * Used as a defensive guard after `$RefParser.dereference`.
 */
function containsRef(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (containsRef(item)) return true;
    }
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj['$ref'] === 'string') return true;
  for (const key of Object.keys(obj)) {
    if (containsRef(obj[key])) return true;
  }
  return false;
}
