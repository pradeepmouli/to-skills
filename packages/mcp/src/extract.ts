// Top-level MCP extraction orchestrator (T034–T037, T049–T050).
//
// `extractMcpSkill(options)` connects to a live MCP server, runs the
// initialize handshake, enumerates tools/resources/prompts (with capability
// gating per FR-007), and returns an `ExtractedSkill` ready for the renderer.
//
// Design notes:
//  - The SDK's `Client` class structurally satisfies the `McpClient`
//    interface we use for introspection helpers, so we pass it directly to
//    `listTools`/`listResources`/`listPrompts` without an adapter wrapper.
//  - Cleanup is enforced via try/finally: `client.close()` runs on both
//    success and failure so the spawned child process can't leak.
//  - Error classification distinguishes spawn failures (ENOENT, EACCES, …)
//    from initialize handshake failures from process-early-exit. See T035.
//  - HTTP transport (Phase 4): StreamableHTTPClientTransport with content-
//    negotiation fallback to SSEClientTransport on 404/405 (T049–T050).

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { ExtractedSkill } from '@to-skills/core';
import { McpError, type McpErrorCode } from './errors.js';
import type { McpClient } from './introspect/client-types.js';
import { listPrompts } from './introspect/prompts.js';
import { listResources } from './introspect/resources.js';
import { listTools } from './introspect/tools.js';
import type { McpExtractOptions } from './types.js';
import { PACKAGE_VERSION } from './version.js';

/**
 * System error codes (Node `SystemError.code`) that indicate the spawn itself
 * failed — the child process never came up. These map to `TRANSPORT_FAILED`.
 * Anything else thrown out of `client.connect()` is treated as initialize
 * handshake failure (`INITIALIZE_FAILED`).
 */
const TRANSPORT_ERROR_CODES = new Set(['ENOENT', 'EACCES', 'EPERM', 'ENOTDIR', 'EBUSY']);

/**
 * Connect to a live MCP server, introspect its surface, and produce an
 * `ExtractedSkill`.
 *
 * For `transport.type === 'stdio'`:
 *   1. Spawn the server via `StdioClientTransport`. `stderr` is piped so a
 *      pre-initialize crash can surface readable diagnostics.
 *   2. Open the SDK `Client` and call `connect()`, which performs the MCP
 *      `initialize` handshake.
 *   3. Race `connect()` against the transport's `onclose` so a process exit
 *      before initialize resolves to `SERVER_EXITED_EARLY` (rather than a
 *      generic INITIALIZE_FAILED).
 *   4. Enumerate tools (always) and — only when the server's capabilities
 *      advertise them — resources and prompts (FR-007).
 *   5. Always call `client.close()` in `finally` so the child process is not
 *      leaked.
 *
 * For `transport.type === 'http'`:
 *   1. Construct `StreamableHTTPClientTransport(new URL(url), { requestInit: { headers } })`.
 *   2. `client.connect()` performs the initialize handshake.
 *   3. If the server responds 404 or 405 to the initial POST, fall back to
 *      `SSEClientTransport` (SDK content-negotiation pattern). A fresh `Client`
 *      is constructed for the retry because the first transport is terminated.
 *   4. Auth failures (401/403) propagate as `INITIALIZE_FAILED` *without*
 *      protocol fallback — the user supplied creds for a specific protocol
 *      path, and switching protocols would silently change the request shape.
 *   5. Capability-gated introspection runs identically to the stdio path.
 *   6. Always `client.close()` in finally.
 *
 * Error mapping (T035):
 * - Stdio process exits before connect resolves → `SERVER_EXITED_EARLY`
 * - Spawn failure (ENOENT/EACCES/EPERM/ENOTDIR/EBUSY) → `TRANSPORT_FAILED`
 * - Invalid HTTP URL → `TRANSPORT_FAILED`
 * - Any other error from `connect()` → `INITIALIZE_FAILED`
 * - Errors from inner introspection helpers that are already `McpError`
 *   instances (e.g. `SCHEMA_REF_CYCLE`) are re-thrown unchanged.
 *
 * Protocol-version compatibility (T037):
 * The `checkProtocolVersion` helper is implemented and unit-tested but not
 * yet wired here, because SDK 1.29.0 does not expose a public getter for the
 * negotiated protocol version. The SDK already validates min/max protocol
 * version internally during `connect()`, so this gap is acceptable.
 *
 * @param options extraction options (transport + skill-name override)
 * @returns ExtractedSkill ready for the renderer
 * @throws {McpError} with one of the codes listed above
 *
 * @public
 */
export async function extractMcpSkill(options: McpExtractOptions): Promise<ExtractedSkill> {
  if (options.transport.type === 'http') {
    return extractHttp(options);
  }
  return extractStdio(options);
}

