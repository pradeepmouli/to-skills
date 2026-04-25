#!/usr/bin/env node
// Multi-bin MCP server fixture: server B.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'server-b', version: '0.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'tool-b',
      description: 'Tool exclusive to server B.',
      inputSchema: { type: 'object', properties: {}, required: [] }
    }
  ]
}));

await server.connect(new StdioServerTransport());
