import type { ExtractedConfigSurface } from './config-types.js';

/** Extracted API surface for a single package/module */
export interface ExtractedSkill {
  /** Package or module name */
  name: string;
  /** Package description */
  description: string;
  /** License identifier (e.g. "MIT", "Apache-2.0") */
  license?: string;
  /** Keywords from package.json — used to enrich trigger descriptions */
  keywords?: string[];
  /** Repository URL */
  repository?: string;
  /** Author name */
  author?: string;
  /** Package description from package.json or README intro — used for SKILL.md description and body */
  packageDescription?: string;
  /** Extended remarks from @packageDocumentation @remarks — architectural context, trade-offs, mental models */
  remarks?: string;
  /** Additional documentation content (from projectDocuments, README, etc.) */
  documents?: ExtractedDocument[];
  /** Exported functions */
  functions: ExtractedFunction[];
  /** Exported classes */
  classes: ExtractedClass[];
  /** Exported interfaces and type aliases */
  types: ExtractedType[];
  /** Exported enums */
  enums: ExtractedEnum[];
  /** Exported variables and constants */
  variables: ExtractedVariable[];
  /** Usage examples from @example tags or doc pages */
  examples: string[];
  /** Aggregated @useWhen triggers from all exports */
  useWhen?: string[];
  /** Aggregated @useWhen with source info for decision tables */
  useWhenSources?: Array<{
    text: string;
    sourceName: string;
    sourceKind: string;
    sourceDescription?: string;
  }>;
  /** Aggregated @avoidWhen triggers from all exports */
  avoidWhen?: string[];
  /** Aggregated @avoidWhen with source info for decision tables */
  avoidWhenSources?: Array<{
    text: string;
    sourceName: string;
    sourceKind: string;
    sourceDescription?: string;
  }>;
  /** Aggregated @never from all exports */
  pitfalls?: string[];
  /** Configuration surfaces (CLI commands, config files) */
  configSurfaces?: ExtractedConfigSurface[];
  /** Features section from README — rendered inline in SKILL.md */
  readmeFeatures?: string;
  /** Troubleshooting section from README — rendered inline in SKILL.md */
  readmeTroubleshooting?: string;
  /** MCP resources (empty/absent for non-MCP extractors). */
  resources?: ExtractedResource[];
  /** MCP prompts (empty/absent for non-MCP extractors). */
  prompts?: ExtractedPrompt[];
  /** Setup instructions emitted when the invocation target is CLI-based. */
  setup?: SkillSetup;
}

/** An MCP-exposed resource (static or templated URI, readable by the agent harness). */
export interface ExtractedResource {
  /** Canonical URI. MAY contain URI Template expressions per RFC 6570 for parameterized resources. */
  uri: string;
  /** Short human-readable name */
  name: string;
  /** Prose description (single paragraph) */
  description: string;
  /** MIME type of the resource content. Optional — not all servers advertise it. */
  mimeType?: string;
  /** Source module for grouping (rarely meaningful for resources; present for IR parity). */
  sourceModule?: string;
}

/** An MCP-exposed prompt (a named, argument-templated prompt the agent may request). */
export interface ExtractedPrompt {
  /** Short identifier used by MCP `prompts/get` requests. */
  name: string;
  /** Prose description of what the prompt produces. */
  description: string;
  /** Typed argument schema (may be empty). */
  arguments: ExtractedPromptArgument[];
  /** Present for IR parity with functions/classes; rarely meaningful for prompts. */
  sourceModule?: string;
}

export interface ExtractedPromptArgument {
  name: string;
  description: string;
  /**
   * Whether the argument is mandatory on `prompts/get` invocation.
   * MCP prompt arguments are strings in the current spec; a typed `type` field
   * may be added in a future revision without breaking callers.
   */
  required: boolean;
}

/** Setup instructions emitted into SKILL.md body when the invocation target is CLI-based. */
export interface SkillSetup {
  /** Human-prose install instructions (markdown-safe). */
  install: string;
  /** One-time configuration step the consumer must run (e.g. `mcpc connect @server`). */
  oneTimeSetup?: string;
  /** Adapter fingerprint for freshness checks (per FR-IT-012). */
  generatedBy: AdapterFingerprint;
}