// ===========================================================================
// Stdio path — spawns a child process, races connect() vs onclose
// ===========================================================================

async function extractStdio(options: McpExtractOptions): Promise<ExtractedSkill> {
  // Narrow the discriminated union; type guard guaranteed by extractMcpSkill.
  if (options.transport.type !== 'stdio') {
    throw new McpError('expected stdio transport', 'TRANSPORT_FAILED');
  }
  const { command, args, env } = options.transport;

  // Pipe stderr so a pre-initialize crash can be surfaced. The transport
  // exposes the stream via `transport.stderr` once start() runs.
  const transport = new StdioClientTransport({
    command,
    args,
    env,
    stderr: 'pipe'
  });

  const client = new Client(
    { name: '@to-skills/mcp', version: PACKAGE_VERSION },
    { capabilities: {} }
  );

  // Capture stderr chunks so a pre-initialize crash can surface readable
  // diagnostics in the SERVER_EXITED_EARLY message. The SDK exposes
  // `transport.stderr` as `Stream | null` — guard against null and tolerate
  // either Buffer or string chunks.
  const stderrChunks: string[] = [];
  const stderrStream = (transport as { stderr?: unknown }).stderr;
  if (stderrStream && typeof stderrStream === 'object' && 'on' in stderrStream) {
    (stderrStream as NodeJS.ReadableStream).on('data', (chunk: Buffer | string) => {
      stderrChunks.push(typeof chunk === 'string' ? chunk : chunk.toString('utf8'));
    });
  }

  /** Compose the SERVER_EXITED_EARLY message including any captured stderr. */
  const buildEarlyExitMessage = (): string => {
    const stderrText = stderrChunks.join('');
    const trimmedStderr = stderrText.length > 2048 ? `…${stderrText.slice(-2048)}` : stderrText;
    return trimmedStderr
      ? `MCP server process exited before initialize completed.\nServer stderr:\n${trimmedStderr}`
      : 'MCP server process exited before initialize completed (no stderr captured).';
  };

  // Promise that rejects when the transport closes before connect resolves.
  // Raced against `client.connect()` so a process-death wins over a generic
  // INITIALIZE_FAILED.
  const exitPromise = new Promise<never>((_, reject) => {
    transport.onclose = () => {
      reject(new McpError(buildEarlyExitMessage(), 'SERVER_EXITED_EARLY'));
    };
  });

  try {
    // Race connect() against the early-exit signal so a process-death
    // beats a generic INITIALIZE_FAILED.
    await Promise.race([client.connect(transport), exitPromise]);
    return await introspect(client, options);
  } catch (err) {
    if (err instanceof McpError) throw err;
    const code = classifyStdioError(err);
    if (code === 'TRANSPORT_FAILED') {
      throw new McpError(messageOf(err), 'TRANSPORT_FAILED', err);
    }
    throw new McpError(messageOf(err), 'INITIALIZE_FAILED', err);
  } finally {
    transport.onclose = undefined;
    try {
      await client.close();
    } catch {
      // Ignore — caller's primary error (if any) is more useful.
    }
  }
}

// ===========================================================================
// HTTP path — StreamableHTTP first, falls back to SSE on 404/405
// ===========================================================================

async function extractHttp(options: McpExtractOptions): Promise<ExtractedSkill> {
  if (options.transport.type !== 'http') {
    throw new McpError('expected http transport', 'TRANSPORT_FAILED');
  }
  const { url: urlStr, headers } = options.transport;

  // Validate URL syntax up front. `new URL()` throws TypeError on bad input;
  // wrap as TRANSPORT_FAILED so callers see a stable error code.
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch (err) {
    throw new McpError(`Invalid URL: ${urlStr}`, 'TRANSPORT_FAILED', err);
  }

  const requestInit: RequestInit = headers ? { headers } : {};

  // First attempt: StreamableHTTP. This is the modern protocol; most servers
  // speak it. SSE-only servers will respond 404 or 405 to the initial POST,
  // signaling we should retry over SSE.
  const httpTransport = new StreamableHTTPClientTransport(url, { requestInit });
  let client = new Client(
    { name: '@to-skills/mcp', version: PACKAGE_VERSION },
    { capabilities: {} }
  );

  try {
    await client.connect(httpTransport);
    return await introspect(client, options);
  } catch (err) {
    // Re-thrown McpError instances (e.g. SCHEMA_REF_CYCLE from inner helpers)
    // pass through unchanged.
    if (err instanceof McpError) {
      await safeClose(client);
      throw err;
    }
    if (shouldFallbackToSSE(err)) {
      // Best-effort cleanup of the failed transport+client before retry.
      await safeClose(client);
      // Fresh client for the retry — the first one's transport is terminated.
      client = new Client(
        { name: '@to-skills/mcp', version: PACKAGE_VERSION },
        { capabilities: {} }
      );
      const sseTransport = new SSEClientTransport(url, { requestInit });
      try {
        await client.connect(sseTransport);
        return await introspect(client, options);
      } catch (sseErr) {
        if (sseErr instanceof McpError) throw sseErr;
        throw new McpError(messageOf(sseErr), 'INITIALIZE_FAILED', sseErr);
      } finally {
        await safeClose(client);
      }
    }
    // Non-fallbackable error: classify and propagate. Auth failures (401/403)
    // land here without protocol fallback — see JSDoc on extractMcpSkill.
    throw new McpError(messageOf(err), 'INITIALIZE_FAILED', err);
  } finally {
    // If the SSE fallback path took over it has its own finally; calling
    // close() again on an already-closed client is a no-op in the SDK.
    await safeClose(client);
  }
}

