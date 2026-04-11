/**
 * A single section extracted from a markdown document, corresponding to one
 * heading and all content that follows it until the next heading.
 */
export interface ParsedSection {
  /** The text content of the section heading, without the `#` prefix characters */
  heading: string;
  /** The heading depth: 1 for `#`, 2 for `##`, 3 for `###`, etc. */
  level: number;
  /** All prose content within the section, excluding code blocks */
  content: string;
  /** Source text of every fenced code block found within the section */
  codeBlocks: string[];
}

/**
 * A fully parsed markdown document with structured metadata and sections.
 */
export interface ParsedMarkdownDoc {
  /** Parsed YAML/TOML front-matter key-value pairs, or `undefined` if the document has none */
  frontmatter: Record<string, unknown> | undefined;
  /** Document title, typically derived from the first `#`-level heading or front-matter */
  title: string;
  /** Short description of the document, or `undefined` if none could be determined */
  description: string | undefined;
  /** File path to the document relative to the docs root directory */
  relativePath: string;
  /** Ordered list of sections extracted from the document body */
  sections: ParsedSection[];
  /** Original unmodified markdown source text of the document */
  rawContent: string;
  /** Zero-based sort order used to sequence this document within a collection */
  order: number;
}

/**
 * Configuration options that control how a docs directory is scanned and which
 * markdown files are included in the extraction.
 */
export interface DocsExtractionOptions {
  /** Absolute or relative path to the directory containing markdown documentation files */
  docsDir: string;
  /** Glob pattern selecting files to include; when `undefined` all `.md` files are included */
  include: string | undefined;
  /** Glob patterns for files to exclude from extraction; `undefined` means no exclusions */
  exclude: string[] | undefined;
  /** Maximum number of documents to return; `undefined` means no limit */
  maxDocs: number | undefined;
}
