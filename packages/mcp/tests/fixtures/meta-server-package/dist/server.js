#!/usr/bin/env node
// Minimal stdio MCP server fixture exercising `_meta.toSkills` enrichment
// for Phase 9 / US7 integration tests.
//
// Mirrors fake-server-package/dist/server.js but adds:
//  - server-level `_meta.toSkills` (remarks + useWhen + avoidWhen + pitfalls
//    + packageDescription) on the Implementation passed to `new Server()`
//  - per-tool `_meta.toSkills` on a single `compute` tool
//
// Hand-written (not built from TS) so the fixture has zero build steps.
// Resolves @modelcontextprotocol/sdk via the parent packages/mcp install
// (the integration test symlinks that node_modules into the tmpdir copy).
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'meta-server',
    version: '0.0.0',
    // Implementation schema is passthrough — unknown fields like `_meta`
    // travel through validation and arrive intact at `client.getServerVersion()`.
    _meta: {
      toSkills: {
        remarks:
          'meta-server demonstrates _meta.toSkills annotation enrichment — every section below is rendered from server-supplied metadata.',
        packageDescription: 'Demo server for annotation enrichment.',
        useWhen: ['Need to demo annotation enrichment', 'Authoring an MCP server with metadata'],
        avoidWhen: ['Production workloads — this is a demo fixture only'],
        pitfalls: [
          'NEVER ship this fixture to end users',
          'NEVER assume _meta survives outside the toSkills namespace'
        ]
      }
    }
  },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'compute',
      description: 'Compute the answer.',
      inputSchema: {
        type: 'object',
        properties: { input: { type: 'string', description: 'Input value' } },
        required: ['input']
      },
      _meta: {
        toSkills: {
          useWhen: ['Computing a value from a string input'],
          avoidWhen: ['Inputs longer than 1KB — use bulk-compute instead'],
          pitfalls: ['NEVER pass binary data — compute expects UTF-8 text']
        }
      }
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
