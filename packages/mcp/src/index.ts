// Public surface for @to-skills/mcp — populated in Phase 2 (foundational) and Phase 3 (US1).
// See specs/001-mcp-extract-bundle/tasks.md for the implementation plan.

// Version — kept for downstream tests that may want to assert against it.
export const PACKAGE_VERSION = '0.1.0';

// Adapter plugin interface
export type {
  InvocationTarget,
  InvocationAdapter,
  AdapterRenderContext,
  AdapterFingerprint
} from './adapter/types.js';
export { loadAdapter } from './adapter/loader.js';

// Errors
export { McpError } from './errors.js';
export type { McpErrorCode } from './errors.js';

// Option bags + results (from types.ts)
export type {
  McpTransport,
  McpExtractOptions,
  McpBundleOptions,
  AuditOptions,
  AuditSeverity,
  AuditIssue,
  AuditResult,
  WrittenSkill,
  BundleResult,
  McpServerConfig,
  McpConfigFile
} from './types.js';

// Re-export useful core types for adapter/author ergonomics
export type {
  ExtractedSkill,
  ExtractedResource,
  ExtractedPrompt,
  SkillSetup
} from '@to-skills/core';
