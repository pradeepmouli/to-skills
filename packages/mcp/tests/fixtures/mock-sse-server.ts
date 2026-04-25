/**
 * Test-only mock MCP HTTP server (StreamableHTTP-flavored).
 *
 * Listens on `127.0.0.1:0` (random port), speaks just enough JSON-RPC to
 * complete an `initialize` handshake and respond to `tools/list` /
 * `resources/list` / `prompts/list`. NOT a production server — it ignores
 * session IDs, doesn't implement SSE, and only handles the request shapes
 * `extractMcpSkill` actually issues.
 *
 * Usage:
 * ```ts
 * const server = await startMockSseServer({ tools: [...] });
 * try {
 *   await extractMcpSkill({ transport: { type: 'http', url: server.url } });
 * } finally {
 *   await server.close();
 * }
 * ```
 *
 * @internal
 */
import { type IncomingMessage, type ServerResponse, createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface MockSseServer {
  /** Base URL including scheme + host + port + path. */
  readonly url: string;
  /** Stop listening and resolve once the socket is closed. */
  readonly close: () => Promise<void>;
}

export interface MockToolDescriptor {
  name: string;
  description: string;
  inputSchema?: unknown;
}

export interface MockSseServerOptions {
  /** Server-advertised capabilities. Default: { tools: {} }. */
  capabilities?: {
    tools?: boolean | Record<string, unknown>;
    resources?: boolean | Record<string, unknown>;
    prompts?: boolean | Record<string, unknown>;
  };
  /**
   * When set, requests must carry `Authorization: Bearer <authToken>`.
   * Otherwise the server returns 401 with an empty body.
   */
  authToken?: string;
  serverInfo?: { name: string; title?: string; version?: string };
  tools?: MockToolDescriptor[];
  /**
   * Force the StreamableHTTP path to fail with a given HTTP status to test
   * fallback / failure paths. When set, all POST requests respond with
   * this status (default behavior is 200).
   */
  forceStatus?: number;
}

const DEFAULT_PROTOCOL_VERSION = '2025-06-18';

/**
 * Start a mock MCP HTTP server. Resolves once the server is listening.
 */
export async function startMockSseServer(
  options: MockSseServerOptions = {}
): Promise<MockSseServer> {
  const tools: MockToolDescriptor[] = options.tools ?? [
    { name: 'echo', description: 'Echo input back', inputSchema: { type: 'object' } }
  ];
  const capabilities = options.capabilities ?? { tools: true };
  const serverInfo = options.serverInfo ?? { name: 'mock-mcp', version: '0.0.0' };

  const server = createServer((req, res) => {
    handleRequest(req, res, { tools, capabilities, serverInfo, options }).catch((err) => {
      // Test fixtures should be loud about unexpected errors.
      // eslint-disable-next-line no-console
      console.error('mock-sse-server error', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end();
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  const addr = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${addr.port}/mcp`;

  return {
    url,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      })
  };
}

interface HandlerCtx {
  tools: MockToolDescriptor[];
  capabilities: NonNullable<MockSseServerOptions['capabilities']>;
  serverInfo: NonNullable<MockSseServerOptions['serverInfo']>;
  options: MockSseServerOptions;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: HandlerCtx
): Promise<void> {
  // Auth gate. The SDK's StreamableHTTPClientTransport surfaces non-2xx
  // responses as StreamableHTTPError(.code = status), which our extract.ts
  // classifies as INITIALIZE_FAILED (no protocol fallback for 401/403).
  if (ctx.options.authToken !== undefined) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${ctx.options.authToken}`) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }
  }

  if (ctx.options.forceStatus !== undefined && req.method === 'POST') {
    res.statusCode = ctx.options.forceStatus;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }

  const body = await readBody(req);
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.statusCode = 400;
    res.end('Bad JSON');
    return;
  }

  // The SDK may batch messages — accept either a single object or an array.
  const messages = Array.isArray(parsed) ? parsed : [parsed];
  const responses: unknown[] = [];

  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null) continue;
    const m = msg as { id?: unknown; method?: string };
    // Notifications (no id) — no response.
    if (m.id === undefined) continue;

    switch (m.method) {
      case 'initialize':
        responses.push({
          jsonrpc: '2.0',
          id: m.id,
          result: {
            protocolVersion: DEFAULT_PROTOCOL_VERSION,
            serverInfo: ctx.serverInfo,
            capabilities: normalizeCapabilities(ctx.capabilities)
          }
        });
        break;
      case 'tools/list':
        responses.push({
          jsonrpc: '2.0',
          id: m.id,
          result: {
            // SDK validates each tool has an object inputSchema; default empty
            // object when the fixture caller didn't supply one.
            tools: ctx.tools.map((t) => ({
              ...t,
              inputSchema: t.inputSchema ?? { type: 'object' }
            }))
          }
        });
        break;
      case 'resources/list':
        responses.push({
          jsonrpc: '2.0',
          id: m.id,
          result: { resources: [] }
        });
        break;
      case 'prompts/list':
        responses.push({
          jsonrpc: '2.0',
          id: m.id,
          result: { prompts: [] }
        });
        break;
      default:
        responses.push({
          jsonrpc: '2.0',
          id: m.id,
          error: { code: -32601, message: `Method not found: ${m.method ?? '<missing>'}` }
        });
    }
  }

  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  if (responses.length === 0) {
    // No request requiring a response (e.g. only notifications).
    res.statusCode = 202;
    res.end();
    return;
  }
  // Match the SDK's expectation: when one request was sent, return one object;
  // when multiple, return an array.
  res.end(JSON.stringify(responses.length === 1 ? responses[0] : responses));
}

function normalizeCapabilities(
  caps: NonNullable<MockSseServerOptions['capabilities']>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (caps.tools) out['tools'] = typeof caps.tools === 'object' ? caps.tools : {};
  if (caps.resources) out['resources'] = typeof caps.resources === 'object' ? caps.resources : {};
  if (caps.prompts) out['prompts'] = typeof caps.prompts === 'object' ? caps.prompts : {};
  return out;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
