/**
 * Reader/validator for the Claude-Desktop-shaped MCP config file (T091).
 *
 * Accepts files matching the `claude_desktop_config.json` / `mcp.json` schema
 * with a single top-level `mcpServers` key. Cursor and a few other clients
 * use slightly different shapes — we deliberately do NOT support those here.
 * `mcpServers` is the canonical name; sticking with it keeps the schema
 * unambiguous and the validation messages actionable.
 *
 * Shape:
 * ```jsonc
 * {
 *   "mcpServers": {
 *     "<entry-name>": {
 *       "command"?: string,
 *       "args"?:    string[],
 *       "env"?:     Record<string, string>,
 *       "url"?:     string,
 *       "headers"?: Record<string, string>,
 *       "disabled"?: boolean
 *     }
 *   }
 * }
 * ```
 *
 * Each entry must specify either `command` (stdio) or `url` (HTTP). Entries
 * with `disabled: true` are kept in the parsed output — skipping happens at
 * extract time so consumers can introspect the full config if needed.
 *
 * Failure modes (all surface as {@link McpError} with code `TRANSPORT_FAILED`):
 *  - File missing (`ENOENT`).
 *  - Malformed JSON (`SyntaxError`); the original error is attached as `cause`.
 *  - Top-level not an object, missing `mcpServers`, or `mcpServers` not an object.
 *  - Per-entry: not an object; field-type mismatches; both `command` and `url`
 *    absent (the entry name is included in the message for actionable diagnosis).
 *
 * @module config/file-reader
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { McpError } from '../errors.js';
import type { ConfigEntry, McpTransport } from '../types.js';

/**
 * Read and validate an `mcp.json` / `claude_desktop_config.json` file.
 *
 * @param configPath — absolute or cwd-relative path to the config file.
 * @returns the validated entries as a frozen `ConfigEntry[]`. Each entry
 *   carries a fully-discriminated {@link McpTransport}, so downstream code
 *   does not need to re-narrow `command`-vs-`url` at runtime.
 * @throws McpError with `code === 'TRANSPORT_FAILED'` on any IO, parse, or
 *   validation failure. The original error (when applicable) is attached as
 *   `cause`.
 *
 * @public
 */
export async function readMcpConfigFile(configPath: string): Promise<readonly ConfigEntry[]> {
  const resolved = path.resolve(configPath);

  let raw: string;
  try {
    raw = await readFile(resolved, 'utf-8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new McpError(`Config file not found: ${resolved}`, 'TRANSPORT_FAILED', err);
    }
    throw new McpError(
      `Failed to read config file ${resolved}: ${messageOf(err)}`,
      'TRANSPORT_FAILED',
      err
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new McpError(
      `Failed to parse config file ${resolved}: ${messageOf(err)}`,
      'TRANSPORT_FAILED',
      err
    );
  }

  return validateConfig(parsed, resolved);
}

/**
 * Validate the parsed JSON against the `mcpServers` schema. Pure function so
 * tests can exercise it directly if needed; not exported (callers should go
 * through {@link readMcpConfigFile}).
 */
function validateConfig(parsed: unknown, sourcePath: string): readonly ConfigEntry[] {
  if (!isPlainObject(parsed)) {
    throw new McpError(
      `Config file ${sourcePath} must contain a JSON object at the top level.`,
      'TRANSPORT_FAILED'
    );
  }
  if (!('mcpServers' in parsed)) {
    throw new McpError(
      `Config file ${sourcePath} is missing required key "mcpServers".`,
      'TRANSPORT_FAILED'
    );
  }
  const servers = parsed['mcpServers'];
  if (!isPlainObject(servers)) {
    throw new McpError(
      `Config file ${sourcePath}: "mcpServers" must be an object, got ${describeType(servers)}.`,
      'TRANSPORT_FAILED'
    );
  }

  const entries: ConfigEntry[] = [];
  for (const [name, entry] of Object.entries(servers)) {
    entries.push(validateEntry(name, entry, sourcePath));
  }

  return entries;
}

/**
 * Validate a single `mcpServers[name]` entry. Accepts the optional fields
 * documented in the module header; rejects unknown types eagerly so the
 * downstream extract pipeline never sees an `args: 5` or similar.
 *
 * Returns a {@link ConfigEntry} with the wire-shape's optional
 * `command`/`url` collapsed into a fully-discriminated `McpTransport`. The
 * one-of-two invariant — every entry MUST set either `command` (stdio) or
 * `url` (HTTP) — is enforced here, so callers get a typed transport without
 * needing runtime narrowing.
 */
function validateEntry(name: string, entry: unknown, sourcePath: string): ConfigEntry {
  if (!isPlainObject(entry)) {
    throw new McpError(
      `Config file ${sourcePath}: entry "${name}" must be an object, got ${describeType(entry)}.`,
      'TRANSPORT_FAILED'
    );
  }

  let command: string | undefined;
  let args: string[] | undefined;
  let env: Record<string, string> | undefined;
  let url: string | undefined;
  let headers: Record<string, string> | undefined;
  let disabled: boolean | undefined;

  if ('command' in entry) {
    const value = entry['command'];
    if (typeof value !== 'string') {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".command must be a string, got ${describeType(value)}.`,
        'TRANSPORT_FAILED'
      );
    }
    command = value;
  }

  if ('args' in entry) {
    const value = entry['args'];
    if (!Array.isArray(value) || !value.every((a) => typeof a === 'string')) {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".args must be a string array.`,
        'TRANSPORT_FAILED'
      );
    }
    args = value as string[];
  }

  if ('env' in entry) {
    const value = entry['env'];
    if (!isStringRecord(value)) {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".env must be a Record<string, string>.`,
        'TRANSPORT_FAILED'
      );
    }
    env = value;
  }

  if ('url' in entry) {
    const value = entry['url'];
    if (typeof value !== 'string') {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".url must be a string, got ${describeType(value)}.`,
        'TRANSPORT_FAILED'
      );
    }
    url = value;
  }

  if ('headers' in entry) {
    const value = entry['headers'];
    if (!isStringRecord(value)) {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".headers must be a Record<string, string>.`,
        'TRANSPORT_FAILED'
      );
    }
    headers = value;
  }

  if ('disabled' in entry) {
    const value = entry['disabled'];
    if (typeof value !== 'boolean') {
      throw new McpError(
        `Config file ${sourcePath}: entry "${name}".disabled must be a boolean, got ${describeType(value)}.`,
        'TRANSPORT_FAILED'
      );
    }
    disabled = value;
  }

  // Build the discriminated transport — the wire shape allows both `command`
  // and `url` to be optional, but the contract requires exactly one. We
  // prefer stdio when `command` is set (mirrors the legacy cli.ts narrowing
  // order); a future extension could reject ambiguous entries that set both,
  // but today we silently prefer stdio to avoid breaking pre-existing files.
  let transport: McpTransport;
  if (command !== undefined) {
    transport = {
      type: 'stdio',
      command,
      ...(args !== undefined ? { args } : {}),
      ...(env !== undefined ? { env } : {})
    };
  } else if (url !== undefined) {
    transport = {
      type: 'http',
      url,
      ...(headers !== undefined ? { headers } : {})
    };
  } else {
    throw new McpError(
      `Config file ${sourcePath}: entry "${name}" must specify either "command" (stdio) or "url" (HTTP).`,
      'TRANSPORT_FAILED'
    );
  }

  return {
    name,
    transport,
    ...(disabled !== undefined ? { disabled } : {})
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every((v) => typeof v === 'string');
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
