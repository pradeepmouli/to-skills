/**
 * Tier classifier for CLI adapter parameter encoding.
 *
 * Pure function that walks a tool's JSON Schema `inputSchema` and produces a
 * per-parameter encoding plan. See `specs/001-mcp-extract-bundle/research.md`
 * §6 for design rationale.
 *
 * Three tiers:
 * - **Tier 1** — scalars (string, number, boolean), enums, simple string
 *   arrays. Rendered by the CLI adapter as a single `key=value` (or similar)
 *   flag.
 * - **Tier 2** — objects whose properties are all Tier 1. Flattened with
 *   dot notation; each nested Tier 1 leaf becomes its own flag
 *   (`parent.child=value`).
 * - **Tier 3** — anything else: nested objects beyond depth 1, arrays of
 *   objects, unresolved `$ref`, `oneOf`/`anyOf`/`allOf` unions, boolean
 *   schemas, missing `type`, etc. Rendered as a single JSON-payload flag.
 *
 * This classifier does NOT resolve `$ref`. The caller should run
 * `resolveSchema` (packages/mcp/src/introspect/schema.ts) first, then
 * classify. If a `$ref` appears during classification, the containing
 * property is treated as Tier 3 to avoid silent misclassification.
 */

import type { JSONSchema7, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';

export interface ParameterPlan {
  /** Dot-notation path, e.g. ["user", "email"] */
  path: string[];
  /** Rendering tier (see Research §6) */
  tier: 1 | 2 | 3;
  /** Structural type */
  type: 'scalar' | 'enum' | 'string-array' | 'object' | 'json';
  /** Whether this parameter is required */
  required: boolean;
  /** Optional enum values (only when type === 'enum') */
  enum?: string[];
  /**
   * Underlying JSON Schema scalar type — populated only when `type === 'scalar'`
   * (Tier 1 or Tier 2 leaves). Lets CLI adapters distinguish typed encodings
   * (`key:=value` for number/integer/boolean) from string encodings
   * (`key=value` for string). Backward-compatible additive field.
   */
  scalarType?: 'string' | 'number' | 'integer' | 'boolean';
}

type Tier1Kind = 'scalar' | 'enum' | 'string-array';

interface Tier1Classification {
  kind: Tier1Kind;
  /** Present when `kind === 'enum'`. */
  enum?: string[];
  /** Present when `kind === 'scalar'`. */
  scalarType?: 'string' | 'number' | 'integer' | 'boolean';
}

const SCALAR_TYPES = new Set<JSONSchema7TypeName>(['string', 'number', 'integer', 'boolean']);

/**
 * Classifies each top-level property of the given JSON Schema into an
 * encoding plan. The returned Map is keyed by the dot-notation path
 * (e.g. `"user.email"`).
 *
 * Required-inheritance rule for Tier 2 nested properties:
 *   We use the OUTER property's required-ness as the required flag for each
 *   nested leaf. Rationale: CLI flags are namespaced under the parent, and
 *   the parent is the unit of requiredness for CLI UX purposes (the user
 *   must supply either all parent-scoped flags or none — partial objects
 *   are ambiguous).
 */
export function classifyParameters(inputSchema: JSONSchema7): Map<string, ParameterPlan> {
  const plans = new Map<string, ParameterPlan>();

  if (!isPlainObject(inputSchema)) {
    return plans;
  }

  const properties = inputSchema.properties;
  if (!properties || typeof properties !== 'object') {
    return plans;
  }

  const requiredTop = new Set(Array.isArray(inputSchema.required) ? inputSchema.required : []);

  for (const [name, rawSchema] of Object.entries(properties)) {
    const isRequired = requiredTop.has(name);

    // Boolean schemas (JSON Schema `true` / `false`) are legal but rare.
    // Treat them as Tier 3 — they convey no structural information.
    if (typeof rawSchema === 'boolean') {
      plans.set(name, {
        path: [name],
        tier: 3,
        type: 'json',
        required: isRequired
      });
      continue;
    }

    const schema = rawSchema;

    // `$ref` is unresolved at this point. This classifier does not follow
    // refs — that's `resolveSchema`'s job (B5). Treat as Tier 3.
    if (typeof schema.$ref === 'string') {
      plans.set(name, {
        path: [name],
        tier: 3,
        type: 'json',
        required: isRequired
      });
      continue;
    }

    // Unions (oneOf/anyOf/allOf) are not collapsible into a single
    // CLI flag; escalate to Tier 3.
    if (hasUnion(schema)) {
      plans.set(name, {
        path: [name],
        tier: 3,
        type: 'json',
        required: isRequired
      });
      continue;
    }

    const tier1 = tryClassifyTier1(schema);
    if (tier1) {
      const plan: ParameterPlan = {
        path: [name],
        tier: 1,
        type: tier1.kind,
        required: isRequired
      };
      if (tier1.enum) plan.enum = tier1.enum;
      if (tier1.scalarType) plan.scalarType = tier1.scalarType;
      plans.set(name, plan);
      continue;
    }

    // Tier 2: object whose every direct property is Tier 1.
    const tier2 = tryClassifyTier2(schema);
    if (tier2) {
      for (const leaf of tier2) {
        const path = [name, leaf.name];
        const key = path.join('.');
        const plan: ParameterPlan = {
          path,
          tier: 2,
          // Every Tier 2 leaf is itself Tier 1, so its `type` is the
          // leaf's Tier 1 kind ('scalar' | 'enum' | 'string-array').
          type: leaf.kind,
          // Required-inheritance: use the OUTER property's required flag.
          // See function doc comment for rationale.
          required: isRequired
        };
        if (leaf.enum) plan.enum = leaf.enum;
        if (leaf.scalarType) plan.scalarType = leaf.scalarType;
        plans.set(key, plan);
      }
      continue;
    }

    // Fallthrough: deeply nested, arrays of objects, missing type, etc.
    plans.set(name, {
      path: [name],
      tier: 3,
      type: 'json',
      required: isRequired
    });
  }

  return plans;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is JSONSchema7 {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasUnion(schema: JSONSchema7): boolean {
  return Array.isArray(schema.oneOf) || Array.isArray(schema.anyOf) || Array.isArray(schema.allOf);
}

/**
 * Normalize a JSON Schema `type` field (which may be a single type or an
 * array of types, e.g. `["string", "null"]`) into the non-null type set.
 * Returns `null` when no usable type can be determined.
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

/**
 * Returns a Tier 1 classification if `schema` qualifies, else `null`.
 */
function tryClassifyTier1(schema: JSONSchema7): Tier1Classification | null {
  // Unresolved $ref is never Tier 1.
  if (typeof schema.$ref === 'string') return null;

  const types = normalizeTypes(schema);
  if (!types) return null;

  // enum (only valid for string-typed properties in our classifier).
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const allStrings = types.every((t) => t === 'string');
    if (!allStrings) return null;
    const enumStrings = schema.enum.filter((v): v is string => typeof v === 'string');
    if (enumStrings.length !== schema.enum.length) return null;
    return { kind: 'enum', enum: enumStrings };
  }

  // Simple string array.
  if (types.length === 1 && types[0] === 'array') {
    const items = schema.items;
    if (isPlainObject(items)) {
      const itemTypes = normalizeTypes(items);
      if (itemTypes && itemTypes.length === 1 && itemTypes[0] === 'string') {
        return { kind: 'string-array' };
      }
    }
    return null;
  }

  // Scalar: every non-null type must be a scalar primitive.
  if (types.every((t) => SCALAR_TYPES.has(t))) {
    // Pick the first non-null type as the canonical scalarType. When the
    // schema declares e.g. `["string","null"]` we already filtered nulls out
    // in normalizeTypes; if multiple primitives are declared (rare), the
    // first wins. The encoder only inspects `scalarType` to decide between
    // typed (`key:=`) and string (`key=`) shapes.
    const first = types[0]!;
    return {
      kind: 'scalar',
      scalarType: first as 'string' | 'number' | 'integer' | 'boolean'
    };
  }

  return null;
}

interface Tier2Leaf {
  name: string;
  kind: Tier1Kind;
  enum?: string[];
  scalarType?: 'string' | 'number' | 'integer' | 'boolean';
}

/**
 * Returns the list of Tier 1 leaves for an object whose direct properties
 * are ALL Tier 1, else `null`. An object with zero properties does not
 * qualify (there's nothing meaningful to flatten).
 */
function tryClassifyTier2(schema: JSONSchema7): Tier2Leaf[] | null {
  const types = normalizeTypes(schema);
  if (!types || types.length !== 1 || types[0] !== 'object') return null;

  const properties = schema.properties;
  if (!properties || typeof properties !== 'object') return null;

  const entries = Object.entries(properties);
  if (entries.length === 0) return null;

  const leaves: Tier2Leaf[] = [];
  for (const [name, rawChild] of entries) {
    if (typeof rawChild === 'boolean') return null;
    const child: JSONSchema7Definition = rawChild;
    if (!isPlainObject(child)) return null;
    if (typeof child.$ref === 'string') return null;
    if (hasUnion(child)) return null;

    const tier1 = tryClassifyTier1(child);
    if (!tier1) return null;

    const leaf: Tier2Leaf = { name, kind: tier1.kind };
    if (tier1.enum) leaf.enum = tier1.enum;
    if (tier1.scalarType) leaf.scalarType = tier1.scalarType;
    leaves.push(leaf);
  }
  return leaves;
}
