export type McpErrorCode =
  | 'UNKNOWN_TARGET'
  | 'ADAPTER_NOT_FOUND'
  | 'TRANSPORT_FAILED'
  | 'INITIALIZE_FAILED'
  | 'PROTOCOL_VERSION_UNSUPPORTED'
  | 'SCHEMA_REF_CYCLE'
  | 'SERVER_EXITED_EARLY'
  | 'MISSING_LAUNCH_COMMAND'
  | 'DUPLICATE_SKILL_NAME';

/**
 * Base error for all @to-skills/mcp failures.
 * The `code` field distinguishes recoverable (user-correctable) from environmental errors.
 */
export class McpError extends Error {
  readonly code: McpErrorCode;
  readonly cause?: unknown;

  constructor(message: string, code: McpErrorCode, cause?: unknown) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    if (cause !== undefined) {
      this.cause = cause;
    }
    // Preserve stack trace where supported.
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, McpError);
    }
  }
}
