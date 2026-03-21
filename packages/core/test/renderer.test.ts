import { describe, it, expect } from "vitest";
import { renderSkill } from "@to-skills/core";
import type { ExtractedSkill } from "@to-skills/core";

const minimalSkill: ExtractedSkill = {
  name: "my-lib",
  description: "A test library",
  functions: [],
  classes: [],
  types: [],
  enums: [],
  examples: [],
};

describe("renderSkill", () => {
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

  it("includes title heading", () => {
    const result = renderSkill(minimalSkill);
    expect(result.content).toContain("# my-lib");
  });

  it("includes license in frontmatter when provided", () => {
    const result = renderSkill(minimalSkill, { license: "MIT" });
    expect(result.content).toContain("license: MIT");
  });

  it("omits license when empty", () => {
    const result = renderSkill(minimalSkill);
    expect(result.content).not.toContain("license:");
  });

  it("renders When to Use section for functions", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: "greet",
          description: "Says hello",
          signature: "greet(name: string): string",
          parameters: [{ name: "name", type: "string", description: "Who to greet", optional: false }],
          returnType: "string",
          examples: [],
          tags: {},
        },
      ],
    };

    const result = renderSkill(skill);
    expect(result.content).toContain("## When to Use");
    expect(result.content).toContain("`greet()`");
  });

  it("renders Quick Reference summary", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        { name: "foo", description: "", signature: "", parameters: [], returnType: "void", examples: [], tags: {} },
        { name: "bar", description: "", signature: "", parameters: [], returnType: "void", examples: [], tags: {} },
      ],
      types: [{ name: "Config", description: "", definition: "" }],
    };

    const result = renderSkill(skill);
    expect(result.content).toContain("## Quick Reference");
    expect(result.content).toContain("**2 functions**");
    expect(result.content).toContain("`foo`");
    expect(result.content).toContain("`bar`");
    expect(result.content).toContain("`Config`");
  });

  it("renders functions section with signatures", () => {
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

  it("renders classes with methods and properties", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: "MyClass",
          description: "A test class",
          constructorSignature: "constructor(x: number)",
          methods: [
            { name: "doThing", description: "Does a thing", signature: "doThing(): void", parameters: [], returnType: "void", examples: [], tags: {} },
          ],
          properties: [
            { name: "value", type: "number", description: "The value", optional: false },
          ],
          examples: [],
        },
      ],
    };

    const result = renderSkill(skill);
    expect(result.content).toContain("## Classes");
    expect(result.content).toContain("`MyClass`");
    expect(result.content).toContain("**Properties:**");
    expect(result.content).toContain("**Methods:**");
  });

  it("handles scoped package names in skill name", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      name: "@scope/my-package",
    };

    const result = renderSkill(skill);
    expect(result.filename).toBe("scope-my-package/SKILL.md");
  });

  it("quotes YAML descriptions with special characters", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      description: 'Use when: "foo" needed',
    };

    const result = renderSkill(skill);
    expect(result.content).toMatch(/description: ".*"/);
  });

  it("reads license from ExtractedSkill when option not set", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      license: "Apache-2.0",
    };

    const result = renderSkill(skill);
    expect(result.content).toContain("license: Apache-2.0");
  });
});
