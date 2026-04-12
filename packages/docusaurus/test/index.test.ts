import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { extractDocusaurusDocs } from '../src/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function write(base: string, relPath: string, content: string): void {
  const full = join(base, relPath);
  const parts = relPath.split('/');
  if (parts.length > 1) {
    mkdirSync(join(base, ...parts.slice(0, -1)), { recursive: true });
  }
  writeFileSync(full, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'docusaurus-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('extractDocusaurusDocs – reads docs/ directory', () => {
  it('returns ExtractedDocument[] from docs/ directory', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'intro.md', '# Introduction\n\nWelcome.');
    write(docsDir, 'guide.md', '# Guide\n\nHow to use it.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    const titles = result.map((d) => d.title);
    expect(titles).toContain('Introduction');
    expect(titles).toContain('Guide');
  });

  it('each item has title and content fields', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'page.md', '# My Page\n\nSome content.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('title', 'My Page');
    expect(result[0]).toHaveProperty('content');
    expect(typeof result[0]?.content).toBe('string');
  });
});

describe('extractDocusaurusDocs – ordering by sidebar_position', () => {
  it('orders documents by sidebar_position', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'beta.md', '---\nsidebar_position: 2\n---\n# Beta');
    write(docsDir, 'alpha.md', '---\nsidebar_position: 1\n---\n# Alpha');
    write(docsDir, 'gamma.md', '---\nsidebar_position: 3\n---\n# Gamma');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result.map((d) => d.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});

describe('extractDocusaurusDocs – excludes api/ by default', () => {
  it('excludes api/ directory when excludeApi is true (default)', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'guide.md', '# Guide\n\nContent.');
    write(docsDir, 'api/reference.md', '# API Reference\n\nAPI content.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Guide');
  });

  it('includes api/ when excludeApi is false', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'guide.md', '# Guide\n\nContent.');
    write(docsDir, 'api/reference.md', '# API Reference\n\nAPI content.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir, excludeApi: false });

    expect(result).toHaveLength(2);
  });
});

describe('extractDocusaurusDocs – custom docsDir', () => {
  it('uses custom docsDir option', () => {
    const customDir = join(tmpDir, 'my-docs');
    mkdirSync(customDir);
    write(customDir, 'page.md', '# Custom Page\n\nContent.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir, docsDir: 'my-docs' });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Custom Page');
  });
});

describe('extractDocusaurusDocs – missing docs/ directory', () => {
  it('returns empty array when docs/ directory does not exist', () => {
    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result).toEqual([]);
  });
});

describe('extractDocusaurusDocs – maxDocs limit', () => {
  it('respects maxDocs option', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    for (let i = 1; i <= 10; i++) {
      write(docsDir, `${String(i).padStart(2, '0')}-doc.md`, `# Doc ${i}`);
    }

    const result = extractDocusaurusDocs({ projectRoot: tmpDir, maxDocs: 3 });

    expect(result).toHaveLength(3);
  });

  it('defaults to 20 docs maximum', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    for (let i = 1; i <= 25; i++) {
      write(docsDir, `${String(i).padStart(2, '0')}-doc.md`, `# Doc ${i}`);
    }

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result).toHaveLength(20);
  });
});

describe('extractDocusaurusDocs – defaults', () => {
  it('uses cwd as projectRoot when not specified', () => {
    // Just verify it doesn't throw — cwd likely has no docs/ folder
    const result = extractDocusaurusDocs({});
    expect(Array.isArray(result)).toBe(true);
  });

  it('excludes blog/ and node_modules/ directories', () => {
    const docsDir = join(tmpDir, 'docs');
    mkdirSync(docsDir);
    write(docsDir, 'guide.md', '# Guide\n\nContent.');
    write(docsDir, 'blog/post.md', '# Blog Post\n\nContent.');
    write(docsDir, 'node_modules/pkg/readme.md', '# Pkg\n\nContent.');

    const result = extractDocusaurusDocs({ projectRoot: tmpDir });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Guide');
  });
});
