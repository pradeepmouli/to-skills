/**
 * HTTP-transport extraction tests against an in-process mock server.
 *
 * These are filed under `tests/unit/` (not `tests/integration/`) because the
 * mock server runs in the same process — no external network or subprocess.
 * They run on every default `pnpm test` invocation.
 *
 * Covers (T054, T055, T056):
 * - Happy path: extractMcpSkill produces a skill with the canned tool list.
 * - Auth pass: bearer token forwarded via headers reaches the server.
 * - Auth fail: missing bearer token surfaces as INITIALIZE_FAILED (no fallback).
 * - Unreachable: connect to a closed port surfaces as INITIALIZE_FAILED or
 *   TRANSPORT_FAILED (we accept either since the SDK classification varies).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { McpError } from '../../src/errors.js';
import { extractMcpSkill } from '../../src/extract.js';
import { type MockSseServer, startMockSseServer } from '../fixtures/mock-sse-server.js';

describe('extractMcpSkill — HTTP transport (mock server)', () => {
  let server: MockSseServer | undefined;

  afterEach(async () => {
    if (server) {
      await server.close();
      server = undefined;
    }
  });

  it('happy path: extracts tools over StreamableHTTP', async () => {
    server = await startMockSseServer({
      serverInfo: { name: 'mock-http-server', version: '1.0.0', title: 'Mock HTTP MCP' },
      capabilities: { tools: true },
      tools: [
        { name: 'echo', description: 'Echo back', inputSchema: { type: 'object' } },
        { name: 'now', description: 'Return current time' }
      ]
    });

    const skill = await extractMcpSkill({
      transport: { type: 'http', url: server.url }
    });

    expect(skill.name).toBe('mock-http-server');
    expect(skill.description).toBe('Mock HTTP MCP');
    const fnNames = skill.functions.map((f) => f.name).sort();
    expect(fnNames).toEqual(['echo', 'now']);
  });

  it('auth pass: bearer header reaches the server', async () => {
    server = await startMockSseServer({
      authToken: 'test-token',
      serverInfo: { name: 'authed', version: '1.0.0' },
      capabilities: { tools: true },
      tools: [{ name: 'secure', description: 'Secure tool' }]
    });

    const skill = await extractMcpSkill({
      transport: {
        type: 'http',
        url: server.url,
        headers: { Authorization: 'Bearer test-token' }
      }
    });
    expect(skill.functions).toHaveLength(1);
    expect(skill.functions[0]?.name).toBe('secure');
  });

  it('auth fail: missing bearer surfaces as INITIALIZE_FAILED (no protocol fallback)', async () => {
    server = await startMockSseServer({
      authToken: 'required',
      capabilities: { tools: true }
    });

    await expect(
      extractMcpSkill({ transport: { type: 'http', url: server.url } })
    ).rejects.toMatchObject({
      code: 'INITIALIZE_FAILED'
    });
  });

  it('unreachable: closed port surfaces as INITIALIZE_FAILED or TRANSPORT_FAILED', async () => {
    // Port 1 is reliably refused on localhost across platforms (no listener).
    await expect(
      extractMcpSkill({ transport: { type: 'http', url: 'http://127.0.0.1:1/' } })
    ).rejects.toSatisfy(
      (err) =>
        err instanceof McpError &&
        (err.code === 'INITIALIZE_FAILED' || err.code === 'TRANSPORT_FAILED')
    );
  });
});
