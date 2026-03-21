import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { RenderedSkill, SkillRenderOptions } from "./types.js";

/** Write rendered skill files to disk */
export function writeSkills(
  skills: RenderedSkill[],
  options: Pick<SkillRenderOptions, "outDir">,
): void {
  for (const skill of skills) {
    const fullPath = join(options.outDir, skill.filename);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, skill.content, "utf-8");
  }
}
