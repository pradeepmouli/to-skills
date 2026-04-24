import { describe, expect, it } from 'vitest';
import YAML from 'yaml';
import type { AdapterRenderContext, ExtractedSkill } from '@to-skills/core';
import { McpError } from '@to-skills/mcp';
import { McpProtocolAdapter } from '../src/render.js';

const baseSkill: ExtractedSkill = {
  name: 'my-server',
  description: 'A test MCP server',
  functions: [
    {
      name: 'doThing',
      description: 'Does the thing',
      signature: 'doThing(input: string): void',
      parameters: [{ name: 'input', type: 'string', description: '', optional: false }],
      returnType: 'void',
      examples: [],
      tags: {}
    }
  ],
  classes: [],
  types: [],
  enums: [],
  variables: [],
  examples: []
};

function makeCtx(overrides: Partial<AdapterRenderContext> = {}): AdapterRenderContext {
  return {
    skillName: 'my-server',
    maxTokens: 4000,
    canonicalize: true,
    ...overrides
  };
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('no frontmatter');
  return YAML.parse(m[1]!) as Record<string, unknown>;
}

describe('McpProtocolAdapter', () => {
  const adapter = new McpProtocolAdapter();

  it('exposes target and fingerprint', () => {
    expect(adapter.target).toBe('mcp-protocol');
    expect(adapter.fingerprint.adapter).toBe('@to-skills/target-mcp-protocol');
    expect(adapter.fingerprint.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('extract mode — ctx.launchCommand is used verbatim', async () => {
    const launchCommand = {
      command: 'npx',
      args: ['-y', '@mcp/server-filesystem', '/tmp'] as const
    };
    const out = await adapter.render(
      baseSkill,
      makeCtx({ launchCommand: { command: launchCommand.command, args: [...launchCommand.args] } })
    );

    expect(out.skill.content.startsWith('---\n')).toBe(true);
    const fm = parseFrontmatter(out.skill.content) as { mcp: Record<string, unknown> };
    expect(fm.mcp).toBeDefined();
    expect((fm.mcp as Record<string, unknown>)['my-server']).toEqual({
      command: 'npx',
      args: ['-y', '@mcp/server-filesystem', '/tmp']
    });
  });

  it('emits references/functions.md from the IR', async () => {
    const out = await adapter.render(
      baseSkill,
      makeCtx({ launchCommand: { command: 'node', args: ['./server.js'] } })
    );
    const fnFile = out.references.find((f) => f.filename === 'my-server/references/functions.md');
    expect(fnFile).toBeDefined();
    expect(fnFile!.content).toContain('doThing');
  });

  it('emits references/resources.md when the IR has resources', async () => {
    const out = await adapter.render(
      {
        ...baseSkill,
        resources: [
          { uri: 'file:///x', name: 'X', description: 'a resource', mimeType: 'text/plain' }
        ]
      },
      makeCtx({ launchCommand: { command: 'node', args: ['./server.js'] } })
    );
    const resFile = out.references.find((f) => f.filename === 'my-server/references/resources.md');
    expect(resFile).toBeDefined();
    expect(resFile!.content).toContain('## X');
    expect(resFile!.content).toContain('text/plain');
  });

  it('emits references/prompts.md when the IR has prompts', async () => {
    const out = await adapter.render(
      {
        ...baseSkill,
        prompts: [
          {
            name: 'summarize',
            description: 'Summarize the input',
            arguments: [{ name: 'topic', required: true, description: 'topic to cover' }]
          }
        ]
      },
      makeCtx({ launchCommand: { command: 'node', args: ['./server.js'] } })
    );
    const pFile = out.references.find((f) => f.filename === 'my-server/references/prompts.md');
    expect(pFile).toBeDefined();
    expect(pFile!.content).toContain('## summarize');
    expect(pFile!.content).toContain('| topic | yes | topic to cover |');
  });

  it('bundle mode — packageName produces npx-by-name self reference', async () => {
    const out = await adapter.render(baseSkill, makeCtx({ packageName: '@org/my-server' }));
    const fm = parseFrontmatter(out.skill.content) as { mcp: Record<string, unknown> };
    const inner = (fm.mcp as Record<string, unknown>)['my-server'] as {
      command: string;
      args: string[];
    };
    expect(inner.command).toBe('npx');
    expect(inner.args).toEqual(['-y', '@org/my-server']);
  });

  it('bundle mode wins — packageName + launchCommand both set, packageName takes precedence', async () => {
    const out = await adapter.render(
      baseSkill,
      makeCtx({
        packageName: '@org/my-server',
        launchCommand: { command: 'node', args: ['./local.js'] }
      })
    );
    const fm = parseFrontmatter(out.skill.content) as { mcp: Record<string, unknown> };
    const inner = (fm.mcp as Record<string, unknown>)['my-server'] as {
      command: string;
      args: string[];
    };
    expect(inner.command).toBe('npx');
    expect(inner.args).toEqual(['-y', '@org/my-server']);
  });

  it('throws McpError(MISSING_LAUNCH_COMMAND) when neither packageName nor launchCommand is set', async () => {
    const promise = adapter.render(baseSkill, makeCtx());
    await expect(promise).rejects.toBeInstanceOf(McpError);
    await expect(promise).rejects.toMatchObject({ code: 'MISSING_LAUNCH_COMMAND' });
    await expect(promise).rejects.toThrow(/neither/);
  });
});
