import { describe, it, expect } from 'vitest';
import { renderSkill } from '@to-skills/core';
import type { ExtractedSkill } from '@to-skills/core';

const minimalSkill: ExtractedSkill = {
  name: 'my-lib',
  description: 'A test library',
  functions: [],
  classes: [],
  types: [],
  enums: [],
  variables: [],
  examples: []
};

describe('renderSkill — SKILL.md (discovery)', () => {
  it('renders frontmatter with name and description', () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).toContain('---');
    expect(skill.content).toContain('name: my-lib');
    expect(skill.content).toContain('description: A test library');
  });

  it('generates a valid skill filename', () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.filename).toBe('my-lib/SKILL.md');
  });

  it('includes title heading', () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).toContain('# my-lib');
  });

  it('includes license in frontmatter when provided', () => {
    const { skill } = renderSkill(minimalSkill, { license: 'MIT' });
    expect(skill.content).toContain('license: MIT');
  });

  it('omits license when empty', () => {
    const { skill } = renderSkill(minimalSkill);
    expect(skill.content).not.toContain('license:');
  });

  it('renders When to Use section', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(name: string): string',
          parameters: [
            { name: 'name', type: 'string', description: 'Who to greet', optional: false }
          ],
          returnType: 'string',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## When to Use');
    expect(s.content).toContain('API surface: 1 functions');
  });

  it('renders Quick Reference summary', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'foo',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        },
        {
          name: 'bar',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      types: [{ name: 'Config', description: '', definition: '' }]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Quick Reference');
    expect(s.content).toContain('**2 functions**');
    expect(s.content).toContain('`Config`');
  });

  it('SKILL.md does NOT contain full function signatures', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(name: string): string',
          parameters: [{ name: 'name', type: 'string', description: '', optional: false }],
          returnType: 'string',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).not.toContain('```ts');
    expect(s.content).not.toContain('**Parameters:**');
  });

  it('handles scoped package names', () => {
    const { skill } = renderSkill({ ...minimalSkill, name: '@scope/my-package' });
    expect(skill.filename).toBe('scope-my-package/SKILL.md');
  });

  it('quotes YAML descriptions with special characters', () => {
    const { skill } = renderSkill({ ...minimalSkill, description: 'Use when: "foo" needed' });
    expect(skill.content).toMatch(/description: ".*"/);
  });

  it('reads license from ExtractedSkill when option not set', () => {
    const { skill } = renderSkill({ ...minimalSkill, license: 'Apache-2.0' });
    expect(skill.content).toContain('license: Apache-2.0');
  });
});

