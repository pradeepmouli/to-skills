import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { InvocationAdapter, InvocationTarget } from '../../src/adapter/types.js';
import { __clearAdapterCache, loadAdapter } from '../../src/adapter/loader.js';
import { McpError } from '../../src/errors.js';

/**
 * The loader uses `createRequire(import.meta.url)` → Node's CommonJS `require`.
 * `vi.mock` only hooks ESM `import` resolution, not `require`. So to inject
 * mock adapter packages we monkey-patch `Module.prototype.require` once, then
 * per-test set entries in an `overrides` map.
 */
type ModuleProto = {
  require: (this: unknown, id: string) => unknown;
};

const overrides = new Map<string, unknown>();
let installed = false;

async function installRequireInterceptor(): Promise<void> {
  if (installed) return;
  const nodeModule = (await import('node:module')).default as unknown as {
    prototype: ModuleProto;
  };
  const original = nodeModule.prototype.require;
  nodeModule.prototype.require = function patched(this: unknown, id: string): unknown {
    if (overrides.has(id)) return overrides.get(id);
    return original.call(this, id);
  };
  installed = true;
}

function makeMockAdapter(target: InvocationTarget, adapterPackageName: string): InvocationAdapter {
  return {
    target,
    fingerprint: { adapter: adapterPackageName, version: '0.1.0' },
    render: async () => ({
      skill: { filename: 'SKILL.md', content: '' },
      references: []
    })
  };
}

describe('loadAdapter', () => {
  beforeAll(async () => {
    await installRequireInterceptor();
  });

  beforeEach(() => {
    __clearAdapterCache();
    overrides.clear();
    overrides.set('@to-skills/target-mcp-protocol', {
      default: makeMockAdapter('mcp-protocol', '@to-skills/target-mcp-protocol')
    });
    overrides.set('@to-skills/target-mcpc', {
      default: makeMockAdapter('cli:mcpc', '@to-skills/target-mcpc')
    });
  });

  it('resolves mcp-protocol to @to-skills/target-mcp-protocol default export', () => {
    const adapter = loadAdapter('mcp-protocol');
    expect(adapter.target).toBe('mcp-protocol');
    expect(adapter.fingerprint.adapter).toBe('@to-skills/target-mcp-protocol');
    expect(typeof adapter.render).toBe('function');
  });

  it('resolves cli:mcpc to scoped @to-skills/target-mcpc first', () => {
    const adapter = loadAdapter('cli:mcpc');
    expect(adapter.target).toBe('cli:mcpc');
    expect(adapter.fingerprint.adapter).toBe('@to-skills/target-mcpc');
  });

  it('throws ADAPTER_NOT_FOUND when neither scoped nor unscoped package resolves', () => {
    try {
      loadAdapter('cli:nonexistent-xyz-never');
      throw new Error('expected loadAdapter to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(McpError);
      const mcpErr = err as McpError;
      expect(mcpErr.code).toBe('ADAPTER_NOT_FOUND');
      expect(mcpErr.message).toContain('@to-skills/target-nonexistent-xyz-never');
      expect(mcpErr.message).toContain('to-skills-target-nonexistent-xyz-never');
    }
  });

  it('throws UNKNOWN_TARGET for a garbage target string', () => {
    try {
      loadAdapter('garbage' as unknown as InvocationTarget);
      throw new Error('expected loadAdapter to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(McpError);
      expect((err as McpError).code).toBe('UNKNOWN_TARGET');
    }
  });

  it('throws UNKNOWN_TARGET for cli: with empty name', () => {
    try {
      loadAdapter('cli:' as InvocationTarget);
      throw new Error('expected loadAdapter to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(McpError);
      expect((err as McpError).code).toBe('UNKNOWN_TARGET');
    }
  });

  it('caches resolved adapter per-process — two calls return the same instance', () => {
    const a = loadAdapter('mcp-protocol');
    const b = loadAdapter('mcp-protocol');
    expect(a).toBe(b);
  });
});
