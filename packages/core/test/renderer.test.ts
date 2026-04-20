import { describe, it, expect } from 'vitest';
import { renderSkill, renderConfigSurfaceSection } from '@to-skills/core';
import type { ExtractedSkill, ExtractedConfigSurface } from '@to-skills/core';

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

describe('renderSkill — module grouping in references', () => {
  it('groups functions by sourceModule in functions.md', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'renderSkill',
          description: 'Renders a skill',
          signature: 'renderSkill(skill: ExtractedSkill): RenderedSkill',
          parameters: [],
          returnType: 'RenderedSkill',
          examples: [],
          tags: {},
          sourceModule: 'renderer'
        },
        {
          name: 'estimateTokens',
          description: 'Estimates token count',
          signature: 'estimateTokens(text: string): number',
          parameters: [],
          returnType: 'number',
          examples: [],
          tags: {},
          sourceModule: 'tokens'
        },
        {
          name: 'truncateToTokenBudget',
          description: 'Truncates content to budget',
          signature: 'truncateToTokenBudget(text: string, budget: number): string',
          parameters: [],
          returnType: 'string',
          examples: [],
          tags: {},
          sourceModule: 'tokens'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    // Module headings
    expect(fns!.content).toContain('## renderer');
    expect(fns!.content).toContain('## tokens');
    // Function sub-headings
    expect(fns!.content).toContain('### `renderSkill`');
    expect(fns!.content).toContain('### `estimateTokens`');
    expect(fns!.content).toContain('### `truncateToTokenBudget`');
    // No flat ## (non-sub-heading) for individual functions — they should be ### under modules
    expect(fns!.content).not.toMatch(/^## `renderSkill`/m);
    expect(fns!.content).not.toMatch(/^## `estimateTokens`/m);
  });

  it('renders flat ## headings when no sourceModule is set', () => {
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
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('## `greet`');
    // No module grouping headings (no plain "## word" without backticks)
    expect(fns!.content).not.toContain('### `greet`');
  });

  it('groups classes by sourceModule in classes.md', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'Renderer',
          description: 'The renderer class',
          constructorSignature: 'constructor(opts: Options)',
          methods: [],
          properties: [],
          examples: [],
          sourceModule: 'renderer'
        },
        {
          name: 'TokenCounter',
          description: 'Counts tokens',
          constructorSignature: 'constructor()',
          methods: [],
          properties: [],
          examples: [],
          sourceModule: 'tokens'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).toContain('## renderer');
    expect(cls!.content).toContain('## tokens');
    expect(cls!.content).toContain('### `Renderer`');
    expect(cls!.content).toContain('### `TokenCounter`');
  });

  it('groups variables by sourceModule in variables.md', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      variables: [
        {
          name: 'DEFAULT_OPTIONS',
          type: 'Options',
          description: 'Default rendering options',
          isConst: true,
          sourceModule: 'renderer'
        },
        {
          name: 'MAX_TOKENS',
          type: 'number',
          description: 'Max token limit',
          isConst: true,
          sourceModule: 'tokens'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const vars = references.find((r) => r.filename.endsWith('variables.md'));
    expect(vars).toBeDefined();
    expect(vars!.content).toContain('## renderer');
    expect(vars!.content).toContain('## tokens');
    expect(vars!.content).toContain('### `DEFAULT_OPTIONS`');
    expect(vars!.content).toContain('### `MAX_TOKENS`');
  });
});

describe('renderSkill — suppress empty descriptions', () => {
  it('does not render trailing " — " for empty parameter descriptions', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'parse',
          description: 'Parses input',
          signature: 'parse(input: string): string',
          parameters: [
            { name: 'input', type: 'string', description: '', optional: false },
            { name: 'options', type: 'Options', description: 'Parse options', optional: true }
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
    // No trailing " — " with nothing after
    expect(fns!.content).not.toMatch(/`input: string` — $/m);
    expect(fns!.content).not.toMatch(/— \s*\n/);
    // Should still render the param with description correctly
    expect(fns!.content).toContain('— Parse options');
  });

  it('does not render trailing " — " for empty class property descriptions', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'Config',
          description: 'Configuration class',
          constructorSignature: 'constructor()',
          methods: [],
          properties: [
            { name: 'port', type: 'number', description: '', optional: false },
            { name: 'host', type: 'string', description: 'Server hostname', optional: false }
          ],
          examples: []
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).not.toMatch(/`port: number` — $/m);
    expect(cls!.content).toContain('— Server hostname');
  });

  it('does not render trailing " — " for empty class method descriptions', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      classes: [
        {
          name: 'Service',
          description: 'Service class',
          constructorSignature: 'constructor()',
          methods: [
            {
              name: 'start',
              description: '',
              signature: 'start(): void',
              parameters: [],
              returnType: 'void',
              examples: [],
              tags: {}
            },
            {
              name: 'stop',
              description: 'Stops the service',
              signature: 'stop(): void',
              parameters: [],
              returnType: 'void',
              examples: [],
              tags: {}
            }
          ],
          properties: [],
          examples: []
        }
      ]
    };

    const { references } = renderSkill(skill);
    const cls = references.find((r) => r.filename.endsWith('classes.md'));
    expect(cls).toBeDefined();
    expect(cls!.content).not.toMatch(/`start\(\): void` — $/m);
    expect(cls!.content).toContain('— Stops the service');
  });
});