describe('renderSkill — references (progressive disclosure)', () => {
  it('creates functions.md reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(name: string): string',
          parameters: [
            { name: 'name', type: 'string', description: 'Who to greet', optional: false }
          ],
          returnType: 'string',
          examples: [],
          tags: {}
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('# Functions');
    expect(fns!.content).toContain('greet(name: string): string');
    expect(fns!.content).toContain('**Returns:** `string`');
  });

  it('creates classes.md reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'MyClass',
          description: 'A test class',
          constructorSignature: 'constructor(x: number)',
          methods: [
            {
              name: 'doThing',
              description: 'Does a thing',
              signature: 'doThing(): void',
              parameters: [],
              returnType: 'void',
              examples: [],
              tags: {}
            }
          ],
          properties: [
            { name: 'value', type: 'number', description: 'The value', optional: false }
          ],
          examples: []
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).toContain('# Classes');
    expect(cls!.content).toContain('`MyClass`');
    expect(cls!.content).toContain('**Properties:**');
    expect(cls!.content).toContain('**Methods:**');
  });

  it('creates types.md reference for types and enums', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      types: [{ name: 'Config', description: 'App config', definition: '{ port: number }' }],
      enums: [
        {
          name: 'Mode',
          description: 'Run mode',
          members: [{ name: 'Dev', value: '"dev"', description: '' }]
        }
      ]
    };

    const { references } = renderSkill(skill);
    const types = references.find((r) => r.filename.endsWith('types.md'));
    expect(types).toBeDefined();
    expect(types!.content).toContain('# Types & Enums');
    expect(types!.content).toContain('`Config`');
    expect(types!.content).toContain('`Mode`');
  });

  it('creates examples.md reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ["```ts\nconsole.log('hello');\n```"]
    };

    const { references } = renderSkill(skill);
    const ex = references.find((r) => r.filename.endsWith('examples.md'));
    expect(ex).toBeDefined();
    expect(ex!.content).toContain('# Examples');
  });

  it('returns no references for empty skill', () => {
    const { references } = renderSkill(minimalSkill);
    expect(references).toHaveLength(0);
  });

  it('includes token counts on all files', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'foo',
          description: 'test',
          signature: 'foo(): void',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s, references } = renderSkill(skill);
    expect(s.tokens).toBeGreaterThan(0);
    expect(references[0]!.tokens).toBeGreaterThan(0);
  });

  it('creates variables.md reference for exported variables', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      variables: [
        {
          name: 'DEFAULT_OVERRIDES',
          type: 'Record<string, string>',
          description: 'Default override map',
          isConst: true
        },
        { name: 'MAX_RETRIES', type: 'number', description: 'Maximum retry count', isConst: true }
      ]
    };

    const { references } = renderSkill(skill);
    const vars = references.find((r) => r.filename.endsWith('variables.md'));
    expect(vars).toBeDefined();
    expect(vars!.content).toContain('# Variables & Constants');
    expect(vars!.content).toContain('`DEFAULT_OVERRIDES`');
    expect(vars!.content).toContain('Default override map');
    expect(vars!.content).toContain('const DEFAULT_OVERRIDES: Record<string, string>');
    expect(vars!.content).toContain('`MAX_RETRIES`');
  });

  it("uses 'let' keyword for non-const variables", () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      variables: [{ name: 'mutableState', type: 'string', description: '', isConst: false }]
    };

    const { references } = renderSkill(skill);
    const vars = references.find((r) => r.filename.endsWith('variables.md'));
    expect(vars!.content).toContain('let mutableState: string');
    expect(vars!.content).not.toContain('const mutableState');
  });

  it('does not create variables.md when variables is empty', () => {
    const { references } = renderSkill(minimalSkill);
    const vars = references.find((r) => r.filename.endsWith('variables.md'));
    expect(vars).toBeUndefined();
  });
});

describe('renderSkill — function tags in functions.md', () => {
  const makeSkillWithTags = (tags: Record<string, string>): ExtractedSkill => ({
    ...minimalSkill,
    functions: [
      {
        name: 'legacyFn',
        description: 'A legacy function',
        signature: 'legacyFn(): void',
        parameters: [],
        returnType: 'void',
        examples: [],
        tags
      }
    ]
  });

  it('renders @deprecated as a blockquote', () => {
    const { references } = renderSkill(makeSkillWithTags({ deprecated: 'Use newFn() instead' }));
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('> **Deprecated:** Use newFn() instead');
  });

  it('renders @since as inline code', () => {
    const { references } = renderSkill(makeSkillWithTags({ since: '2.0.0' }));
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('**Since:** `2.0.0`');
  });

  it('renders @throws', () => {
    const { references } = renderSkill(makeSkillWithTags({ throws: 'TypeError if input is null' }));
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('**Throws:** TypeError if input is null');
  });

  it('renders @see', () => {
    const { references } = renderSkill(makeSkillWithTags({ see: 'newFn' }));
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('**See:** newFn');
  });

  it('renders multiple tags together', () => {
    const { references } = renderSkill(
      makeSkillWithTags({
        deprecated: 'Use newFn() instead',
        since: '1.0.0',
        throws: 'RangeError on overflow',
        see: 'newFn'
      })
    );
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('> **Deprecated:** Use newFn() instead');
    expect(fns!.content).toContain('**Since:** `1.0.0`');
    expect(fns!.content).toContain('**Throws:** RangeError on overflow');
    expect(fns!.content).toContain('**See:** newFn');
  });

  it('omits tag lines when tags are empty', () => {
    const { references } = renderSkill(makeSkillWithTags({}));
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).not.toContain('Deprecated');
    expect(fns!.content).not.toContain('Since');
    expect(fns!.content).not.toContain('Throws');
    expect(fns!.content).not.toContain('**See:**');
  });
});

