// Unit tests for the bundle-mode config reader (T057, T058, T059).
//
// Each test materializes a small package.json into a tmpdir and calls
// readBundleConfig(packageRoot). We use real filesystem rather than fs mocks
// because the implementation uses fs/promises.readFile and the cost of a
// per-test tmpdir is negligible; this also exercises path.resolve for the
// bin-derivation case.

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { McpError } from '../../src/errors.js';
import { readBundleConfig } from '../../src/bundle/config.js';

let workDir: string;

beforeEach(() => {
  workDir = mkdtempSync(path.join(tmpdir(), 'bundle-config-'));
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

function writePkg(contents: unknown): void {
  writeFileSync(path.join(workDir, 'package.json'), JSON.stringify(contents, null, 2), 'utf8');
}

describe('readBundleConfig', () => {
  it('normalizes a single-server object into a one-element array', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: ['./dist/server.js'] }
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      skillName: 'my-server',
      command: 'node',
      args: ['./dist/server.js'],
      invocation: ['mcp-protocol']
    });
  });

  it('preserves order for an array of servers', async () => {
    writePkg({
      'to-skills': {
        mcp: [
          { skillName: 'server-a', command: 'node', args: ['./a.js'] },
          { skillName: 'server-b', command: 'node', args: ['./b.js'] }
        ]
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries.map((e) => e.skillName)).toEqual(['server-a', 'server-b']);
  });

  it('derives command/args from a single-bin string', async () => {
    writePkg({
      name: '@my/server',
      bin: './dist/server.js',
      'to-skills': { mcp: { skillName: 'my-server' } }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.command).toBe('node');
    // resolveBinPath() resolves relative paths against packageRoot
    expect(entries[0]?.args).toEqual([path.resolve(workDir, './dist/server.js')]);
  });

  it('derives command/args from a single-key bin object', async () => {
    writePkg({
      name: '@my/server',
      bin: { 'my-server': './dist/server.js' },
      'to-skills': { mcp: { skillName: 'my-server' } }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.command).toBe('node');
    expect(entries[0]?.args).toEqual([path.resolve(workDir, './dist/server.js')]);
  });

  it('throws MISSING_LAUNCH_COMMAND for multi-bin without explicit command', async () => {
    writePkg({
      name: '@my/server',
      bin: { 'server-a': './a.js', 'server-b': './b.js' },
      'to-skills': { mcp: { skillName: 'my-server' } }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      name: 'McpError',
      code: 'MISSING_LAUNCH_COMMAND'
    });
  });

  it('throws MISSING_LAUNCH_COMMAND when no command and no bin', async () => {
    writePkg({
      name: '@my/server',
      'to-skills': { mcp: { skillName: 'my-server' } }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'MISSING_LAUNCH_COMMAND'
    });
  });

  it('rejects skillName that violates the kebab pattern', async () => {
    writePkg({
      'to-skills': {
        mcp: { skillName: 'My_Server', command: 'node', args: ['./a.js'] }
      }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      name: 'McpError',
      code: 'TRANSPORT_FAILED'
    });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/skillName/);
  });

  it('detects duplicate skillName across entries', async () => {
    writePkg({
      'to-skills': {
        mcp: [
          { skillName: 'dup', command: 'node', args: ['./a.js'] },
          { skillName: 'dup', command: 'node', args: ['./b.js'] }
        ]
      }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'DUPLICATE_SKILL_NAME'
    });
  });

  it('normalizes string invocation into a one-element array', async () => {
    writePkg({
      'to-skills': {
        mcp: {
          skillName: 'my-server',
          command: 'node',
          args: ['./a.js'],
          invocation: 'cli:mcpc'
        }
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.invocation).toEqual(['cli:mcpc']);
  });

  it('preserves array invocation', async () => {
    writePkg({
      'to-skills': {
        mcp: {
          skillName: 'my-server',
          command: 'node',
          args: ['./a.js'],
          invocation: ['mcp-protocol', 'cli:mcpc']
        }
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.invocation).toEqual(['mcp-protocol', 'cli:mcpc']);
  });

  it('defaults invocation to [mcp-protocol] when omitted', async () => {
    writePkg({
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: ['./a.js'] }
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.invocation).toEqual(['mcp-protocol']);
  });

  it('rejects invocation strings that do not match the target pattern', async () => {
    writePkg({
      'to-skills': {
        mcp: {
          skillName: 'my-server',
          command: 'node',
          args: ['./a.js'],
          invocation: 'rest-over-http' // not 'mcp-protocol' nor 'cli:*'
        }
      }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'TRANSPORT_FAILED'
    });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/invocation/);
  });

  it('throws when package.json is absent', async () => {
    // No package.json written.
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      name: 'McpError',
      code: 'TRANSPORT_FAILED'
    });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/package\.json not found/);
  });

  it('throws when to-skills section is absent (distinct from missing mcp field)', async () => {
    writePkg({ name: '@my/server' });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      name: 'McpError',
      code: 'TRANSPORT_FAILED'
    });
    // Specific message: "to-skills section is missing" — distinguishes the
    // case from a present-but-empty to-skills object.
    await expect(readBundleConfig(workDir)).rejects.toThrow(/to-skills section is missing/);
  });

  it('throws when to-skills.mcp field is absent (with to-skills wrapper present)', async () => {
    writePkg({ name: '@my/server', 'to-skills': {} });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'TRANSPORT_FAILED'
    });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/to-skills\.mcp field is required/);
  });

  it('treats explicit null for to-skills.mcp as absent (not an empty entry)', async () => {
    writePkg({ name: '@my/server', 'to-skills': { mcp: null } });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'TRANSPORT_FAILED'
    });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/to-skills\.mcp field is required/);
  });

  it('treats explicit null for to-skills wrapper as absent', async () => {
    writePkg({ name: '@my/server', 'to-skills': null });
    await expect(readBundleConfig(workDir)).rejects.toThrow(/to-skills section is missing/);
  });

  it('preserves user-provided env on the entry', async () => {
    writePkg({
      'to-skills': {
        mcp: {
          skillName: 'my-server',
          command: 'node',
          args: ['./a.js'],
          env: { API_KEY: 'xyz' }
        }
      }
    });
    const entries = await readBundleConfig(workDir);
    expect(entries[0]?.env).toEqual({ API_KEY: 'xyz' });
  });

  it('throws on malformed JSON', async () => {
    writeFileSync(path.join(workDir, 'package.json'), '{ this is not json', 'utf8');
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'TRANSPORT_FAILED'
    });
  });

  it('throws on non-string args', async () => {
    writePkg({
      'to-skills': {
        mcp: { skillName: 'my-server', command: 'node', args: [42] }
      }
    });
    await expect(readBundleConfig(workDir)).rejects.toMatchObject({
      code: 'TRANSPORT_FAILED'
    });
  });

  // Sanity check on the McpError instanceof — guards against a regression where
  // we accidentally throw a plain Error.
  it('always throws McpError instances on validation failure', async () => {
    writePkg({ 'to-skills': { mcp: { skillName: '!!bad' } } });
    try {
      await readBundleConfig(workDir);
      expect.fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(McpError);
    }
  });
});
