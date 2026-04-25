#!/usr/bin/env node
// Edge-case fixture (T112): a server that advertises ONLY resources, no
// tools or prompts. Verifies SKILL.md generation when the tools surface is
// empty — exercise the "zero tools" code path.
//
// Hand-written (no build step) to mirror the other fixtures.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'zero-tools-server', version: '0.0.0' },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

// Empty tools list — the server has none.
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));

// Empty prompts list — the server has none.
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));

// Two static resources so the SKILL.md still has something to render.
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'file:///tmp/notes.txt',
      name: 'Daily notes',
      description: 'Free-form daily notes file.',
      mimeType: 'text/plain'
    },
    {
      uri: 'file:///tmp/config.json',
      name: 'Server config',
      description: 'Effective configuration as JSON.',
      mimeType: 'application/json'
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
