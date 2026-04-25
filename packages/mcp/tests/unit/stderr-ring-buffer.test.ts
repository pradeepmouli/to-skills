// US4 / FR-H007 — `extractStdio` caps stderr capture at 64 KiB ring-buffer
// style so a chatty server can't OOM the extract process. The
// SERVER_EXITED_EARLY message exposes the captured tail (with a 2 KiB display-
// trim layered on top), so we exercise the cap by streaming distinguishable
// content well above the budget and asserting the rendered tail reflects only
// the most-recent bytes.
//
// Mock strategy mirrors `extract.test.ts`: vi.mock the SDK Client +
// StdioClientTransport so we can install a real `PassThrough` for stderr and
// drive `connect()` / `onclose` deterministically.

import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface MockState {
  earlyExit: boolean;
  stderrStream: PassThrough | null;
}

const state: MockState = {
  earlyExit: false,
  stderrStream: null
};

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => {
  class Client {
    constructor(
      public readonly clientInfo: unknown,
      public readonly options: unknown
    ) {}
    async connect(transport: { onclose?: () => void }): Promise<void> {
      if (state.earlyExit) {
        // Yield a turn so callers can write to stderr BEFORE onclose fires —
        // we want the ring-buffer to be populated when the rejection composes
        // its message.
        setTimeout(() => transport.onclose?.(), 5);
        await new Promise(() => {
          /* never */
        });
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
  state.earlyExit = false;
  state.stderrStream = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const baseStdio = {
  transport: { type: 'stdio' as const, command: 'node', args: ['server.js'] }
};

describe('extractMcpSkill — stderr ring-buffer cap (US4, FR-H007)', () => {
  it('keeps only the most-recent tail when stderr exceeds 64 KiB before exit', async () => {
    // Stream 40 KiB of 'A' followed by 40 KiB of 'B' (80 KiB total > 64 KiB
    // cap). The ring-buffer should drop the leading A's, leaving the rendered
    // message dominated by B's. The 2 KiB display-trim then takes the LAST
    // 2 KiB of that buffer (which is all 'B' for these inputs).
    const stderr = new PassThrough();
    state.stderrStream = stderr;
    state.earlyExit = true;

    const promise = extractMcpSkill(baseStdio);
    // Write synchronously after kickoff — extract subscribes to transport
    // .stderr BEFORE awaiting connect, and connect schedules onclose on a
    // 5 ms timer to give us a window.
    stderr.write(Buffer.alloc(40 * 1024, 'A'));
    stderr.write(Buffer.alloc(40 * 1024, 'B'));

    let caught: unknown;
    try {
      await promise;
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    const msg = (caught as { message: string }).message;

    // Display-trim leaves a leading ellipsis when the captured tail is
    // longer than 2 KiB. The last 2 KiB of the captured buffer is all 'B'.
    expect(msg.startsWith('MCP server process exited before initialize completed.')).toBe(true);
    expect(msg).toMatch(/Server stderr:\n…BBBB/);
    // Tail must NOT contain any 'A' — they should have been dropped by the
    // ring-buffer before the display-trim ran.
    const stderrSection = msg.slice(msg.indexOf('Server stderr:\n') + 'Server stderr:\n'.length);
    expect(stderrSection).not.toMatch(/A/);
    // And the rendered stderr section must be bounded by the 2 KiB display-
    // trim (1 char ellipsis + 2048 chars = 2049). Use a generous upper bound.
    expect(stderrSection.length).toBeLessThanOrEqual(2049);
  });

  it('keeps stderr intact when total bytes stay under 64 KiB', async () => {
    // Write ~10 KiB of 'A' followed by 10 KiB of 'B'. Both should survive the
    // ring-buffer (under cap). The display-trim still picks the trailing 2 KiB
    // because total > 2 KiB. Last 2 KiB is all 'B'.
    const stderr = new PassThrough();
    state.stderrStream = stderr;
    state.earlyExit = true;

    const promise = extractMcpSkill(baseStdio);
    stderr.write(Buffer.alloc(10 * 1024, 'A'));
    stderr.write(Buffer.alloc(10 * 1024, 'B'));

    let caught: unknown;
    try {
      await promise;
    } catch (err) {
      caught = err;
    }
    const msg = (caught as { message: string }).message;
    // Trailing tail still all 'B'.
    expect(msg).toMatch(/Server stderr:\n…BBBB/);
  });
});
