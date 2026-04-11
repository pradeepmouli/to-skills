import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface CategoryMeta {
  label: string;
  position?: number;
}

export function readCategoryLabels(docsDir: string): Map<string, CategoryMeta> {
  const result = new Map<string, CategoryMeta>();

  let entries: string[];
  try {
    entries = readdirSync(docsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return result;
  }

  for (const dirName of entries) {
    const categoryPath = join(docsDir, dirName, '_category_.json');

    let raw: string;
    try {
      raw = readFileSync(categoryPath, 'utf-8');
    } catch {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('label' in parsed) ||
      typeof (parsed as Record<string, unknown>)['label'] !== 'string'
    ) {
      continue;
    }

    const data = parsed as Record<string, unknown>;
    const meta: CategoryMeta = { label: data['label'] as string };

    if (typeof data['position'] === 'number') {
      meta.position = data['position'];
    }

    result.set(dirName, meta);
  }

  return result;
}
