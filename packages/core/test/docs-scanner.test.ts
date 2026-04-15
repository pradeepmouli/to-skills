import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { scanDocs, docsToExtractedDocuments, scanRootDocs } from '../src/docs-scanner.js';
import type { DocsExtractionOptions } from '../src/markdown-types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function opts(
  docsDir: string,
  overrides: Partial<DocsExtractionOptions> = {}
): DocsExtractionOptions {
  return { docsDir, include: undefined, exclude: undefined, maxDocs: undefined, ...overrides };
}

function write(dir: string, relPath: string, content: string): void {
  const full = join(dir, relPath);
  const parts = relPath.split('/');
  if (parts.length > 1) {
    mkdirSync(join(dir, ...parts.slice(0, -1)), { recursive: true });
  }
  writeFileSync(full, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `docs-scanner-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('scanDocs – basic scanning', () => {
  it('scans directory and returns parsed docs', () => {
    write(tmpDir, 'intro.md', '# Introduction\n\nWelcome to the docs.');
    write(tmpDir, 'guide.md', '# Guide\n\nHow to use it.');

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(2);
    const titles = docs.map((d) => d.title);
    expect(titles).toContain('Introduction');
    expect(titles).toContain('Guide');
  });

  it('returns empty array for non-existent directory', () => {
    const docs = scanDocs(opts(join(tmpDir, 'does-not-exist')));
    expect(docs).toEqual([]);
  });

  it('includes .mdx files', () => {
    write(tmpDir, 'page.mdx', '# MDX Page\n\nContent here.');

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('MDX Page');
  });

  it('exposes rawContent from the file', () => {
    const content = '# Hello\n\nSome content.';
    write(tmpDir, 'hello.md', content);

    const docs = scanDocs(opts(tmpDir));

    expect(docs[0]?.rawContent).toBe(content);
  });
});

describe('scanDocs – ordering by sidebar_position', () => {
  it('orders by sidebar_position frontmatter', () => {
    write(tmpDir, 'beta.md', '---\nsidebar_position: 2\n---\n# Beta');
    write(tmpDir, 'alpha.md', '---\nsidebar_position: 1\n---\n# Alpha');
    write(tmpDir, 'gamma.md', '---\nsidebar_position: 3\n---\n# Gamma');

    const docs = scanDocs(opts(tmpDir));

    expect(docs.map((d) => d.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('falls back to alphabetical title sort when order values are equal', () => {
    write(tmpDir, 'zebra.md', '---\nsidebar_position: 1\n---\n# Zebra');
    write(tmpDir, 'apple.md', '---\nsidebar_position: 1\n---\n# Apple');

    const docs = scanDocs(opts(tmpDir));

    expect(docs[0]?.title).toBe('Apple');
    expect(docs[1]?.title).toBe('Zebra');
  });
});

describe('scanDocs – ordering by numeric filename prefix', () => {
  it('orders by numeric filename prefix', () => {
    write(tmpDir, '03-third.md', '# Third');
    write(tmpDir, '01-first.md', '# First');
    write(tmpDir, '02-second.md', '# Second');

    const docs = scanDocs(opts(tmpDir));

    expect(docs.map((d) => d.title)).toEqual(['First', 'Second', 'Third']);
  });
});

describe('scanDocs – subdirectory scanning', () => {
  it('scans subdirectories recursively', () => {
    write(tmpDir, 'top.md', '# Top Level');
    write(tmpDir, 'guide/getting-started.md', '# Getting Started');
    write(tmpDir, 'guide/advanced/deep.md', '# Deep Topic');

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(3);
    const titles = docs.map((d) => d.title);
    expect(titles).toContain('Top Level');
    expect(titles).toContain('Getting Started');
    expect(titles).toContain('Deep Topic');
  });

  it('sets relativePath correctly for nested files', () => {
    write(tmpDir, 'guide/intro.md', '# Intro');

    const docs = scanDocs(opts(tmpDir));

    expect(docs[0]?.relativePath).toBe('guide/intro.md');
  });
});

describe('scanDocs – exclude patterns', () => {
  it('excludes api/ directory by default', () => {
    write(tmpDir, 'guide.md', '# Guide');
    write(tmpDir, 'api/reference.md', '# API Reference');

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Guide');
  });

  it('excludes node_modules/ by default', () => {
    write(tmpDir, 'guide.md', '# Guide');
    write(tmpDir, 'node_modules/some-pkg/README.md', '# Pkg Readme');

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Guide');
  });

  it('respects custom exclude patterns', () => {
    write(tmpDir, 'public.md', '# Public');
    write(tmpDir, 'internal/secret.md', '# Secret');

    const docs = scanDocs(opts(tmpDir, { exclude: ['**/internal/**'] }));

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Public');
  });

  it('includes api/ when custom exclude list does not contain it', () => {
    write(tmpDir, 'guide.md', '# Guide');
    write(tmpDir, 'api/reference.md', '# API Reference');

    const docs = scanDocs(opts(tmpDir, { exclude: [] }));

    expect(docs).toHaveLength(2);
  });
});

describe('scanDocs – maxDocs limit', () => {
  it('respects maxDocs limit', () => {
    for (let i = 1; i <= 5; i++) {
      write(tmpDir, `doc-${i}.md`, `# Document ${i}`);
    }

    const docs = scanDocs(opts(tmpDir, { maxDocs: 3 }));

    expect(docs).toHaveLength(3);
  });

  it('defaults maxDocs to 20', () => {
    for (let i = 1; i <= 25; i++) {
      write(tmpDir, `${String(i).padStart(2, '0')}-doc.md`, `# Doc ${i}`);
    }

    const docs = scanDocs(opts(tmpDir));

    expect(docs).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// docsToExtractedDocuments
// ---------------------------------------------------------------------------

describe('docsToExtractedDocuments', () => {
  it('converts parsed docs to ExtractedDocument format', () => {
    const rawContent = '# Hello\n\nWorld.';
    write(tmpDir, 'hello.md', rawContent);

    const docs = scanDocs(opts(tmpDir));
    const extracted = docsToExtractedDocuments(docs);

    expect(extracted).toHaveLength(1);
    expect(extracted[0]).toEqual({ title: 'Hello', content: rawContent });
  });

  it('returns empty array for empty input', () => {
    expect(docsToExtractedDocuments([])).toEqual([]);
  });

  it('maps title and rawContent for each doc', () => {
    write(tmpDir, 'a.md', '# Alpha\n\nContent A.');
    write(tmpDir, 'b.md', '# Beta\n\nContent B.');

    const docs = scanDocs(opts(tmpDir));
    const extracted = docsToExtractedDocuments(docs);

    expect(extracted).toHaveLength(2);
    for (const item of extracted) {
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('content');
      expect(typeof item.title).toBe('string');
      expect(typeof item.content).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// scanRootDocs
// ---------------------------------------------------------------------------

describe('scanRootDocs – basic scanning', () => {
  it('scans root .md files and returns parsed docs', () => {
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), '# Architecture\n\nSystem design overview.');
    writeFileSync(join(tmpDir, 'MIGRATION.md'), '# Migration\n\nHow to migrate from v1 to v2.');

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(2);
    const titles = docs.map((d) => d.title);
    expect(titles).toContain('Architecture');
    expect(titles).toContain('Migration');
  });

  it('returns empty array for non-existent directory', () => {
    const docs = scanRootDocs(join(tmpDir, 'does-not-exist'));
    expect(docs).toEqual([]);
  });

  it('skips README.md', () => {
    writeFileSync(join(tmpDir, 'README.md'), '# README\n\nThe readme.');
    writeFileSync(join(tmpDir, 'CONTRIBUTING.md'), '# Contributing\n\nHow to contribute.');

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Contributing');
  });

  it('skips LICENSE and LICENSE.md', () => {
    writeFileSync(join(tmpDir, 'LICENSE'), 'MIT License...');
    writeFileSync(join(tmpDir, 'LICENSE.md'), '# License\n\nMIT.');
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), '# Architecture\n\nDesign.');

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Architecture');
  });

  it('skips CODE_OF_CONDUCT.md', () => {
    writeFileSync(join(tmpDir, 'CODE_OF_CONDUCT.md'), '# Code of Conduct\n\nBe nice.');
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), '# Architecture\n\nDesign.');

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Architecture');
  });

  it('skips CHANGELOG.md', () => {
    writeFileSync(join(tmpDir, 'CHANGELOG.md'), '# Changelog\n\n## v1.0.0\n\nInitial release.');
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), '# Architecture\n\nDesign.');

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Architecture');
  });

  it('returns docs sorted alphabetically by title', () => {
    writeFileSync(join(tmpDir, 'MIGRATION.md'), '# Migration\n\nMigration guide.');
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), '# Architecture\n\nSystem design.');
    writeFileSync(join(tmpDir, 'CONTRIBUTING.md'), '# Contributing\n\nHow to contribute.');

    const docs = scanRootDocs(tmpDir);

    expect(docs.map((d) => d.title)).toEqual(['Architecture', 'Contributing', 'Migration']);
  });

  it('parses files with parseMarkdownDoc (exposes rawContent)', () => {
    const content = '# Architecture\n\nSystem design overview.';
    writeFileSync(join(tmpDir, 'ARCHITECTURE.md'), content);

    const docs = scanRootDocs(tmpDir);

    expect(docs).toHaveLength(1);
    expect(docs[0]?.rawContent).toBe(content);
  });
});