/** Identifies the adapter that rendered a skill — used for freshness audits. */
export interface AdapterFingerprint {
  /** npm package name of the adapter (e.g. "@to-skills/target-mcpc") */
  adapter: string;
  /** Adapter package semver version */
  version: string;
  /** Semver range of the target CLI the adapter was written against (e.g. "mcpc@^2.1") */
  targetCliRange?: string;
}

export interface ExtractedFunction {
  name: string;
  description: string;
  signature: string;
  parameters: ExtractedParameter[];
  returnType: string;
  /** Prose description from @returns JSDoc tag */
  returnsDescription?: string;
  /** Extended description from @remarks tag — expert knowledge beyond summary */
  remarks?: string;
  examples: string[];
  tags: Record<string, string>;
  /** Additional overload signatures (if function has multiple signatures) */
  overloads?: string[];
  /** Source module name derived from file path (e.g. "renderer", "tokens") */
  sourceModule?: string;
  /** Category for grouping (from @category tag) */
  category?: string;
}

export interface ExtractedClass {
  name: string;
  description: string;
  constructorSignature: string;
  methods: ExtractedFunction[];
  properties: ExtractedProperty[];
  examples: string[];
  /** JSDoc block tags (e.g. @deprecated, @since, @useWhen, @never) */
  tags: Record<string, string>;
  /** Base class name (from `extends`) */
  extends?: string;
  /** Implemented interface names (from `implements`) */
  implements?: string[];
  /** Source module name derived from file path (e.g. "renderer", "tokens") */
  sourceModule?: string;
  /** Category for grouping (from @category tag) */
  category?: string;
}

export interface ExtractedType {
  name: string;
  description: string;
  definition: string;
  properties?: ExtractedProperty[];
  /** Source module name derived from file path (e.g. "renderer", "tokens") */
  sourceModule?: string;
  /** Category for grouping (from @category tag) */
  category?: string;
}

export interface ExtractedEnum {
  name: string;
  description: string;
  members: Array<{ name: string; value: string; description: string }>;
  /** Source module name derived from file path (e.g. "renderer", "tokens") */
  sourceModule?: string;
  /** Category for grouping (from @category tag) */
  category?: string;
}

export interface ExtractedVariable {
  name: string;
  type: string;
  description: string;
  isConst: boolean;
  /** Source module name derived from file path (e.g. "renderer", "tokens") */
  sourceModule?: string;
  /** Category for grouping (from @category tag) */
  category?: string;
}