describe('renderSkill — Quick Reference with sourceModule', () => {
  it('groups Quick Reference by module when sourceModule present', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'renderSkill',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          sourceModule: 'renderer'
        },
        {
          name: 'estimateTokens',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          sourceModule: 'tokens'
        }
      ],
      types: [
        {
          name: 'ExtractedSkill',
          description: '',
          definition: '',
          sourceModule: 'types'
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Quick Reference');
    expect(s.content).toContain('**renderer:**');
    expect(s.content).toContain('`renderSkill`');
    expect(s.content).toContain('**tokens:**');
    expect(s.content).toContain('`estimateTokens`');
    expect(s.content).toContain('**types:**');
    expect(s.content).toContain('`ExtractedSkill`');
    // Should NOT use old flat by-kind format when modules are present
    expect(s.content).not.toContain('**3 functions**');
  });

  it('keeps flat by-kind Quick Reference when no sourceModule', () => {
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
    expect(s.content).toContain('**2 functions**');
    expect(s.content).toContain('`Config`');
  });
});

describe('renderSkill — @remarks in functions.md', () => {
  it('renders remarks after description in functions.md', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'parseConfig',
          description: 'Parses configuration',
          signature: 'parseConfig(path: string): Config',
          parameters: [],
          returnType: 'Config',
          examples: [],
          tags: {},
          remarks: 'Expert tip: always validate the schema before parsing large files.'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain(
      'Expert tip: always validate the schema before parsing large files.'
    );
  });

  it('omits remarks block when remarks is undefined', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'greet',
          description: 'Says hello',
          signature: 'greet(): void',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    // Content should not have double blank line that remarks would introduce
    expect(fns!.content).not.toMatch(/Expert tip/);
  });
});

describe('renderSkill — @category grouping', () => {
  it('groups functions by category in functions.md (overrides sourceModule)', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'createUser',
          description: 'Creates a user',
          signature: 'createUser(name: string): User',
          parameters: [],
          returnType: 'User',
          examples: [],
          tags: {},
          sourceModule: 'users',
          category: 'User Management'
        },
        {
          name: 'deleteUser',
          description: 'Deletes a user',
          signature: 'deleteUser(id: string): void',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          sourceModule: 'users',
          category: 'User Management'
        },
        {
          name: 'createPost',
          description: 'Creates a post',
          signature: 'createPost(title: string): Post',
          parameters: [],
          returnType: 'Post',
          examples: [],
          tags: {},
          sourceModule: 'posts',
          category: 'Content'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('## User Management');
    expect(fns!.content).toContain('## Content');
    expect(fns!.content).toContain('### `createUser`');
    expect(fns!.content).toContain('### `deleteUser`');
    expect(fns!.content).toContain('### `createPost`');
  });

  it('groups by category in Quick Reference when category is set', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'createUser',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          category: 'User Management'
        },
        {
          name: 'createPost',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          category: 'Content'
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('**User Management:**');
    expect(s.content).toContain('**Content:**');
    expect(s.content).toContain('`createUser`');
    expect(s.content).toContain('`createPost`');
  });

  it('falls back to sourceModule when no @category', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'helper',
          description: 'A helper',
          signature: 'helper(): void',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          sourceModule: 'utils'
        }
      ]
    };

    const { references } = renderSkill(skill);
    const fns = references.find((r) => r.filename.endsWith('functions.md'));
    expect(fns).toBeDefined();
    expect(fns!.content).toContain('## utils');
    expect(fns!.content).toContain('### `helper`');
  });
});

