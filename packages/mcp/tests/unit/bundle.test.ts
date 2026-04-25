// Unit tests for the bundle orchestrator (T060a–T060d, T063).
//
// Strategy: vi.mock the heavy collaborators (`extractMcpSkill`, `loadAdapterAsync`)
// so we can drive happy-path / failure-path / multi-server scenarios without
// spawning actual servers. The renderSkill+writeSkills pipeline runs for real
// against tmpdirs so the on-disk layout is exercised end-to-end. Files-field
// warnings are checked against `result.packageJsonWarnings` and the captured
// stderr stream.

import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { ExtractedSkill, InvocationAdapter, RenderedSkill } from '@to-skills/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock state shared across helpers.
type ExtractMockShape = {
  // Records each call so tests can assert order + transport contents.
  calls: Array<{
    command: string;
    args: string[];
    env?: Record<string, string>;
    skillName?: string;
  }>;
  // Per-skillName impl. Defaults to a minimal ExtractedSkill.
  impls: Map<string, () => Promise<ExtractedSkill>>;
};

const extractState: ExtractMockShape = {
  calls: [],
  impls: new Map()
};

vi.mock('../../src/extract.js', () => ({
  extractMcpSkill: vi.fn(
    async (options: {
      transport: { type: 'stdio'; command: string; args?: string[]; env?: Record<string, string> };
      skillName?: string;
    }) => {
      extractState.calls.push({
        command: options.transport.command,
        args: options.transport.args ?? [],
        env: options.transport.env,
        skillName: options.skillName
      });
      const impl = options.skillName ? extractState.impls.get(options.skillName) : undefined;
      if (impl) return impl();
      // Default minimal ExtractedSkill.
      return {
        name: options.skillName ?? 'mcp-server',
        description: 'mock server',
        functions: [],
        classes: [],
        types: [],
        enums: [],
        variables: [],
        examples: []
      };
    }
  )
}));

// Stub adapter — produces deterministic output that exercises writeSkills
// without depending on the real target-mcp-protocol package.
const stubAdapter: InvocationAdapter = {
  target: 'mcp-protocol',
  fingerprint: { adapter: '@stub/adapter', version: '0.0.0' },
  async render(skill, ctx): Promise<RenderedSkill> {
    return {
      skill: {
        filename: `${ctx.skillName}/SKILL.md`,
        content: `---\nname: ${ctx.skillName}\npackage: ${ctx.packageName ?? ''}\n---\n# ${skill.name}\n`,
        tokens: 32
      },
      references: []
    };
  }
};

vi.mock('../../src/adapter/loader.js', () => ({
  loadAdapterAsync: vi.fn(async () => stubAdapter)
}));

// Bring the orchestrator in AFTER mocks are declared.
const { bundleMcpSkill } = await import('../../src/bundle.js');

let workDir: string;

