import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { RenderedFile, RenderedSkill, SkillRenderOptions } from "./types.js";

/** Write rendered skill file sets to disk (SKILL.md + references/) */
export function writeSkills(
  skills: RenderedSkill[],
  options: Pick<SkillRenderOptions, "outDir">,
): void {
  for (const skill of skills) {
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
  writeFileSync(fullPath, file.content, "utf-8");
}