export interface ExtractedParameter {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ExtractedProperty {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

export interface ExtractedDocument {
  /** Document title */
  title: string;
  /** Document content (markdown) */
  content: string;
  /** Category from frontmatter — used to disambiguate duplicate titles and organize into subdirs */
  category?: string;
  /** Frontmatter description — used for category summaries in SKILL.md */
  description?: string;
  /** True when this doc has children (is a parent/overview doc) */
  isParent?: boolean;
  /** API class/type names from {@link} tags in "## API reference" sections — enables bidirectional linking */
  apiRefs?: string[];
}

/** A single rendered file */
export interface RenderedFile {
  /** File path relative to output dir */
  filename: string;
  /** File content */
  content: string;
  /** Estimated token count */
  tokens?: number;
}

/** A rendered skill with progressive disclosure structure */
export interface RenderedSkill {
  /** The SKILL.md discovery file (lean — frontmatter, overview, quick ref) */
  skill: RenderedFile;
  /** Reference files loaded on demand (functions, classes, types, etc.) */
  references: RenderedFile[];
}

/** @deprecated Use RenderedFile instead */
export type RenderedSkillLegacy = RenderedFile;

/** Options controlling skill rendering */
export interface SkillRenderOptions {
  /** Output directory for skill files (default: ".github/skills") */
  outDir: string;
  /** Include usage examples (default: true) */
  includeExamples: boolean;
  /** Include type signatures (default: true) */
  includeSignatures: boolean;
  /** Maximum approximate token budget per skill (default: 4000) */
  maxTokens: number;
  /** Custom name prefix */
  namePrefix: string;
  /** License to include in frontmatter (default: read from package.json) */
  license: string;
  /** Invocation adapter that selects rendering dialect. Defaults to the mcp-protocol adapter. */
  invocation?: InvocationAdapter;
  /**
   * Forwarded into `AdapterRenderContext.launchCommand` for invocation adapters.
   * Used in extract mode where the host has determined how to launch a third-party
   * MCP server (e.g. via stdio transport configuration). Mutually informative with
   * `invocationPackageName`: when both are set, adapters typically prefer the
   * package-name-driven launch (npx-by-name) for self-referential bundle output.
   */
  invocationLaunchCommand?: {
    command: string;
    args?: readonly string[];
    env?: Readonly<Record<string, string>>;
  };
  /**
   * Forwarded into `AdapterRenderContext.packageName` for bundle-mode self-reference.
   * Set by `@to-skills/mcp` bundle commands so the emitted skill instructs MCP-native
   * harnesses to launch the server via `npx <packageName>`.
   */
  invocationPackageName?: string;
  /**
   * Forwarded into `AdapterRenderContext.httpEndpoint` for HTTP-transport extract mode.
   *
   * @remarks
   * When the host extracts a skill from an HTTP-based MCP server (`--url ...`),
   * there is no shell launch command — adapters should emit a `{ url, headers }`
   * shape instead of `{ command, args, env }`. Set by `@to-skills/mcp`'s extract
   * pipeline. Mutually exclusive with `invocationLaunchCommand` in practice; the
   * MCP adapter prefers `httpEndpoint` when both are present.
   */
  invocationHttpEndpoint?: {
    url: string;
    headers?: Readonly<Record<string, string>>;
  };
  /**
   * Additional frontmatter keys merged into SKILL.md by the default renderer path.
   *
   * @remarks
   * Used by invocation adapters that delegate body rendering to core's default
   * path (e.g. `McpProtocolAdapter` injecting `mcp:` frontmatter). Existing keys
   * (`name`, `description`, `license`) take precedence — collisions silently keep
   * the existing value. The canonicalization pass alphabetizes keys after merge.
   */
  additionalFrontmatter?: Readonly<Record<string, unknown>>;
}

// NOTE: Forward-declared for backward-compatible extension point.
// The concrete adapter lives in @to-skills/mcp; core has no runtime dependency on it.
// Core owns the structural contract; @to-skills/mcp will re-export for ergonomics.
/**
 * Pluggable rendering strategy — selects the SKILL.md dialect emitted for an `ExtractedSkill`.
 *
 * Built-in implementations (shipped from `@to-skills/mcp`'s target packages) include
 * `mcp-protocol` (emits `mcp:` frontmatter for MCP-native agent harnesses) and
 * `cli:*` targets (emit shell-command skills that route through an external MCP CLI).
 */
export interface InvocationAdapter {
  readonly target: string;
  readonly fingerprint: AdapterFingerprint;
  render(skill: ExtractedSkill, ctx: AdapterRenderContext): Promise<RenderedSkill>;
}

export interface AdapterRenderContext {
  /** Bundle-mode self-reference — the package name the emitted skill should invoke via `npx`; `undefined` in extract mode where the skill is for a third-party server. */
  packageName?: string;
  /** Output directory name chosen by the caller (e.g. "filesystem", "my-server"). */
  skillName: string;
  /** Token budget ceiling per reference file — adapters should stay under this but the host will truncate if exceeded. */
  maxTokens: number;
  /** When `true` (default), the host runs a canonicalization pass on the adapter's output so re-runs produce content-identical files. */
  canonicalize: boolean;
  /**
   * Launch command threaded through from the host (extract mode); `undefined` in
   * bundle mode where `packageName` is used. Adapters may treat `packageName` as
   * higher priority than `launchCommand` when both are present (e.g. preferring
   * `npx <packageName>` for self-referential bundle output).
   */
  launchCommand?: {
    command: string;
    args?: readonly string[];
    env?: Readonly<Record<string, string>>;
  };
  /**
   * HTTP endpoint threaded through from the host (HTTP-extract mode); `undefined`
   * for stdio-extract or bundle modes.
   *
   * @remarks
   * Adapters that emit MCP-launch frontmatter prefer this over `launchCommand`
   * (and `packageName` wins over both for bundle self-reference). When set,
   * the adapter should emit a `{ url, headers }` shape rather than a
   * `{ command, args, env }` shape, because there is no subprocess to spawn.
   */
  httpEndpoint?: {
    url: string;
    headers?: Readonly<Record<string, string>>;
  };
}