beforeEach(() => {
  workDir = mkdtempSync(path.join(tmpdir(), 'bundle-'));
  extractState.calls.length = 0;
  extractState.impls.clear();
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

function writePkg(contents: unknown): void {
  writeFileSync(path.join(workDir, 'package.json'), JSON.stringify(contents, null, 2), 'utf8');
}

describe('bundleMcpSkill', () => {
  it('propagates config-load failures (no package.json)', async () => {
    await expect(bundleMcpSkill({ packageRoot: workDir })).rejects.toMatchObject({
      name: 'McpError',
      code: 'TRANSPORT_FAILED'
    });
  });

  it('happy path: single-server config writes one skill directory', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: ['./a.js'] }
      }
    });
    const result = await bundleMcpSkill({ packageRoot: workDir });
    expect(result.failures).toEqual({});
    expect(result.skills['my-server']).toBeDefined();
    expect(result.skills['my-server']?.target).toBe('mcp-protocol');
    expect(result.skills['my-server']?.dir).toBe(path.join(workDir, 'skills', 'my-server'));
    // SKILL.md exists with package-name self-reference embedded.
    const skillPath = path.join(workDir, 'skills', 'my-server', 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
    const content = readFileSync(skillPath, 'utf8');
    expect(content).toContain('package: @my/server');
    // Extract was called with the entry's transport.
    expect(extractState.calls).toHaveLength(1);
    expect(extractState.calls[0]).toMatchObject({
      command: 'node',
      args: ['./a.js'],
      skillName: 'my-server'
    });
  });

  it('multi-server: writes one directory per entry independently', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: [
          { skillName: 'server-a', command: 'node', args: ['./a.js'] },
          { skillName: 'server-b', command: 'node', args: ['./b.js'] }
        ]
      }
    });
    const result = await bundleMcpSkill({ packageRoot: workDir });
    expect(Object.keys(result.skills).sort()).toEqual(['server-a', 'server-b']);
    expect(result.failures).toEqual({});
    expect(existsSync(path.join(workDir, 'skills', 'server-a', 'SKILL.md'))).toBe(true);
    expect(existsSync(path.join(workDir, 'skills', 'server-b', 'SKILL.md'))).toBe(true);
  });

  it('records mid-stream extract failure and continues with remaining entries', async () => {
    const { McpError } = await import('../../src/errors.js');
    extractState.impls.set('server-a', async () => {
      throw new McpError('boom', 'INITIALIZE_FAILED');
    });
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: [
          { skillName: 'server-a', command: 'node', args: ['./a.js'] },
          { skillName: 'server-b', command: 'node', args: ['./b.js'] }
        ]
      }
    });
    const result = await bundleMcpSkill({ packageRoot: workDir });
    expect(result.failures['server-a']).toMatchObject({ code: 'INITIALIZE_FAILED' });
    expect(result.skills['server-b']).toBeDefined();
    expect(result.skills['server-a']).toBeUndefined();
  });

  it('warns when package.json files array omits skills/dist', async () => {
    // Pre-create a dist directory so the dist warning fires.
    mkdirSync(path.join(workDir, 'dist'), { recursive: true });
    writePkg({
      name: '@my/server',
      bin: './dist/server.js',
      files: ['README.md'],
      'to-skills': { mcp: { skillName: 'my-server' } }
    });
    const stderr: string[] = [];
    const orig = process.stderr.write.bind(process.stderr);
    // Cast: process.stderr.write has many overloads; the test only writes strings.
    process.stderr.write = ((chunk: string | Uint8Array): boolean => {
      stderr.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
      return true;
    }) as typeof process.stderr.write;
    let result;
    try {
      result = await bundleMcpSkill({ packageRoot: workDir });
    } finally {
      process.stderr.write = orig;
    }
    expect(result.packageJsonWarnings).toEqual([
      expect.stringContaining('"dist"'),
      expect.stringContaining('"skills"')
    ]);
    expect(stderr.join('')).toContain('"skills"');
  });

  it('does not warn when package.json files is absent (implicit-include)', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: ['./a.js'] }
      }
    });
    const result = await bundleMcpSkill({ packageRoot: workDir });
    expect(result.packageJsonWarnings).toEqual([]);
  });

  it('does not warn when package.json files already includes skills', async () => {
    writePkg({
      name: '@my/server',
      files: ['dist', 'skills', 'README.md'],
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: ['./a.js'] }
      }
    });
    const result = await bundleMcpSkill({ packageRoot: workDir });
    expect(result.packageJsonWarnings).toEqual([]);
  });

  it('emits a notice when entry declares multiple invocation targets', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: {
          skillName: 'my-server',
          command: 'node',
          args: ['./a.js'],
          invocation: ['mcp-protocol', 'cli:mcpc']
        }
      }
    });
    const stderr: string[] = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = ((chunk: string | Uint8Array): boolean => {
      stderr.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
      return true;
    }) as typeof process.stderr.write;
    try {
      await bundleMcpSkill({ packageRoot: workDir });
    } finally {
      process.stderr.write = orig;
    }
    expect(stderr.join('')).toContain('renders only the first');
  });
});
