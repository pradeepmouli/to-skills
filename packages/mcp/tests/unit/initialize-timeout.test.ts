// US4 / FR-H008 — `extractStdio` enforces an initialize-handshake timeout via
// `Promise.race`. Default 30 s; caller-overridable via
// `transport.initializeTimeoutMs`; `<= 0` disables the race. We exercise:
//   1. A 5 s timeout firing when `connect()` never resolves.
//   2. `initializeTimeoutMs: 0` disabling the race so a slow-but-finite mock
//      connect resolves normally.
//
// `vi.useFakeTimers()` is critical here: real timers would either make the
// test sluggish (5 s wait) or flaky (timing-dependent). We restore real timers
// in `afterEach` so subsequent suites aren't affected.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { McpError } from '../../src/errors.js';

interface MockState {
  // When set, connect() blocks forever (used to trigger the timeout race).
  hangConnect: boolean;
  // When set, connect() resolves after this many ms (drives the
  // "timeout disabled" test against fake timers).
  slowConnectMs: number;
}

const state: MockState = {
  hangConnect: false,
  slowConnectMs: 0
};

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => {
  class Client {
    constructor(
      public readonly clientInfo: unknown,
      public readonly options: unknown
    ) {}
    async connect(_transport: { onclose?: () => void }): Promise<void> {
      if (state.hangConnect) {
        await new Promise(() => {
          /* never */
        });
        return;
      }
      if (state.slowConnectMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, state.slowConnectMs));
      }
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
    get stderr(): null {
      return null;
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
  state.hangConnect = false;
  state.slowConnectMs = 0;
});

afterEach(() => {
  // Restore real timers so other suites aren't poisoned.
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const baseStdio = {
  type: 'stdio' as const,
  command: 'node',
  args: ['server.js']
};

describe('extractMcpSkill — initialize timeout (US4, FR-H008)', () => {
  it('rejects with INITIALIZE_FAILED when the handshake exceeds initializeTimeoutMs', async () => {
    vi.useFakeTimers();
    state.hangConnect = true;

    const promise = extractMcpSkill({
      transport: { ...baseStdio, initializeTimeoutMs: 5000 }
    });
    // Attach the rejection handler BEFORE advancing timers — otherwise the
    // unhandled-rejection guard rails fire before vitest sees `.rejects`.
    const assertion = expect(promise).rejects.toMatchObject({
      code: 'INITIALIZE_FAILED',
      message: expect.stringMatching(/timed out after 5000ms/)
    });
    await vi.advanceTimersByTimeAsync(5001);
    await assertion;
  });

  it('produces an McpError instance (not a generic Error) on timeout', async () => {
    vi.useFakeTimers();
    state.hangConnect = true;

    const promise = extractMcpSkill({
      transport: { ...baseStdio, initializeTimeoutMs: 1000 }
    });
    const assertion = expect(promise).rejects.toBeInstanceOf(McpError);
    await vi.advanceTimersByTimeAsync(1001);
    await assertion;
  });

  it('does NOT race the timeout when initializeTimeoutMs is 0 (caller opt-out)', async () => {
    // Fake timers so we can pin "real" wall time at 0 ms — the slow connect
    // resolves via the SAME fake clock. With timeout disabled, extract waits
    // on connect() forever (in fake-time terms). 6 s of fake time is well past
    // the 30 s default; if the default were silently still in effect, the
    // timeout would fire. We assert it does NOT.
    vi.useFakeTimers();
    state.slowConnectMs = 6000;

    const promise = extractMcpSkill({
      transport: { ...baseStdio, initializeTimeoutMs: 0 }
    });
    // Advance past the slow-connect delay; connect() resolves and extract
    // proceeds to introspection, which our mock satisfies trivially.
    await vi.advanceTimersByTimeAsync(6001);
    const skill = await promise;
    expect(skill.functions).toEqual([]);
  });
});