describe('renderSkill — @useWhen/@avoidWhen in SKILL.md', () => {
  it('renders @useWhen items in When to Use section', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Validating user input before saving', 'Checking schema compliance']
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## When to Use');
    expect(s.content).toContain('- Validating user input before saving');
    expect(s.content).toContain('- Checking schema compliance');
  });

  it('renders @avoidWhen with "Avoid when:" header', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      avoidWhen: ['Performance is critical', 'Simple truthy checks suffice']
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('**Avoid when:**');
    expect(s.content).toContain('- Performance is critical');
    expect(s.content).toContain('- Simple truthy checks suffice');
  });

  it('renders both @useWhen and @avoidWhen together', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Need strict validation'],
      avoidWhen: ['Already validated upstream']
    };

    const { skill: s } = renderSkill(skill);
    const content = s.content;
    expect(content).toContain('- Need strict validation');
    expect(content).toContain('**Avoid when:**');
    expect(content).toContain('- Already validated upstream');
    // useWhen should appear before avoidWhen
    expect(content.indexOf('Need strict validation')).toBeLessThan(content.indexOf('Avoid when'));
  });

  it('omits Avoid when section when avoidWhen is empty/absent', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Always use this']
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).not.toContain('**Avoid when:**');
  });
});

describe('renderSkill — Documentation section in SKILL.md', () => {
  it('renders Documentation section when skill has documents', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      documents: [
        {
          title: 'Architecture',
          content: 'System architecture and design decisions. More details here.'
        },
        { title: 'Troubleshooting', content: 'Common issues and solutions. See FAQ for more.' }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Documentation');
    expect(s.content).toContain('**Architecture**');
    expect(s.content).toContain('**Troubleshooting**');
  });

  it('extracts first sentence as description for each doc', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      documents: [
        {
          title: 'Architecture',
          content: 'System architecture and design decisions. More details here.'
        },
        { title: 'Troubleshooting', content: 'Common issues and solutions. See FAQ for more.' }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('**Architecture** — System architecture and design decisions.');
    expect(s.content).toContain('**Troubleshooting** — Common issues and solutions.');
    // Should not include content past the first sentence
    expect(s.content).not.toContain('More details here');
    expect(s.content).not.toContain('See FAQ for more');
  });

  it('renders just the bold title when no first sentence can be extracted', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      documents: [{ title: 'Notes', content: '' }]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Documentation');
    expect(s.content).toContain('**Notes**');
    expect(s.content).not.toContain('**Notes** —');
  });

  it('does not render Documentation section when no documents field', () => {
    const { skill: s } = renderSkill(minimalSkill);
    expect(s.content).not.toContain('## Documentation');
  });

  it('does not render Documentation section when documents array is empty', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      documents: []
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).not.toContain('## Documentation');
  });

  it('renders Documentation after Quick Reference and before Links', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      documents: [{ title: 'Guide', content: 'Getting started guide.' }],
      repository: 'https://github.com/example/repo'
    };

    const { skill: s } = renderSkill(skill);
    const content = s.content;
    const quickRefIdx = content.indexOf('## Quick Reference');
    const docsIdx = content.indexOf('## Documentation');
    const linksIdx = content.indexOf('## Links');
    expect(quickRefIdx).toBeLessThan(docsIdx);
    expect(docsIdx).toBeLessThan(linksIdx);
  });
});

describe('renderSkill — @pitfalls in SKILL.md', () => {
  it('renders Pitfalls section when pitfalls are present', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      pitfalls: ['Forgetting to await async calls', 'Not handling null returns']
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Pitfalls');
    expect(s.content).toContain('- Forgetting to await async calls');
    expect(s.content).toContain('- Not handling null returns');
  });

  it('omits Pitfalls section when pitfalls is empty/absent', () => {
    const { skill: s } = renderSkill(minimalSkill);
    expect(s.content).not.toContain('## Pitfalls');
  });

  it('renders Pitfalls after When to Use and before Quick Reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      pitfalls: ['Watch out for this']
    };

    const { skill: s } = renderSkill(skill);
    const content = s.content;
    const whenIdx = content.indexOf('## When to Use');
    const pitfallsIdx = content.indexOf('## Pitfalls');
    const quickRefIdx = content.indexOf('## Quick Reference');
    expect(whenIdx).toBeLessThan(pitfallsIdx);
    expect(pitfallsIdx).toBeLessThan(quickRefIdx);
  });
});

// ===========================================================================
// New behavior: decision tables, compact Quick Reference, config pointer
// ===========================================================================

