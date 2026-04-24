import { describe, expect, it } from 'vitest';
import YAML from 'yaml';
import { emitMcpFrontmatter } from '../src/frontmatter.js';

/**
 * The emitter returns a plain object — these tests snapshot both the structured
 * shape AND the YAML serialization that the host renderer will produce. Snapshot
 * the YAML form so future shape changes are visible in code review.
 */
function asYaml(obj: Record<string, unknown>): string {
  return YAML.stringify(obj).trimEnd();
}

describe('emitMcpFrontmatter', () => {
  it('single-arg case', () => {
    const obj = emitMcpFrontmatter('filesystem', {
      command: 'npx',
      args: ['-y', '@mcp/server-filesystem']
    });
    expect(obj).toEqual({
      mcp: { filesystem: { command: 'npx', args: ['-y', '@mcp/server-filesystem'] } }
    });
    expect(asYaml(obj)).toMatchInlineSnapshot(`
      "mcp:
        filesystem:
          command: npx
          args:
            - -y
            - "@mcp/server-filesystem""
    `);
  });

  it('multi-arg case', () => {
    const obj = emitMcpFrontmatter('filesystem', {
      command: 'npx',
      args: ['-y', '@mcp/server-filesystem', '/tmp', '--readonly']
    });
    expect(asYaml(obj)).toMatchInlineSnapshot(`
      "mcp:
        filesystem:
          command: npx
          args:
            - -y
            - "@mcp/server-filesystem"
            - /tmp
            - --readonly"
    `);
  });

  it('env-set case', () => {
    const obj = emitMcpFrontmatter('myserver', {
      command: 'node',
      args: ['./server.js'],
      env: { FOO: 'bar', BAZ: 'qux' }
    });
    expect(asYaml(obj)).toMatchInlineSnapshot(`
      "mcp:
        myserver:
          command: node
          args:
            - ./server.js
          env:
            FOO: bar
            BAZ: qux"
    `);
  });

  it('bundle-mode style — npx-by-name self reference', () => {
    const obj = emitMcpFrontmatter('my-server', {
      command: 'npx',
      args: ['-y', '@org/my-server']
    });
    expect(asYaml(obj)).toMatchInlineSnapshot(`
      "mcp:
        my-server:
          command: npx
          args:
            - -y
            - "@org/my-server""
    `);
  });

  it('minimal — args/env undefined are omitted from output', () => {
    const obj = emitMcpFrontmatter('plain', {
      command: 'node',
      args: undefined,
      env: undefined
    });
    expect(obj).toEqual({ mcp: { plain: { command: 'node' } } });
    expect(asYaml(obj)).toMatchInlineSnapshot(`
      "mcp:
        plain:
          command: node"
    `);
  });

  it('empty args / empty env are also omitted', () => {
    const obj = emitMcpFrontmatter('plain', {
      command: 'node',
      args: [],
      env: {}
    });
    expect(obj).toEqual({ mcp: { plain: { command: 'node' } } });
  });
});
