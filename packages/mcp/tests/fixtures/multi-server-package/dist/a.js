#!/usr/bin/env node
// Multi-bin MCP server fixture: server A.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'server-a', version: '0.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'tool-a',
      description: 'Tool exclusive to server A.',
      inputSchema: { type: 'object', properties: {}, required: [] }
    }
  ]
}));

await server.connect(new StdioServerTransport());
