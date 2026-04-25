// Unit tests for the listResources introspection helper.

import { describe, expect, it } from 'vitest';
import type {
  McpClient,
  McpToolListEntry,
  McpResourceListEntry,
  McpPromptListEntry
} from '../../src/introspect/client-types.js';
import { listResources } from '../../src/introspect/resources.js';

function makeClient(pages: McpResourceListEntry[][]): McpClient {
  return {
    async listTools(_params?: { cursor?: string }) {
      const _entries: McpToolListEntry[] = [];
      return { tools: _entries, nextCursor: undefined };
    },
    async listResources(params?: { cursor?: string }) {
      const idx = params?.cursor === undefined ? 0 : Number(params.cursor);
      const resources = pages[idx] ?? [];
      const hasNext = idx + 1 < pages.length;
      return {
        resources,
        nextCursor: hasNext ? String(idx + 1) : undefined
      };
    },
    async listPrompts(_params?: { cursor?: string }) {
      const _entries: McpPromptListEntry[] = [];
      return { prompts: _entries, nextCursor: undefined };
    }
  };
}

describe('listResources', () => {
  it('paginates and collects all resources across pages', async () => {
    const client = makeClient([
      [
        { uri: 'file:///a', name: 'A', description: 'first', mimeType: 'text/plain' },
        { uri: 'file:///b', name: 'B' }
      ],
      [{ uri: 'file:///c', name: 'C', mimeType: 'application/json' }]
    ]);

    const out = await listResources(client);
    expect(out).toHaveLength(3);
    expect(out.map((r) => r.uri)).toEqual(['file:///a', 'file:///b', 'file:///c']);
  });

  it('passes mimeType through and defaults missing description to empty string', async () => {
    const client = makeClient([
      [
        { uri: 'file:///a', name: 'A', mimeType: 'text/plain' },
        { uri: 'file:///b', name: 'B', description: 'has description' }
      ]
    ]);

    const out = await listResources(client);
    expect(out[0]).toEqual({
      uri: 'file:///a',
      name: 'A',
      description: '',
      mimeType: 'text/plain'
    });
    expect(out[1]).toEqual({
      uri: 'file:///b',
      name: 'B',
      description: 'has description'
    });
    // mimeType absent on entry b → omitted on output (not stringified to undefined).
    expect('mimeType' in out[1]!).toBe(false);
  });
});
