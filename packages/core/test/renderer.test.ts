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

describe("renderSkill — SKILL.md (discovery)", () => {
  it("renders frontmatter with name and description", () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).toContain("---");
    expect(skill.content).toContain("name: my-lib");
    expect(skill.content).toContain("description: A test library");
  });

  it("generates a valid skill filename", () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.filename).toBe("my-lib/SKILL.md");
  });

  it("includes title heading", () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).toContain("# my-lib");
  });

  it("includes license in frontmatter when provided", () => {
    const { skill } = renderSkill(minimalSkill, { license: "MIT" });
    expect(skill.content).toContain("license: MIT");
  });

  it("omits license when empty", () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).not.toContain("license:");
  });

  it("renders When to Use section", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        { name: "greet", description: "Says hello", signature: "greet(name: string): string", parameters: [{ name: "name", type: "string", description: "Who to greet", optional: false }], returnType: "string", examples: [], tags: {} },
      ],
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain("## When to Use");
    expect(s.content).toContain("`greet()`");
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

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain("## Quick Reference");
    expect(s.content).toContain("**2 functions**");
    expect(s.content).toContain("`Config`");
  });

  it("SKILL.md does NOT contain full function signatures", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        { name: "greet", description: "Says hello", signature: "greet(name: string): string", parameters: [{ name: "name", type: "string", description: "", optional: false }], returnType: "string", examples: [], tags: {} },
      ],
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).not.toContain("```ts");
    expect(s.content).not.toContain("**Parameters:**");
  });

  it("handles scoped package names", () => {
    const { skill } = renderSkill({ ...minimalSkill, name: "@scope/my-package" });
    expect(skill.filename).toBe("scope-my-package/SKILL.md");
  });

  it("quotes YAML descriptions with special characters", () => {
    const { skill } = renderSkill({ ...minimalSkill, description: 'Use when: "foo" needed' });
    expect(skill.content).toMatch(/description: ".*"/);
  });

  it("reads license from ExtractedSkill when option not set", () => {
    const { skill } = renderSkill({ ...minimalSkill, license: "Apache-2.0" });
    expect(skill.content).toContain("license: Apache-2.0");
  });
});

describe("renderSkill — references (progressive disclosure)", () => {
  it("creates functions.md reference", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        { name: "greet", description: "Says hello", signature: "greet(name: string): string", parameters: [{ name: "name", type: "string", description: "Who to greet", optional: false }], returnType: "string", examples: [], tags: {} },
      ],
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith("functions.md"));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain("# Functions");
    expect(fns!.content).toContain("greet(name: string): string");
    expect(fns!.content).toContain("**Returns:** `string`");
  });

  it("creates classes.md reference", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: "MyClass",
          description: "A test class",
          constructorSignature: "constructor(x: number)",
          methods: [{ name: "doThing", description: "Does a thing", signature: "doThing(): void", parameters: [], returnType: "void", examples: [], tags: {} }],
          properties: [{ name: "value", type: "number", description: "The value", optional: false }],
          examples: [],
        },
      ],
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith("classes.md"));
    expect(cls).toBeDefined();
    expect(cls!.content).toContain("# Classes");
    expect(cls!.content).toContain("`MyClass`");
    expect(cls!.content).toContain("**Properties:**");
    expect(cls!.content).toContain("**Methods:**");
  });

  it("creates types.md reference for types and enums", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      types: [{ name: "Config", description: "App config", definition: "{ port: number }" }],
      enums: [{ name: "Mode", description: "Run mode", members: [{ name: "Dev", value: '"dev"', description: "" }] }],
    };

    const { references } = renderSkill(skill);
    const types = references.find((r) => r.filename.endsWith("types.md"));
    expect(types).toBeDefined();
    expect(types!.content).toContain("# Types & Enums");
    expect(types!.content).toContain("`Config`");
    expect(types!.content).toContain("`Mode`");
  });

  it("creates examples.md reference", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ["```ts\nconsole.log('hello');\n```"],
    };

    const { references } = renderSkill(skill);
    const ex = references.find((r) => r.filename.endsWith("examples.md"));
    expect(ex).toBeDefined();
    expect(ex!.content).toContain("# Examples");
  });

  it("returns no references for empty skill", () => {
    const { references } = renderSkill(minimalSkill);
    expect(references).toHaveLength(0);
  });

  it("includes token counts on all files", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        { name: "foo", description: "test", signature: "foo(): void", parameters: [], returnType: "void", examples: [], tags: {} },
      ],
    };

    const { skill: s, references } = renderSkill(skill);
    expect(s.tokens).toBeGreaterThan(0);
    expect(references[0]!.tokens).toBeGreaterThan(0);
  });
});
