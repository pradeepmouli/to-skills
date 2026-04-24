// Unit tests for the `checkProtocolVersion` helper.
//
// Behavior under test (T037):
//  - Silent on undefined / supported versions.
//  - Warn (via injected callback) on a version newer than the SDK's latest.
//  - Throw `McpError('PROTOCOL_VERSION_UNSUPPORTED')` on a version older than
//    the SDK's minimum supported version.

import {
  LATEST_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS
} from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it, vi } from 'vitest';
import { McpError } from '../../src/errors.js';
import { checkProtocolVersion } from '../../src/introspect/protocol-version.js';

describe('checkProtocolVersion', () => {
  it('returns silently when serverVersion is undefined', () => {
    const warn = vi.fn();
    expect(() => checkProtocolVersion(undefined, { warn })).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  it('returns silently when serverVersion is in SUPPORTED_PROTOCOL_VERSIONS', () => {
    const warn = vi.fn();
    for (const v of SUPPORTED_PROTOCOL_VERSIONS) {
      expect(() => checkProtocolVersion(v, { warn })).not.toThrow();
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns via injected callback when version is newer than LATEST_PROTOCOL_VERSION', () => {
    const warn = vi.fn();
    // ISO-like dates: lexicographic compare with a year-9999 string is a
    // safe "definitely newer than current latest" sentinel.
    const futureVersion = '9999-12-31';
    expect(() => checkProtocolVersion(futureVersion, { warn })).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    const message = warn.mock.calls[0]?.[0];
    expect(message).toContain(futureVersion);
    expect(message).toContain(LATEST_PROTOCOL_VERSION);
  });

  it('throws PROTOCOL_VERSION_UNSUPPORTED when version is older than SUPPORTED_PROTOCOL_VERSIONS minimum', () => {
    // Sort lexicographically — the dates in SUPPORTED_PROTOCOL_VERSIONS are
    // ISO-like so sort order matches chronological order.
    const sorted = [...SUPPORTED_PROTOCOL_VERSIONS].sort();
    const minimum = sorted[0];
    expect(minimum).toBeDefined();

    // Same trick as above but a year-1900 date is unambiguously older.
    const ancient = '1900-01-01';
    expect(() => checkProtocolVersion(ancient)).toThrow(McpError);
    try {
      checkProtocolVersion(ancient);
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(McpError);
      expect((err as McpError).code).toBe('PROTOCOL_VERSION_UNSUPPORTED');
      expect((err as McpError).message).toContain(ancient);
      expect((err as McpError).message).toContain(minimum as string);
    }
  });
});
