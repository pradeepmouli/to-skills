// Protocol-version compatibility check for MCP servers.
//
// The SDK already validates min/max protocol version internally during
// `client.connect()`, so this helper is belt-and-suspenders. It exists
// primarily so that `extract.ts` can:
//   1. Surface a friendly McpError with our own `PROTOCOL_VERSION_UNSUPPORTED`
//      code when the SDK rejects a too-old server.
//   2. Emit a warning (capturable in tests via dependency injection) when a
//      server reports a version newer than the SDK's latest known.
//
// NOTE: Wiring this helper to the negotiated protocol version at runtime is
// blocked on SDK 1.29.0 not exposing a public getter for the negotiated
// version (only `getServerVersion()` exists, which returns the server's
// `Implementation { name, version, title? }` — not the protocol version).
// `extract.ts` documents this gap; the helper is fully unit-tested so once
// the SDK exposes (e.g.) `getNegotiatedProtocolVersion()`, integration is a
// one-liner.

import {
  LATEST_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS
} from '@modelcontextprotocol/sdk/types.js';
import { McpError } from '../errors.js';

/**
 * Options controlling `checkProtocolVersion` behavior.
 *
 * @public
 */
export interface CheckProtocolVersionOptions {
  /**
   * Override for `console.warn`. Tests pass a spy here to capture the
   * warning message instead of polluting test output.
   */
  warn?: (message: string) => void;
}

/**
 * Verify that an MCP server's reported protocol version is compatible with
 * the SDK version this package is built against.
 *
 * Behavior:
 * - `serverVersion === undefined` → no-op (some servers omit; SDK defaults
 *   handle that case at connect time).
 * - `serverVersion ∈ SUPPORTED_PROTOCOL_VERSIONS` → no-op (happy path).
 * - `serverVersion > LATEST_PROTOCOL_VERSION` (lexicographic compare on the
 *   ISO-date-style version strings, which is correct because they sort by
 *   chronological order) → emit a warning via `opts.warn ?? console.warn` and
 *   continue. We do NOT throw because the server may simply use newer fields
 *   we don't recognize, and partial extraction is better than none.
 * - `serverVersion < SUPPORTED_PROTOCOL_VERSIONS[0]` (lexicographic) → throw
 *   `McpError('PROTOCOL_VERSION_UNSUPPORTED')`. There is no `cause` here
 *   because this error is synthesized, not wrapping anything.
 *
 * The version comparison uses lexicographic string ordering. MCP protocol
 * versions are ISO-8601-ish dates (`YYYY-MM-DD`), so lex order matches
 * chronological order.
 *
 * @param serverVersion the protocol version the server advertised during
 *   `initialize`, or `undefined` if not advertised
 * @param opts optional dependency-injection seam for the warn callback
 * @throws {McpError} with code `PROTOCOL_VERSION_UNSUPPORTED` when the server
 *   version is older than the SDK's minimum supported version
 *
 * @public
 */
export function checkProtocolVersion(
  serverVersion: string | undefined,
  opts?: CheckProtocolVersionOptions
): void {
  if (serverVersion === undefined) return;

  if (SUPPORTED_PROTOCOL_VERSIONS.includes(serverVersion)) return;

  // Sort to find the minimum supported version. The SDK exports the array
  // unsorted in some versions, so we don't assume index 0 is the minimum.
  const sortedSupported = [...SUPPORTED_PROTOCOL_VERSIONS].sort();
  const minimum = sortedSupported[0];

  if (serverVersion > LATEST_PROTOCOL_VERSION) {
    const warn = opts?.warn ?? console.warn;
    warn(
      `MCP server reported protocol version "${serverVersion}" which is newer than the SDK's latest known version "${LATEST_PROTOCOL_VERSION}". Continuing — extraction may produce incomplete output if the server uses newer fields.`
    );
    return;
  }

  if (minimum !== undefined && serverVersion < minimum) {
    throw new McpError(
      `Server reported protocol version "${serverVersion}" which is older than the SDK's minimum supported version "${minimum}".`,
      'PROTOCOL_VERSION_UNSUPPORTED'
    );
  }

  // Defensive: version is between min and max but not in the explicit list.
  // Treat as compatible (no-op) since the SDK already accepted it at connect.
}
