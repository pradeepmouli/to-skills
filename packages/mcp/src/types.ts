import type { ExtractedSkill } from '@to-skills/core';
import type { InvocationTarget } from './adapter/types.js';

export type McpTransport =
  | { type: 'stdio'; command: string; args?: string[]; env?: Record<string, string> }
  | { type: 'http'; url: string; headers?: Record<string, string> };

export interface AuditOptions {
  /** Skip audit entirely (for CI bypass). */
  skip?: boolean;
  /** Exit non-zero on fatal/error severity when true (default: false at extract, true at bundle). */
  failOnError?: boolean;
}

export interface McpExtractOptions {
  /** Transport selection (stdio or HTTP). */
  transport: McpTransport;
  /** Skill name override — defaults to server's serverInfo.name. */
  skillName?: string;
  /** One or more invocation targets. Default: ['mcp-protocol']. */
  invocation?: InvocationTarget | InvocationTarget[];
  /** Maximum tokens per reference file (default 4000). */
  maxTokens?: number;
  /** Emit llms.txt alongside the skill directory. */
  llmsTxt?: boolean;
  /** Emit canonicalized content-identical output (default true). */
  canonicalize?: boolean;
  /** Audit behavior (see AuditOptions). */
  audit?: AuditOptions;
}

export interface McpBundleOptions {
  /** Package root — defaults to process.cwd(). */
  packageRoot?: string;
  /** Output directory override — defaults to <packageRoot>/skills. */
  outDir?: string;
  /** Invocation target(s) — defaults to package.json's to-skills.mcp.invocation, then 'mcp-protocol'. */
  invocation?: InvocationTarget | InvocationTarget[];
  /** Skip audit (CI bypass). */
  skipAudit?: boolean;
}

export type AuditSeverity = 'fatal' | 'error' | 'warning' | 'alert';

export interface AuditIssue {
  /** M1-M99 for MCP audit codes. */
  code: `M${number}`;
  severity: AuditSeverity;
  message: string;
  /** Where the issue was found. */
  location?: { tool?: string; parameter?: string };
}

export interface AuditResult {
  /** Issues found, sorted by severity descending. */
  issues: AuditIssue[];
  /** Highest severity present, or 'none' if no issues. */
  worstSeverity: AuditSeverity | 'none';
}

export interface WrittenSkill {
  /** Absolute path to the skill directory. */
  dir: string;
  /** Files written, relative to dir. */
  files: string[];
  /** Invocation target used. */
  target: InvocationTarget;
  /** Audit result. */
  audit: AuditResult;
}

export interface BundleResult {
  /** One entry per (server × target) combination. Keyed by skill directory name. */
  skills: Record<string, WrittenSkill>;
  /** Warnings about package.json `files` field — not errors. */
  packageJsonWarnings: string[];
}

export interface McpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  disabled?: boolean;
}

export interface McpConfigFile {
  mcpServers: Record<string, McpServerConfig>;
}

/** Re-export for convenience — adapter authors can import everything from `@to-skills/mcp`. */
export type { ExtractedSkill };