describe('renderSkill — decision table from useWhenSources', () => {
  it('renders flat list when useWhenSources has only one distinct source', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Validating input', 'Checking format'],
      useWhenSources: [
        { text: 'Validating input', sourceName: 'validate', sourceKind: 'function' },
        { text: 'Checking format', sourceName: 'validate', sourceKind: 'function' }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('- Validating input');
    expect(s.content).toContain('- Checking format');
    // Should NOT render as a table when only one source
    expect(s.content).not.toContain('| Task | Use | Why |');
  });

  it('renders decision table when useWhenSources has multiple distinct sources', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Display images', 'Draw shapes'],
      useWhenSources: [
        { text: 'Display images', sourceName: 'Sprite', sourceKind: 'class' },
        { text: 'Draw shapes', sourceName: 'Graphics', sourceKind: 'class' }
      ]
    };

    const { skill: s } = renderSkill(skill);
    // No " — " in text → 2-column table (no Why column)
    expect(s.content).toContain('| Task | Use |');
    expect(s.content).toContain('|------|-----|');
    expect(s.content).toContain('`Sprite`');
    expect(s.content).toContain('`Graphics`');
    expect(s.content).toContain('Display images');
    expect(s.content).toContain('Draw shapes');
  });

  it('splits "task — why" format in decision table rows', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Display images — Fast batched rendering', 'Draw shapes — Retained vector API'],
      useWhenSources: [
        {
          text: 'Display images — Fast batched rendering',
          sourceName: 'Sprite',
          sourceKind: 'class'
        },
        {
          text: 'Draw shapes — Retained vector API',
          sourceName: 'Graphics',
          sourceKind: 'class'
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('| Display images | `Sprite` | Fast batched rendering |');
    expect(s.content).toContain('| Draw shapes | `Graphics` | Retained vector API |');
  });

  it('uses "—" as why column when no dash separator in useWhenSources text', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Need sprites', 'Need graphics'],
      useWhenSources: [
        { text: 'Need sprites', sourceName: 'Sprite', sourceKind: 'class' },
        { text: 'Need graphics', sourceName: 'Graphics', sourceKind: 'class' }
      ]
    };

    const { skill: s } = renderSkill(skill);
    // No " — " in text → 2-column table (no Why column)
    expect(s.content).toContain('| Need sprites | `Sprite` |');
    expect(s.content).toContain('| Need graphics | `Graphics` |');
  });

  it('falls back to flat list when useWhenSources is absent', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      useWhen: ['Item one', 'Item two']
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('- Item one');
    expect(s.content).toContain('- Item two');
    expect(s.content).not.toContain('| Task | Use | Why |');
  });
});

describe('renderSkill — compact Quick Reference with descriptions', () => {
  it('shows first sentence of description in parentheses for flat items', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'validate',
          description: 'Validates input. Returns true on success.',
          signature: '',
          parameters: [],
          returnType: 'boolean',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('`validate` (Validates input)');
  });

  it('omits parenthetical when description is empty', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'noop',
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
    // Should just show `noop` with no trailing empty parens
    expect(s.content).toContain('`noop`');
    expect(s.content).not.toContain('`noop` ()');
  });

  it('shows description in grouped Quick Reference by module', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'render',
          description: 'Renders the scene to canvas. Call each frame.',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {},
          sourceModule: 'renderer'
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('**renderer:**');
    expect(s.content).toContain('`render` (Renders the scene to canvas)');
  });

  it('truncates very long descriptions at 60 chars', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn',
          description:
            'This is a very long description without any sentence terminators in it at all right here',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ]
    };

    const { skill: s } = renderSkill(skill);
    // Should not include the full long description
    expect(s.content).not.toContain('right here');
    // Should include start of description
    expect(s.content).toContain('This is a very long');
  });
});

describe('renderSkill — readmeFeatures in SKILL.md', () => {
  it('renders Features section when readmeFeatures is set', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      readmeFeatures: '- Zero dependencies\n- TypeScript-first\n- Tree-shakeable'
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Features');
    expect(s.content).toContain('- Zero dependencies');
    expect(s.content).toContain('- TypeScript-first');
    expect(s.content).toContain('- Tree-shakeable');
  });

  it('omits Features section when readmeFeatures is absent', () => {
    const { skill: s } = renderSkill(minimalSkill);
    expect(s.content).not.toContain('## Features');
  });

  it('renders Features after body intro and before Quick Start', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      packageDescription: 'BODY_INTRO',
      readmeFeatures: 'FEATURES_CONTENT',
      examples: ['```ts\nconst x = 1;\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: true });
    const content = s.content;
    const bodyIdx = content.indexOf('BODY_INTRO');
    const featuresIdx = content.indexOf('## Features');
    const quickStartIdx = content.indexOf('## Quick Start');
    expect(bodyIdx).toBeLessThan(featuresIdx);
    expect(featuresIdx).toBeLessThan(quickStartIdx);
  });
});

