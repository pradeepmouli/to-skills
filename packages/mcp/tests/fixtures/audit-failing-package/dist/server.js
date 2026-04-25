#!/usr/bin/env node
// Minimal stdio MCP server fixture exercising audit-rule failures.
//
// Hand-written (not built from TS) so the fixture has zero build steps. The
// integration test (audit-failing.test.ts) symlinks the parent packages/mcp
// node_modules so `@modelcontextprotocol/sdk` resolves without an install.
//
// Triggers:
//   - M1 fatal: `compute` tool has empty description
//   - M3 warning: no useWhen anywhere on the server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'audit-failing-server', version: '0.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      // Empty description → M1 fatal severity, which triggers AUDIT_FAILED.
      name: 'compute',
      description: '',
      inputSchema: {
        type: 'object',
        properties: { input: { type: 'string', description: 'Input value' } },
        required: ['input']
      }
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
