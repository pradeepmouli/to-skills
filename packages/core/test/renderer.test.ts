import { describe, it, expect } from "vitest";
import { renderSkill } from "@to-skills/core";
import type { ExtractedSkill } from "@to-skills/core";

describe("renderSkill", () => {
  const minimalSkill: ExtractedSkill = {
    name: "my-lib",
    description: "A test library",
    functions: [],
    classes: [],
    types: [],
    enums: [],
    examples: [],
  };

  it("renders frontmatter with name and description", () => {
    const result = renderSkill(minimalSkill);
    expect(result.content).toContain("---");
    expect(result.content).toContain("name: my-lib");
    expect(result.content).toContain("description: A test library");
  });

  it("generates a valid skill filename", () => {
    const result = renderSkill(minimalSkill);
    expect(result.filename).toBe("my-lib/SKILL.md");
  });

  it("renders functions section", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: "greet",
          description: "Says hello",
          signature: "greet(name: string): string",
          parameters: [
            { name: "name", type: "string", description: "Who to greet", optional: false },
          ],
          returnType: "string",
          examples: [],
          tags: {},
        },
      ],
    };

    const result = renderSkill(skill);
    expect(result.content).toContain("## Functions");
    expect(result.content).toContain("`greet`");
    expect(result.content).toContain("greet(name: string): string");
    expect(result.content).toContain("**Returns:** `string`");
  });

  it("handles scoped package names in skill name", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      name: "@scope/my-package",
    };

    const result = renderSkill(skill);
    expect(result.filename).toBe("scope-my-package/SKILL.md");
  });
});