describe('renderSkill — function overloads in functions.md', () => {
  it('renders function overloads when includeSignatures is true', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'parse',
          description: 'Parse input',
          signature: 'parse(input: string): string',
          parameters: [{ name: 'input', type: 'string', description: '', optional: false }],
          returnType: 'string',
          examples: [],
          tags: {},
          overloads: ['parse(input: number): number', 'parse(input: boolean): boolean']
        }
      ]
    };

    const { references } = renderSkill(skill, { includeSignatures: true });
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('**Overloads:**');
    expect(fns!.content).toContain('parse(input: number): number');
    expect(fns!.content).toContain('parse(input: boolean): boolean');
  });

  it('omits overloads when includeSignatures is false', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'parse',
          description: 'Parse input',
          signature: 'parse(input: string): string',
          parameters: [],
          returnType: 'string',
          examples: [],
          tags: {},
          overloads: ['parse(input: number): number']
        }
      ]
    };

    const { references } = renderSkill(skill, { includeSignatures: false });
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).not.toContain('**Overloads:**');
    expect(fns!.content).not.toContain('parse(input: number): number');
  });

  it('does not render Overloads section when overloads is undefined', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(name: string): string',
          parameters: [],
          returnType: 'string',
          examples: [],
          tags: {}
        }
      ]
    };

    const { references } = renderSkill(skill, { includeSignatures: true });
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).not.toContain('**Overloads:**');
  });
});

describe('renderSkill — @returns description in functions.md', () => {
  it('appends returnsDescription after return type', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fetchUser',
          description: 'Fetches a user',
          signature: 'fetchUser(id: string): Promise<User>',
          parameters: [{ name: 'id', type: 'string', description: 'User ID', optional: false }],
          returnType: 'Promise<User>',
          returnsDescription: 'The resolved user object',
          examples: [],
          tags: {}
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('**Returns:** `Promise<User>` — The resolved user object');
  });

  it('omits description when returnsDescription is undefined', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(name: string): string',
          parameters: [],
          returnType: 'string',
          examples: [],
          tags: {}
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns!.content).toContain('**Returns:** `string`');
    expect(fns!.content).not.toContain('— ');
  });
});

describe('renderSkill — class inheritance in classes.md', () => {
  it('renders extends line when class has a base class', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'SpecialError',
          description: 'A special error',
          constructorSignature: 'constructor(message: string)',
          methods: [],
          properties: [],
          examples: [],
          extends: 'Error'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).toContain('*extends `Error`*');
  });

  it('renders implements line when class implements interfaces', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'MyRepo',
          description: 'A repository',
          constructorSignature: 'constructor()',
          methods: [],
          properties: [],
          examples: [],
          implements: ['IRepository', 'IDisposable']
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).toContain('*implements `IRepository`, `IDisposable`*');
  });

  it('renders both extends and implements when both are set', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'ConcreteStore',
          description: 'Concrete implementation',
          constructorSignature: 'constructor()',
          methods: [],
          properties: [],
          examples: [],
          extends: 'BaseStore',
          implements: ['IStore']
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls!.content).toContain('*extends `BaseStore`*');
    expect(cls!.content).toContain('*implements `IStore`*');
  });

  it('omits extends/implements lines when neither is set', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'Plain',
          description: 'A plain class',
          constructorSignature: 'constructor()',
          methods: [],
          properties: [],
          examples: []
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls!.content).not.toContain('*extends');
    expect(cls!.content).not.toContain('*implements');
  });
});

