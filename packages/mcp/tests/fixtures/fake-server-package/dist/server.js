#!/usr/bin/env node
// Minimal stdio MCP server fixture for bundle integration tests.
// Hand-written (not built from TS) so the fixture has zero build steps.
// Resolves @modelcontextprotocol/sdk via the parent packages/mcp install.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'my-server', version: '0.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'echo',
      description: 'Echo back the input text.',
      inputSchema: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Text to echo' } },
        required: ['text']
      }
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
