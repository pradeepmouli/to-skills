#!/usr/bin/env node
// Edge-case fixture (T113): a server with a tool whose inputSchema contains
// a recursive `$ref` cycle (a `Node` type that references itself via
// `children`). The introspector should normalize this to McpError(SCHEMA_REF_CYCLE),
// the tool extractor should retain the tool with `tags.schemaError = 'true'`,
// and audit M2 should surface a warning.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'cycle-server', version: '0.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      // Healthy tool — must still render normally.
      name: 'ping',
      description: 'Round-trip a string to verify connectivity.',
      inputSchema: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Echo payload' } },
        required: ['text']
      }
    },
    {
      // Cyclic schema: `Node` references itself through `children`.
      // The dereferencer raises SCHEMA_REF_CYCLE; the tool persists in the IR
      // with `schemaError` tag set.
      name: 'walk_tree',
      description: 'Walk a self-referential tree structure.',
      inputSchema: {
        type: 'object',
        definitions: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              children: { type: 'array', items: { $ref: '#/definitions/Node' } }
            }
          }
        },
        properties: {
          root: { $ref: '#/definitions/Node' }
        },
        required: ['root']
      }
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
