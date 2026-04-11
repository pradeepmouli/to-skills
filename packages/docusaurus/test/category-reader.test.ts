import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readCategoryLabels } from '../src/category-reader.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'category-reader-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('readCategoryLabels', () => {
  it('reads _category_.json from subdirectories', () => {
    mkdirSync(join(tmpDir, 'guides'));
    writeFileSync(
      join(tmpDir, 'guides', '_category_.json'),
      JSON.stringify({ label: 'Guides', position: 1 })
    );

    mkdirSync(join(tmpDir, 'api'));
    writeFileSync(
      join(tmpDir, 'api', '_category_.json'),
      JSON.stringify({ label: 'API Reference', position: 2 })
    );

    const result = readCategoryLabels(tmpDir);

    expect(result.size).toBe(2);
    expect(result.get('guides')).toEqual({ label: 'Guides', position: 1 });
    expect(result.get('api')).toEqual({ label: 'API Reference', position: 2 });
  });

  it('returns empty map when no _category_.json files exist', () => {
    mkdirSync(join(tmpDir, 'empty-dir'));

    const result = readCategoryLabels(tmpDir);

    expect(result.size).toBe(0);
  });

  it('handles invalid JSON gracefully', () => {
    mkdirSync(join(tmpDir, 'good'));
    writeFileSync(join(tmpDir, 'good', '_category_.json'), JSON.stringify({ label: 'Good' }));

    mkdirSync(join(tmpDir, 'bad'));
    writeFileSync(join(tmpDir, 'bad', '_category_.json'), '{ not valid json }');

    const result = readCategoryLabels(tmpDir);

    expect(result.size).toBe(1);
    expect(result.get('good')).toEqual({ label: 'Good' });
    expect(result.has('bad')).toBe(false);
  });

  it('returns empty map when docsDir does not exist', () => {
    const result = readCategoryLabels(join(tmpDir, 'nonexistent'));

    expect(result.size).toBe(0);
  });

  it('skips entries missing the label field', () => {
    mkdirSync(join(tmpDir, 'no-label'));
    writeFileSync(join(tmpDir, 'no-label', '_category_.json'), JSON.stringify({ position: 3 }));

    mkdirSync(join(tmpDir, 'with-label'));
    writeFileSync(
      join(tmpDir, 'with-label', '_category_.json'),
      JSON.stringify({ label: 'Has Label' })
    );

    const result = readCategoryLabels(tmpDir);

    expect(result.size).toBe(1);
    expect(result.get('with-label')).toEqual({ label: 'Has Label' });
    expect(result.has('no-label')).toBe(false);
  });

  it('ignores files at the top level (not in subdirectories)', () => {
    writeFileSync(join(tmpDir, '_category_.json'), JSON.stringify({ label: 'Top Level' }));

    const result = readCategoryLabels(tmpDir);

    expect(result.size).toBe(0);
  });

  it('omits position when not present in JSON', () => {
    mkdirSync(join(tmpDir, 'no-position'));
    writeFileSync(
      join(tmpDir, 'no-position', '_category_.json'),
      JSON.stringify({ label: 'No Position' })
    );

    const result = readCategoryLabels(tmpDir);

    expect(result.get('no-position')).toEqual({ label: 'No Position' });
    expect(result.get('no-position')).not.toHaveProperty('position');
  });
});
