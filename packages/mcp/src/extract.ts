// Top-level MCP extraction orchestrator (T034–T037).
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
//  - HTTP transport is stubbed for Phase 4.

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
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
 * For `transport.type === 'http'`: throws `TRANSPORT_FAILED` with a
 * "not yet implemented" message. HTTP is Phase 4.
 *
 * Error mapping (T035):
 * - Process exits before connect resolves → `SERVER_EXITED_EARLY`
 * - Spawn failure (ENOENT/EACCES/EPERM/ENOTDIR/EBUSY) → `TRANSPORT_FAILED`
 * - Any other error from `connect()` → `INITIALIZE_FAILED`
 * - Errors from inner introspection helpers that are already `McpError`
 *   instances (e.g. `SCHEMA_REF_CYCLE`) are re-thrown unchanged.
 *
 * Protocol-version compatibility (T037):
 * The `checkProtocolVersion` helper is implemented and unit-tested but not
 * yet wired here, because SDK 1.29.0 does not expose a public getter for the
 * negotiated protocol version (only `getServerVersion()` which returns the
 * server's `Implementation`, not the protocol version). The SDK already
 * validates min/max protocol version internally during `connect()`, so this
 * gap is acceptable. TODO: once the SDK exposes (e.g.)
 * `getNegotiatedProtocolVersion()`, call `checkProtocolVersion(...)` here.
 *
 * @param options extraction options (transport + skill-name override)
 * @returns ExtractedSkill ready for the renderer
 * @throws {McpError} with one of the codes listed above
 *
 * @public
 */
export async function extractMcpSkill(options: McpExtractOptions): Promise<ExtractedSkill> {
  if (options.transport.type === 'http') {
    throw new McpError('HTTP transport not yet implemented (Phase 4)', 'TRANSPORT_FAILED');
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
    // beats a generic INITIALIZE_FAILED. If connect() succeeds normally,
    // exitPromise stays pending and is garbage-collected; we clear the
    // onclose handler in finally so any later process exit is silent
    // (the SDK closes itself when client.close() runs).
    await Promise.race([client.connect(transport), exitPromise]);

    // Cast: the SDK Client's listTools/listResources/listPrompts return
    // supersets of our McpClient structural types — assignable at the
    // method-call site, not at the binding site (TS is stricter about
    // `Client` because of its `[x: string]: unknown` index signatures).
    const introspectClient = client as unknown as McpClient;

    // serverInfo is populated after successful connect. Use it to default
    // the skill's name and description.
    const serverInfo = client.getServerVersion();
    const capabilities = client.getServerCapabilities() ?? {};

    // skillName fallback: when the user doesn't supply an explicit override,
    // we kebab-case the server-reported name so a name like
    // "Filesystem MCP Server" becomes "filesystem-mcp-server" (a safe skill
    // identifier). The user's explicit `options.skillName` is authoritative
    // and passes through unchanged.
    const transformed = serverInfo?.name ? toKebabSkillName(serverInfo.name) : '';
    const skillName = options.skillName ?? (transformed || 'mcp-server');
    const description =
      // serverInfo.title is the human-readable variant per MCP spec.
      (serverInfo as { title?: string } | undefined)?.title ?? serverInfo?.name ?? skillName;

    // tools/list is always called — even when the server doesn't advertise
    // a `tools` capability, the introspection helper handles an empty list
    // gracefully and the renderer copes with `functions: []`.
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
  } catch (err) {
    // Already-classified McpError → re-throw unchanged.
    if (err instanceof McpError) throw err;

    // Spawn-level system errors (ENOENT etc.) → TRANSPORT_FAILED.
    const code = classifyError(err);
    if (code === 'TRANSPORT_FAILED') {
      throw new McpError(messageOf(err), 'TRANSPORT_FAILED', err);
    }

    // Process-early-exit is handled exclusively by the Promise.race against
    // `exitPromise` above (which rejects with an already-classified McpError
    // and is short-circuited by the `instanceof McpError` branch). We do not
    // re-classify a generic Error here as SERVER_EXITED_EARLY, because a
    // legitimate INITIALIZE_FAILED followed by a delayed onclose would then
    // be mis-labelled.
    throw new McpError(messageOf(err), 'INITIALIZE_FAILED', err);
  } finally {
    // Clear the onclose handler so a late close (after we've decided to
    // tear down) doesn't reject anything.
    transport.onclose = undefined;
    // Best-effort cleanup. close() cascades from client to transport, so
    // we prefer client.close() and let any errors during teardown go to
    // the void — we already have a more meaningful error to report.
    try {
      await client.close();
    } catch {
      // Ignore — caller's primary error (if any) is more useful.
    }
  }
}

/**
 * Decide whether an unknown error from `connect()` is a spawn-level
 * transport failure or an initialize handshake failure.
 *
 * Heuristic: Node `SystemError.code` is in `TRANSPORT_ERROR_CODES` →
 * TRANSPORT_FAILED. Otherwise → INITIALIZE_FAILED.
 */
function classifyError(err: unknown): McpErrorCode {
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
