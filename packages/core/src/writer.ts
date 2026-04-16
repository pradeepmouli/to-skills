import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { RenderedFile, RenderedSkill, SkillRenderOptions } from './types.js';

/**
 * Write rendered skill file sets to disk (SKILL.md + references/).
 *
 * @category I/O
 * @useWhen
 * - You have RenderedSkill objects from renderSkills() and need to persist them to the filesystem
 * - Building a custom pipeline that separates rendering from writing (e.g., for preview or dry-run)
 */
export function writeSkills(
  skills: RenderedSkill[],
  options: Pick<SkillRenderOptions, 'outDir'>
): void {
  for (const skill of skills) {
    // Clean the skill-specific output directory before writing to remove stale files
    const skillDir = join(options.outDir, dirname(skill.skill.filename));
    rmSync(skillDir, { recursive: true, force: true });

    // Write SKILL.md
    writeFile(options.outDir, skill.skill);

    // Write references
    for (const ref of skill.references) {
      writeFile(options.outDir, ref);
    }
  }
}

function writeFile(outDir: string, file: RenderedFile): void {
  const fullPath = join(outDir, file.filename);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, 'utf-8');
}
