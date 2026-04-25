// Public surface for @to-skills/mcp — populated in Phase 2 (foundational) and Phase 3 (US1).
// See specs/001-mcp-extract-bundle/tasks.md for the implementation plan.

// Version — kept for downstream tests that may want to assert against it.
export { PACKAGE_VERSION } from './version.js';

// Adapter plugin interface
export type {
  InvocationTarget,
  InvocationAdapter,
  AdapterRenderContext,
  AdapterFingerprint,
  ParameterPlan
} from './adapter/types.js';
export { loadAdapter, loadAdapterAsync } from './adapter/loader.js';
export { classifyParameters } from './adapter/classify.js';
export { assertFingerprintConsistency, generatedByFrontmatter } from './adapter/fingerprint.js';
export { renderCliParamTable } from './adapter/param-table.js';

// Errors
export { McpError } from './errors.js';
export type { McpErrorCode } from './errors.js';

// Audit rules
export { auditAdapterFreshness } from './audit/freshness.js';

// Extract orchestrator
export { extractMcpSkill } from './extract.js';

// Bundle orchestrator + config types
export { bundleMcpSkill } from './bundle.js';
export type { NormalizedBundleEntry } from './bundle/config.js';

// Config-file batch reader (Phase 7 / US3)
export { readMcpConfigFile } from './config/file-reader.js';

// CLI program builder — exposed so consumers can embed the commander program
// into a parent CLI. The `bin.ts` executable entry point is not exported.
export { buildProgram } from './cli.js';

// Introspection helpers
export { resolveSchema } from './introspect/schema.js';
export { listTools } from './introspect/tools.js';
export { listResources } from './introspect/resources.js';
export { listPrompts } from './introspect/prompts.js';
export type {
  McpClient,
  McpToolListEntry,
  McpResourceListEntry,
  McpPromptListEntry,
  McpPromptArgumentEntry
} from './introspect/client-types.js';

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
  BundleFailure,
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
