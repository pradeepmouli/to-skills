// US5 / FR-H009 — `extractStdio` removes the named stderr listener in the
// `finally` block so bundle mode (which iterates per config entry against the
// same module-scoped mock transport prototype) cannot accumulate listeners
// across calls and trip Node's MaxListenersExceeded warning.
//
// Test strategy: a real `EventEmitter` (`PassThrough`) is reused across 30
// extract calls. After each call, we assert `listenerCount('data') === 0` —
// only an actual `removeListener('data', onStderr)` in `finally` makes that
// invariant hold (anonymous listeners would leak; named listeners with no
// removal would leak; this test catches both regressions).

import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface MockState {
  stderrStream: PassThrough | null;
}

const state: MockState = {
  stderrStream: null
};

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => {
  class Client {
    constructor(
      public readonly clientInfo: unknown,
      public readonly options: unknown
    ) {}
    async connect(_transport: { onclose?: () => void }): Promise<void> {
      // Clean handshake — we want the happy-path finally to fire on every
      // iteration so we can observe the cleanup invariant.
    }
    getServerCapabilities(): Record<string, unknown> {
      return {};
    }
    getServerVersion(): undefined {
      return undefined;
    }
    async listTools(): Promise<{ tools: unknown[] }> {
      return { tools: [] };
    }
    async listResources(): Promise<{ resources: unknown[] }> {
      return { resources: [] };
    }
    async listPrompts(): Promise<{ prompts: unknown[] }> {
      return { prompts: [] };
    }
    async close(): Promise<void> {
      /* noop */
    }
  }
  return { Client };
});

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => {
  class StdioClientTransport {
    onclose?: () => void;
    get stderr(): PassThrough | null {
      return state.stderrStream;
    }
    constructor(public readonly params: unknown) {}
    async close(): Promise<void> {
      /* noop */
    }
  }
  return { StdioClientTransport };
});

import { extractMcpSkill } from '../../src/extract.js';

beforeEach(() => {
  // One shared emitter for all iterations — reproduces the bundle-mode
  // hazard where a long-lived stream accumulates listeners across spawns.
  state.stderrStream = new PassThrough();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const baseStdio = {
  transport: { type: 'stdio' as const, command: 'node', args: ['server.js'] }
};

describe('extractMcpSkill — stderr listener cleanup (US5, FR-H009)', () => {
  it('removes its data listener after each call (no leak across 30 iterations)', async () => {
    const stderr = state.stderrStream!;
    for (let i = 0; i < 30; i++) {
      await extractMcpSkill(baseStdio);
      // After every successful extract, the data listener count MUST be 0.
      // If extract leaks listeners, this number would climb monotonically.
      expect(stderr.listenerCount('data')).toBe(0);
    }
  });
});