describe('renderSkill — readmeTroubleshooting in SKILL.md', () => {
  it('renders Troubleshooting section when readmeTroubleshooting is set', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      readmeTroubleshooting: '### Error: module not found\n\nRun `npm install` first.'
    };

    const { skill: s } = renderSkill(skill);
    expect(s.content).toContain('## Troubleshooting');
    expect(s.content).toContain('Error: module not found');
    expect(s.content).toContain('Run `npm install` first.');
  });

  it('omits Troubleshooting section when readmeTroubleshooting is absent', () => {
    const { skill: s } = renderSkill(minimalSkill);
    expect(s.content).not.toContain('## Troubleshooting');
  });

  it('renders Troubleshooting after Pitfalls and before Quick Reference', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      pitfalls: ['Watch out'],
      readmeTroubleshooting: 'TROUBLESHOOTING_CONTENT'
    };

    const { skill: s } = renderSkill(skill);
    const content = s.content;
    const pitfallsIdx = content.indexOf('## Pitfalls');
    const troubleshootingIdx = content.indexOf('## Troubleshooting');
    const quickRefIdx = content.indexOf('## Quick Reference');
    expect(pitfallsIdx).toBeLessThan(troubleshootingIdx);
    expect(troubleshootingIdx).toBeLessThan(quickRefIdx);
  });
});

describe('renderSkill — additional examples in SKILL.md', () => {
  it('renders Examples section for skill.examples beyond the first', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: [
        '```ts\n// Quick Start\nconst x = 1;\n```',
        '```ts\n// Example Two\nconst y = 2;\n```',
        '```ts\n// Example Three\nconst z = 3;\n```'
      ]
    };

    const { skill: s } = renderSkill(skill, { includeExamples: true });
    expect(s.content).toContain('## Quick Start');
    expect(s.content).toContain('## Examples');
    expect(s.content).toContain('Example Two');
    expect(s.content).toContain('Example Three');
    // Quick Start shows only the first example
    expect(s.content).not.toContain('// Quick Start\n```\n\n## Quick Start');
  });

  it('does not render Examples section when only one example (Quick Start only)', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ['```ts\nconst x = 1;\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: true });
    expect(s.content).toContain('## Quick Start');
    expect(s.content).not.toContain('## Examples');
  });

  it('does not render Examples section when includeExamples is false', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      examples: ['```ts\nconst x = 1;\n```', '```ts\nconst y = 2;\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: false });
    expect(s.content).not.toContain('## Quick Start');
    expect(s.content).not.toContain('## Examples');
  });

  it('renders Examples section after Quick Start and before When to Use', () => {
    const skill: ExtractedSkill = {
      ...minimalSkill,
      functions: [
        {
          name: 'fn',
          description: '',
          signature: '',
          parameters: [],
          returnType: 'void',
          examples: [],
          tags: {}
        }
      ],
      examples: ['```ts\nconst a = 1;\n```', '```ts\nconst b = 2;\n```']
    };

    const { skill: s } = renderSkill(skill, { includeExamples: true });
    const content = s.content;
    const quickStartIdx = content.indexOf('## Quick Start');
    const examplesIdx = content.indexOf('## Examples');
    const whenToUseIdx = content.indexOf('## When to Use');
    expect(quickStartIdx).toBeLessThan(examplesIdx);
    expect(examplesIdx).toBeLessThan(whenToUseIdx);
  });
});

describe('renderConfigSurfaceSection — multi-surface config pointer', () => {
  it('shows compact pointer for multiple config surfaces without bullet list', () => {
    const surfaces: ExtractedConfigSurface[] = [
      {
        name: 'AppConfig',
        description: 'Application config',
        sourceType: 'config',
        options: [{ name: 'port', type: 'number', description: 'Server port', required: false }]
      },
      {
        name: 'BuildConfig',
        description: 'Build config',
        sourceType: 'config',
        options: [{ name: 'outDir', type: 'string', description: 'Output dir', required: false }]
      },
      {
        name: 'LogConfig',
        description: 'Logger config',
        sourceType: 'config',
        options: [{ name: 'level', type: 'string', description: 'Log level', required: false }]
      }
    ];

    const result = renderConfigSurfaceSection(surfaces);
    expect(result).toContain('## Configuration');
    expect(result).toContain('3 configuration interfaces');
    expect(result).toContain('references/config.md');
    // Should NOT have a bullet list of all surface names
    expect(result).not.toContain('- **AppConfig**');
    expect(result).not.toContain('- **BuildConfig**');
    expect(result).not.toContain('- **LogConfig**');
  });
});
