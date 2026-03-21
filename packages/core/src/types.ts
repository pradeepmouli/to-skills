/** Extracted API surface for a single package/module */
export interface ExtractedSkill {
  /** Package or module name */
  name: string;
  /** Package description */
  description: string;
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

/** A rendered skill file ready to write */
export interface RenderedSkill {
  /** File path relative to output dir */
  filename: string;
  /** Full SKILL.md content with frontmatter */
  content: string;
}

/** Options controlling skill rendering */
export interface SkillRenderOptions {
  /** Output directory for skill files */
  outDir: string;
  /** Include usage examples (default: true) */
  includeExamples: boolean;
  /** Include type signatures (default: true) */
  includeSignatures: boolean;
  /** Maximum approximate token budget per skill (default: 4000) */
  maxTokens: number;
  /** Custom name prefix */
  namePrefix: string;
}
