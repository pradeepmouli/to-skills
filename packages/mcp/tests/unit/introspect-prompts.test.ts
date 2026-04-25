// Unit tests for the listPrompts introspection helper.

import { describe, expect, it } from 'vitest';
import type {
  McpClient,
  McpToolListEntry,
  McpResourceListEntry,
  McpPromptListEntry
} from '../../src/introspect/client-types.js';
import { listPrompts } from '../../src/introspect/prompts.js';

function makeClient(pages: McpPromptListEntry[][]): McpClient {
  return {
    async listTools(_params?: { cursor?: string }) {
      const _entries: McpToolListEntry[] = [];
      return { tools: _entries, nextCursor: undefined };
    },
    async listResources(_params?: { cursor?: string }) {
      const _entries: McpResourceListEntry[] = [];
      return { resources: _entries, nextCursor: undefined };
    },
    async listPrompts(params?: { cursor?: string }) {
      const idx = params?.cursor === undefined ? 0 : Number(params.cursor);
      const prompts = pages[idx] ?? [];
      const hasNext = idx + 1 < pages.length;
      return {
        prompts,
        nextCursor: hasNext ? String(idx + 1) : undefined
      };
    }
  };
}

describe('listPrompts', () => {
  it('paginates and collects all prompts across pages', async () => {
    const client = makeClient([
      [
        {
          name: 'greet',
          description: 'Greet user',
          arguments: [{ name: 'name', description: 'Their name', required: true }]
        }
      ],
      [{ name: 'noargs', description: 'No args' }]
    ]);

    const out = await listPrompts(client);
    expect(out).toHaveLength(2);
    expect(out.map((p) => p.name)).toEqual(['greet', 'noargs']);
  });

  it('defaults missing arguments to [], required to false, description to empty string', async () => {
    const client = makeClient([
      [
        { name: 'a' },
        {
          name: 'b',
          arguments: [{ name: 'x' }, { name: 'y', required: true }]
        }
      ]
    ]);

    const out = await listPrompts(client);
    expect(out[0]).toEqual({ name: 'a', description: '', arguments: [] });
    expect(out[1]!.arguments).toEqual([
      { name: 'x', description: '', required: false },
      { name: 'y', description: '', required: true }
    ]);
  });
});
