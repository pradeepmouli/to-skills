import { describe, expect, it } from 'vitest';
import type { JSONSchema7 } from 'json-schema';
import { classifyParameters } from '../../src/adapter/classify.js';

describe('classifyParameters', () => {
  it('classifies a scalar string property as Tier 1', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name']
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('name')).toEqual({
      path: ['name'],
      tier: 1,
      type: 'scalar',
      required: true
    });
  });

  it('classifies an enum-typed string property as Tier 1 with enum values', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: { status: { type: 'string', enum: ['active', 'inactive'] } }
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('status')).toEqual({
      path: ['status'],
      tier: 1,
      type: 'enum',
      required: false,
      enum: ['active', 'inactive']
    });
  });

  it('classifies a string array as Tier 1 string-array', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: { tags: { type: 'array', items: { type: 'string' } } }
    };
    const plans = classifyParameters(schema);
    expect(plans.get('tags')).toEqual({
      path: ['tags'],
      tier: 1,
      type: 'string-array',
      required: false
    });
  });

  it('flattens a one-level object with scalar leaves as Tier 2', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          },
          required: ['name']
        }
      },
      required: ['user']
    };
    const plans = classifyParameters(schema);
    // Required-inheritance: every Tier 2 leaf inherits the OUTER property's
    // required flag. `user` is required → every `user.*` leaf is required.
    expect(plans.size).toBe(2);
    expect(plans.get('user.name')).toEqual({
      path: ['user', 'name'],
      tier: 2,
      type: 'scalar',
      required: true
    });
    expect(plans.get('user.age')).toEqual({
      path: ['user', 'age'],
      tier: 2,
      type: 'scalar',
      required: true
    });
  });

  it('Tier 2 leaves are not-required when the outer property is optional', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          },
          required: ['name']
        }
      }
      // no top-level `required` → `user` is optional
    };
    const plans = classifyParameters(schema);
    expect(plans.get('user.name')?.required).toBe(false);
    expect(plans.get('user.age')?.required).toBe(false);
  });

  it('escalates a deeply-nested object to a single Tier 3 entry', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        config: {
          type: 'object',
          properties: {
            db: {
              type: 'object',
              properties: { host: { type: 'string' } }
            }
          }
        }
      }
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('config')).toEqual({
      path: ['config'],
      tier: 3,
      type: 'json',
      required: false
    });
    expect(plans.has('config.db')).toBe(false);
    expect(plans.has('config.db.host')).toBe(false);
  });

  it('classifies an array of objects as Tier 3', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'number' } }
          }
        }
      }
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('items')).toEqual({
      path: ['items'],
      tier: 3,
      type: 'json',
      required: false
    });
  });

  it('treats unresolved $ref as Tier 3 (caller must run resolveSchema first)', () => {
    // NOTE: the classifier intentionally does NOT resolve $ref. That's the
    // job of `resolveSchema` (packages/mcp/src/introspect/schema.ts). An
    // unresolved ref here would risk silent misclassification, so we
    // escalate to Tier 3 instead.
    const schema: JSONSchema7 = {
      type: 'object',
      properties: { user: { $ref: '#/definitions/User' } }
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('user')).toEqual({
      path: ['user'],
      tier: 3,
      type: 'json',
      required: false
    });
  });

  it('returns empty Map for an empty schema', () => {
    const plans = classifyParameters({});
    expect(plans.size).toBe(0);
  });

  it('returns empty Map for a schema with no properties', () => {
    const plans = classifyParameters({ type: 'object' });
    expect(plans.size).toBe(0);
  });

  it('escalates oneOf/anyOf/allOf unions to Tier 3', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        value: { oneOf: [{ type: 'string' }, { type: 'number' }] }
      }
    };
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('value')).toEqual({
      path: ['value'],
      tier: 3,
      type: 'json',
      required: false
    });
  });

  it('marks required vs optional top-level properties correctly', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' }
      },
      required: ['a']
    };
    const plans = classifyParameters(schema);
    expect(plans.get('a')?.required).toBe(true);
    expect(plans.get('b')?.required).toBe(false);
  });

  it('treats boolean schema (true) as Tier 3', () => {
    // JSON Schema permits `true`/`false` as a whole schema. `true` means
    // "match anything"; `false` means "match nothing". Neither carries
    // structural information we can encode as a CLI flag, so Tier 3.
    const schema = {
      type: 'object',
      properties: { enabled: true }
    } as unknown as JSONSchema7;
    const plans = classifyParameters(schema);
    expect(plans.size).toBe(1);
    expect(plans.get('enabled')).toEqual({
      path: ['enabled'],
      tier: 3,
      type: 'json',
      required: false
    });
  });
});