/**
 * Heuristic: should this connect-time error trigger an SSE fallback?
 *
 * The SDK's `StreamableHTTPError` carries the HTTP status as `.code`. A 404
 * or 405 on the initial POST means the server doesn't speak StreamableHTTP at
 * that path — retry over SSE. Other codes (network failures, 401/403 auth,
 * 5xx) propagate without fallback because:
 *  - 401/403: user supplied creds for a specific protocol; switching protocols
 *    would silently change the request shape.
 *  - 5xx: server error not specific to protocol negotiation.
 *  - network: address/DNS issues affect both protocols equally.
 */
function shouldFallbackToSSE(err: unknown): boolean {
  if (err instanceof Error && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'number' && (code === 404 || code === 405)) return true;
  }
  return false;
}

async function safeClose(c: { close: () => Promise<void> }): Promise<void> {
  try {
    await c.close();
  } catch {
    // Ignore.
  }
}

// ===========================================================================
// Shared post-connect introspection
// ===========================================================================

/**
 * After a successful `client.connect()`, enumerate the server's surface and
 * assemble an ExtractedSkill. Shared between stdio and http paths.
 */
async function introspect(client: Client, options: McpExtractOptions): Promise<ExtractedSkill> {
  // Cast: the SDK Client's listTools/listResources/listPrompts return supersets
  // of our McpClient structural types — assignable at the method-call site,
  // not at the binding site (TS is stricter about `Client` because of its
  // `[x: string]: unknown` index signatures).
  const introspectClient = client as unknown as McpClient;

  const serverInfo = client.getServerVersion();
  const capabilities = client.getServerCapabilities() ?? {};

  // skillName fallback: when the user doesn't supply an explicit override,
  // we kebab-case the server-reported name so a name like
  // "Filesystem MCP Server" becomes "filesystem-mcp-server".
  const transformed = serverInfo?.name ? toKebabSkillName(serverInfo.name) : '';
  const skillName = options.skillName ?? (transformed || 'mcp-server');
  const description =
    (serverInfo as { title?: string } | undefined)?.title ?? serverInfo?.name ?? skillName;

  // tools/list is always called.
  const functions = await listTools(introspectClient);

  // FR-007: only call listResources / listPrompts when the corresponding
  // capability is advertised.
  const resources = capabilities.resources ? await listResources(introspectClient) : undefined;
  const prompts = capabilities.prompts ? await listPrompts(introspectClient) : undefined;

  const skill: ExtractedSkill = {
    name: skillName,
    description,
    functions,
    classes: [],
    types: [],
    enums: [],
    variables: [],
    examples: []
  };
  if (resources !== undefined) skill.resources = resources;
  if (prompts !== undefined) skill.prompts = prompts;
  return skill;
}

/**
 * Decide whether an unknown error from `connect()` (stdio path) is a spawn-
 * level transport failure or an initialize handshake failure.
 *
 * Heuristic: Node `SystemError.code` is in `TRANSPORT_ERROR_CODES` →
 * TRANSPORT_FAILED. Otherwise → INITIALIZE_FAILED.
 */
function classifyStdioError(err: unknown): McpErrorCode {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string' && TRANSPORT_ERROR_CODES.has(code)) {
      return 'TRANSPORT_FAILED';
    }
  }
  return 'INITIALIZE_FAILED';
}

/** Extract a printable message from an unknown error value. */
function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'unknown error';
}

/**
 * Lower-case and kebab-case an arbitrary string into a safe skill identifier.
 *
 * Examples:
 *   "Filesystem MCP Server" → "filesystem-mcp-server"
 *   "GitHub_Tools"          → "github-tools"
 *   "!!!"                   → ""   (caller falls back to 'mcp-server')
 */
function toKebabSkillName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // any non-alphanumeric run → single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
