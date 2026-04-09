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
  /** Usage examples from @example tags or doc pages */
  examples: string[];
}

export interface ExtractedFunction {
  name: string;
  description: string;
  signature: string;
  parameters: ExtractedParameter[];
  returnType: string;
  examples: string[];
  tags: Record<string, string>;
}

export interface ExtractedClass {
  name: string;
  description: string;
  constructorSignature: string;
  methods: ExtractedFunction[];
  properties: ExtractedProperty[];
  examples: string[];
}

export interface ExtractedType {
  name: string;
  description: string;
  definition: string;
  properties?: ExtractedProperty[];
}

export interface ExtractedEnum {
  name: string;
  description: string;
  members: Array<{ name: string; value: string; description: string }>;
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
}
