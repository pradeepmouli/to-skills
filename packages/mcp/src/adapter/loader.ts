import { createRequire } from 'node:module';
import type { InvocationTarget, InvocationAdapter } from './types.js';
import { McpError } from '../errors.js';

const require = createRequire(import.meta.url);
const cache = new Map<InvocationTarget, InvocationAdapter>();

/**
 * Resolve an invocation target to its adapter package.
 *
 * Resolution algorithm (per research.md §5):
 * - `mcp-protocol` → `@to-skills/target-mcp-protocol`
 * - `cli:<name>` → tries `@to-skills/target-<name>` first, then `to-skills-target-<name>`
 *
 * The module's default export MUST be an `InvocationAdapter`. Results are cached
 * per-process — calling twice with the same target returns the same adapter instance.
 *
 * @throws McpError with code `UNKNOWN_TARGET` if the target string doesn't match the expected form.
 * @throws McpError with code `ADAPTER_NOT_FOUND` if no candidate package resolves.
 */
export function loadAdapter(target: InvocationTarget): InvocationAdapter {
  const cached = cache.get(target);
  if (cached) return cached;

  const candidates = resolveCandidates(target);

  for (const pkg of candidates) {
    try {
      const mod = require(pkg) as { default?: InvocationAdapter };
      const adapter = mod.default;
      if (!adapter) {
        throw new McpError(`Adapter package '${pkg}' has no default export`, 'ADAPTER_NOT_FOUND');
      }
      cache.set(target, adapter);
      return adapter;
    } catch (err: unknown) {
      // require() throws MODULE_NOT_FOUND when resolution fails; try next candidate.
      if (isModuleNotFoundError(err, pkg)) continue;
      // Re-throw our own McpError (from the no-default-export branch above).
      if (err instanceof McpError) throw err;
      // Other errors (syntax errors in the adapter, etc.) — surface with context.
      throw new McpError(
        `Failed to load adapter package '${pkg}': ${(err as Error).message ?? String(err)}`,
        'ADAPTER_NOT_FOUND',
        err
      );
    }
  }

  throw new McpError(
    `No adapter for target '${target}'. Looked for: ${candidates.join(', ')}.`,
    'ADAPTER_NOT_FOUND'
  );
}

function resolveCandidates(target: InvocationTarget): string[] {
  if (target === 'mcp-protocol') return ['@to-skills/target-mcp-protocol'];
  if (target.startsWith('cli:')) {
    const name = target.slice('cli:'.length);
    if (!name) {
      throw new McpError(
        `Invalid target '${target}' — cli: prefix without a name`,
        'UNKNOWN_TARGET'
      );
    }
    return [`@to-skills/target-${name}`, `to-skills-target-${name}`];
  }
  throw new McpError(`Unknown target form: '${target}'`, 'UNKNOWN_TARGET');
}

function isModuleNotFoundError(err: unknown, pkg: string): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const errObj = err as { code?: string; message?: string };
  if (errObj.code === 'MODULE_NOT_FOUND' || errObj.code === 'ERR_MODULE_NOT_FOUND') return true;
  // Also match the pattern in the error message (some bundlers produce different codes)
  return (
    typeof errObj.message === 'string' && errObj.message.includes(`Cannot find module '${pkg}'`)
  );
}

/**
 * Clear the adapter cache. Exposed for testing.
 * @internal
 */
export function __clearAdapterCache(): void {
  cache.clear();
}