describe('renderSkill — variables in SKILL.md', () => {
  it('shows variables in Quick Reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      variables: [
        {
          name: 'DEFAULT_OVERRIDES',
          type: 'Record<string, string>',
          description: 'Defaults',
          isConst: true
        },
        { name: 'VERSION', type: 'string', description: 'Package version', isConst: true }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Quick Reference');
    expect(s.content).toContain('**2 variables**');
    expect(s.content).toContain('`DEFAULT_OVERRIDES`');
    expect(s.content).toContain('`VERSION`');
  });

  it('shows variables in When to Use', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      variables: [
        {
          name: 'builtinProcessors',
          type: 'Processor[]',
          description: 'Built-in processors',
          isConst: true
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## When to Use');
    expect(s.content).toContain('API surface: 1 constants');
  });
});

describe('renderSkill — new description and content behaviour', () => {
  it('uses packageDescription as frontmatter description when present', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      description: 'Short fallback',
      packageDescription: 'Full package description for LLM triggering'
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('Full package description for LLM triggering');
    expect(s.content).not.toContain('Short fallback');
  });

  it('uses description as fallback in frontmatter when packageDescription is absent', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      description: 'Fallback description'
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('description: Fallback description');
  });

  it('renders packageDescription as body intro after title', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      packageDescription: 'UNIQUE_PACKAGE_DESC_BODY'
    };

    const { skill: s } = renderSkill(skill);
    const titleIndex = s.content.indexOf('# my-lib');
    // Find the occurrence after the title
    const bodyIndex = s.content.indexOf('UNIQUE_PACKAGE_DESC_BODY', titleIndex);
    expect(bodyIndex).toBeGreaterThan(titleIndex);
  });

  it('renders description as body intro when packageDescription is absent', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      description: 'UNIQUE_DESCRIPTION_BODY'
    };

    const { skill: s } = renderSkill(skill);
    const titleIndex = s.content.indexOf('# my-lib');
    // Find the occurrence after the title
    const bodyIndex = s.content.indexOf('UNIQUE_DESCRIPTION_BODY', titleIndex);
    expect(bodyIndex).toBeGreaterThan(titleIndex);
  });

  it('When to Use uses keywords instead of listing function names', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      keywords: ['validation', 'schema'],
      functions: [
        {
          name: 'validate',
          description: 'Validates input',
          signature: 'validate(input: unknown): boolean',
          parameters: [],
          returnType: 'boolean',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## When to Use');
    expect(s.content).toContain('Working with validation, schema');
    expect(s.content).not.toContain('`validate()`');
    expect(s.content).not.toContain('Calling `validate');
  });

  it('When to Use shows API surface counts not individual names', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn1',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        },
        {
          name: 'fn2',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      classes: [
        {
          name: 'MyClass',
          description: '',
          constructorSignature: '',
          methods: [],
          properties: [],
          examples: []
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('API surface: 2 functions, 1 classes');
    expect(s.content).not.toContain('`fn1()`');
    expect(s.content).not.toContain('`fn2()`');
    expect(s.content).not.toContain('Instantiating or extending');
  });

  it('renders Quick Start from first module-level example', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ['```ts\nconst x = doSomething();\n```', '```ts\nconst y = doOther();\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: true });
    expect(s.content).toContain('## Quick Start');
    expect(s.content).toContain('doSomething()');
  });

  it('does not render Quick Start when includeExamples is false', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ['```ts\nconst x = doSomething();\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: false });
    expect(s.content).not.toContain('## Quick Start');
  });

  it('does not use old "Calling `fn()`" pattern in When to Use', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'myFunc',
          description: 'Does something',
          signature: 'myFunc(): void',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).not.toContain('Calling `myFunc()`');
    expect(s.content).not.toContain('Typing with');
    expect(s.content).not.toContain('Instantiating or extending');
    expect(s.content).not.toContain('Using constants/variables');
  });

  it('filters generic keywords from description and When to Use', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      keywords: ['typescript', 'javascript', 'npm', 'node', 'nodejs', 'library', 'package', 'http'],
      functions: [
        {
          name: 'request',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    // Only 'http' should appear as useful keyword; generic ones are filtered
    expect(s.content).toContain('http');
    expect(s.content).not.toContain('Working with typescript');
    expect(s.content).not.toContain('Keywords: typescript');
  });
});
