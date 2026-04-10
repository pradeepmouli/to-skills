import { describe, it, expect } from 'vitest';
import { ReflectionKind } from 'typedoc';
import { extractSkills } from '../src/extractor.js';

// ── Mock helpers ────────────────────────────────────────────────────────────

function mockComment(
  text: string,
  examples: string[] = [],
  returnsText?: string,
  blockTags: any[] = []
) {
  return {
    summary: [{ text }],
    getTags: (tagName: string) =>
      tagName === '@example' ? examples.map((ex) => ({ content: [{ text: ex }] })) : [],
    getTag: (tagName: string) =>
      tagName === '@returns' && returnsText ? { content: [{ text: returnsText }] } : undefined,
    blockTags
  };
}

function mockParam(name: string, type: string, optional = false, comment?: any) {
  return {
    name,
    type: { toString: () => type },
    flags: { isOptional: optional },
    comment,
    defaultValue: undefined
  };
}

function mockSig(params: any[] = [], returnType = 'void', comment?: any, typeParameters?: any[]) {
  return {
    parameters: params,
    type: { toString: () => returnType },
    comment,
    typeParameters
  };
}

function mockDecl(name: string, kind: ReflectionKind, overrides: any = {}) {
  return {
    name,
    kind,
    comment: overrides.comment ?? undefined,
    children: overrides.children ?? undefined,
    signatures: overrides.signatures ?? undefined,
    sources: overrides.sources ?? undefined,
    type: overrides.type ?? undefined,
    flags: overrides.flags ?? {},
    extendedTypes: overrides.extendedTypes ?? undefined,
    implementedTypes: overrides.implementedTypes ?? undefined
  };
}

function mockProject(children: any[] = [], documents?: any[]) {
  return { name: 'test-project', comment: undefined, children, documents } as any;
}

// ── extractSkills: single-package (no modules) ───────────────────────────

describe('extractSkills — single package (no modules)', () => {
  it('returns a single ExtractedSkill with the project name', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false);
    expect(skill.name).toBe('test-project');
  });

  it('uses metadata name when provided', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false, { name: 'my-pkg' });
    expect(skill.name).toBe('my-pkg');
  });

  it('passes through keywords, repository, author from metadata', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false, {
      name: 'my-pkg',
      keywords: ['a', 'b'],
      repository: 'https://github.com/x/y',
      author: 'Alice'
    });
    expect(skill.keywords).toEqual(['a', 'b']);
    expect(skill.repository).toBe('https://github.com/x/y');
    expect(skill.author).toBe('Alice');
  });

  it('passes through packageDescription from metadata description', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false, {
      name: 'my-pkg',
      description: 'A helpful library for doing things'
    });
    expect(skill.packageDescription).toBe('A helpful library for doing things');
  });

  it('leaves packageDescription undefined when metadata has no description', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false, { name: 'my-pkg' });
    expect(skill.packageDescription).toBeUndefined();
  });

  it('returns empty arrays for all categories when project has no children', () => {
    const project = mockProject([]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions).toEqual([]);
    expect(skill.classes).toEqual([]);
    expect(skill.types).toEqual([]);
    expect(skill.enums).toEqual([]);
    expect(skill.variables).toEqual([]);
    expect(skill.examples).toEqual([]);
  });
});

// ── Functions ─────────────────────────────────────────────────────────────

describe('extractSkills — functions', () => {
  it('extracts a simple function with name, description, signature, return type', () => {
    const sig = mockSig([], 'string', mockComment('Greets a user'));
    const fn = mockDecl('greet', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);

    expect(skill.functions).toHaveLength(1);
    const f = skill.functions[0];
    expect(f.name).toBe('greet');
    expect(f.description).toBe('Greets a user');
    expect(f.signature).toBe('greet(): string');
    expect(f.returnType).toBe('string');
  });

  it('extracts function parameters (name, type, optional)', () => {
    const params = [mockParam('name', 'string'), mockParam('age', 'number', true)];
    const sig = mockSig(params, 'void');
    const fn = mockDecl('register', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);

    const f = skill.functions[0];
    expect(f.parameters).toHaveLength(2);
    expect(f.parameters[0]).toMatchObject({ name: 'name', type: 'string', optional: false });
    expect(f.parameters[1]).toMatchObject({ name: 'age', type: 'number', optional: true });
    expect(f.signature).toBe('register(name: string, age?: number): void');
  });

  it('extracts @returns description', () => {
    const sig = mockSig([], 'string', mockComment('Does work', [], 'The result string'));
    const fn = mockDecl('work', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].returnsDescription).toBe('The result string');
  });

  it('extracts @example tags from function comments', () => {
    const sig = mockSig([], 'void', mockComment('Example fn', ['greet("Alice")', 'greet("Bob")']));
    const fn = mockDecl('greet', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].examples).toEqual(['greet("Alice")', 'greet("Bob")']);
  });

  it('falls back to decl comment when no signature comment', () => {
    const sig = mockSig([], 'void', undefined);
    const fn = mockDecl('noSigComment', ReflectionKind.Function, {
      signatures: [sig],
      comment: mockComment('Fallback description')
    });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].description).toBe('Fallback description');
  });

  it('extracts function overloads when multiple signatures exist', () => {
    const sig1 = mockSig([mockParam('x', 'string')], 'string');
    const sig2 = mockSig([mockParam('x', 'number')], 'number');
    const fn = mockDecl('parse', ReflectionKind.Function, { signatures: [sig1, sig2] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    const f = skill.functions[0];
    expect(f.overloads).toHaveLength(1);
    expect(f.overloads![0]).toBe('parse(x: number): number');
  });

  it('sets overloads to undefined when only one signature', () => {
    const sig = mockSig([], 'void');
    const fn = mockDecl('single', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].overloads).toBeUndefined();
  });

  it('extracts custom tags into tags map (excludes example/param/returns)', () => {
    const blockTags = [
      { tag: '@since', content: [{ text: '1.0.0' }] },
      { tag: '@deprecated', content: [{ text: 'use newFn' }] },
      { tag: '@example', content: [{ text: 'code()' }] }
    ];
    const sig = mockSig([], 'void', mockComment('Tagged fn', [], undefined, blockTags));
    const fn = mockDecl('taggedFn', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    const tags = skill.functions[0].tags;
    expect(tags['since']).toBe('1.0.0');
    expect(tags['deprecated']).toBe('use newFn');
    expect(tags['example']).toBeUndefined(); // filtered out
  });

  it('returns signature as "name()" when no signature object exists', () => {
    const fn = mockDecl('noSig', ReflectionKind.Function, { signatures: undefined });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].signature).toBe('noSig()');
  });
});

// ── Classes ───────────────────────────────────────────────────────────────

describe('extractSkills — classes', () => {
  it('extracts a class with name and description', () => {
    const cls = mockDecl('MyClass', ReflectionKind.Class, {
      comment: mockComment('A useful class'),
      children: []
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    expect(skill.classes).toHaveLength(1);
    expect(skill.classes[0].name).toBe('MyClass');
    expect(skill.classes[0].description).toBe('A useful class');
  });

  it('extracts public methods and skips private methods', () => {
    const publicMethod = mockDecl('doWork', ReflectionKind.Method, {
      flags: { isPrivate: false },
      signatures: [mockSig([], 'void', mockComment('Does work'))]
    });
    const privateMethod = mockDecl('_internal', ReflectionKind.Method, {
      flags: { isPrivate: true },
      signatures: [mockSig([], 'void')]
    });
    const cls = mockDecl('MyClass', ReflectionKind.Class, {
      children: [publicMethod, privateMethod]
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    const c = skill.classes[0];
    expect(c.methods).toHaveLength(1);
    expect(c.methods[0].name).toBe('doWork');
  });

  it('extracts public properties and skips private properties', () => {
    const publicProp = mockDecl('value', ReflectionKind.Property, {
      flags: { isPrivate: false, isOptional: false },
      type: { toString: () => 'string' },
      comment: mockComment('The value')
    });
    const privateProp = mockDecl('_secret', ReflectionKind.Property, {
      flags: { isPrivate: true, isOptional: false },
      type: { toString: () => 'string' }
    });
    const cls = mockDecl('MyClass', ReflectionKind.Class, {
      children: [publicProp, privateProp]
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    const c = skill.classes[0];
    expect(c.properties).toHaveLength(1);
    expect(c.properties[0].name).toBe('value');
    expect(c.properties[0].type).toBe('string');
  });

  it('extracts constructor signature', () => {
    const ctorSig = mockSig([mockParam('id', 'number')], 'MyClass');
    const ctor = mockDecl('constructor', ReflectionKind.Constructor, {
      signatures: [ctorSig]
    });
    const cls = mockDecl('MyClass', ReflectionKind.Class, {
      children: [ctor]
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    expect(skill.classes[0].constructorSignature).toBe('constructor(id: number): MyClass');
  });

  it('sets constructorSignature to empty string when no constructor', () => {
    const cls = mockDecl('MyClass', ReflectionKind.Class, { children: [] });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    expect(skill.classes[0].constructorSignature).toBe('');
  });

  it('extracts extends and implements', () => {
    const cls = mockDecl('Child', ReflectionKind.Class, {
      children: [],
      extendedTypes: [{ toString: () => 'Base' }],
      implementedTypes: [{ toString: () => 'IFoo' }, { toString: () => 'IBar' }]
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    const c = skill.classes[0];
    expect(c.extends).toBe('Base');
    expect(c.implements).toEqual(['IFoo', 'IBar']);
  });

  it('sets implements to undefined when no implemented types', () => {
    const cls = mockDecl('Solo', ReflectionKind.Class, {
      children: [],
      implementedTypes: []
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    expect(skill.classes[0].implements).toBeUndefined();
  });

  it('extracts class-level @example tags', () => {
    const cls = mockDecl('MyClass', ReflectionKind.Class, {
      comment: mockComment('A class', ['new MyClass()']),
      children: []
    });
    const project = mockProject([cls]);
    const [skill] = extractSkills(project, false);
    expect(skill.classes[0].examples).toEqual(['new MyClass()']);
  });
});

// ── Interfaces (extracted as types) ──────────────────────────────────────

describe('extractSkills — interfaces', () => {
  it('extracts an interface as a type with name and description', () => {
    const iface = mockDecl('MyInterface', ReflectionKind.Interface, {
      comment: mockComment('Describes something'),
      children: []
    });
    const project = mockProject([iface]);
    const [skill] = extractSkills(project, false);
    expect(skill.types).toHaveLength(1);
    expect(skill.types[0].name).toBe('MyInterface');
    expect(skill.types[0].description).toBe('Describes something');
  });

  it('extracts interface properties', () => {
    const prop = mockDecl('id', ReflectionKind.Property, {
      flags: { isOptional: false },
      type: { toString: () => 'number' },
      comment: mockComment('The ID')
    });
    const iface = mockDecl('User', ReflectionKind.Interface, {
      children: [prop]
    });
    const project = mockProject([iface]);
    const [skill] = extractSkills(project, false);
    const t = skill.types[0];
    expect(t.properties).toHaveLength(1);
    expect(t.properties![0]).toMatchObject({
      name: 'id',
      type: 'number',
      description: 'The ID',
      optional: false
    });
  });

  it('extracts optional interface properties', () => {
    const prop = mockDecl('nickname', ReflectionKind.Property, {
      flags: { isOptional: true },
      type: { toString: () => 'string' }
    });
    const iface = mockDecl('User', ReflectionKind.Interface, {
      children: [prop]
    });
    const project = mockProject([iface]);
    const [skill] = extractSkills(project, false);
    expect(skill.types[0].properties![0].optional).toBe(true);
  });

  it('sets properties to undefined when interface has no property children', () => {
    const iface = mockDecl('EmptyIface', ReflectionKind.Interface, {
      children: []
    });
    const project = mockProject([iface]);
    const [skill] = extractSkills(project, false);
    expect(skill.types[0].properties).toBeUndefined();
  });

  it('also extracts TypeAlias as a type', () => {
    const alias = mockDecl('MyAlias', ReflectionKind.TypeAlias, {
      comment: mockComment('A type alias'),
      type: { toString: () => 'string | number' }
    });
    const project = mockProject([alias]);
    const [skill] = extractSkills(project, false);
    expect(skill.types).toHaveLength(1);
    expect(skill.types[0].name).toBe('MyAlias');
    expect(skill.types[0].definition).toBe('string | number');
  });
});

// ── Enums ─────────────────────────────────────────────────────────────────

describe('extractSkills — enums', () => {
  it('extracts an enum with members', () => {
    const memberA = mockDecl('Active', ReflectionKind.EnumMember, {
      type: { toString: () => '0' },
      comment: mockComment('Active state')
    });
    const memberB = mockDecl('Inactive', ReflectionKind.EnumMember, {
      type: { toString: () => '1' }
    });
    const en = mockDecl('Status', ReflectionKind.Enum, {
      comment: mockComment('Status values'),
      children: [memberA, memberB]
    });
    const project = mockProject([en]);
    const [skill] = extractSkills(project, false);
    expect(skill.enums).toHaveLength(1);
    const e = skill.enums[0];
    expect(e.name).toBe('Status');
    expect(e.description).toBe('Status values');
    expect(e.members).toHaveLength(2);
    expect(e.members[0]).toMatchObject({ name: 'Active', value: '0', description: 'Active state' });
    expect(e.members[1]).toMatchObject({ name: 'Inactive', value: '1', description: '' });
  });

  it('returns empty members array for empty enum', () => {
    const en = mockDecl('Empty', ReflectionKind.Enum, { children: [] });
    const project = mockProject([en]);
    const [skill] = extractSkills(project, false);
    expect(skill.enums[0].members).toEqual([]);
  });
});

// ── Variables ─────────────────────────────────────────────────────────────

describe('extractSkills — variables', () => {
  it('extracts a const variable', () => {
    const v = mockDecl('MAX_RETRIES', ReflectionKind.Variable, {
      type: { toString: () => 'number' },
      flags: { isConst: true },
      comment: mockComment('Maximum retries')
    });
    const project = mockProject([v]);
    const [skill] = extractSkills(project, false);
    expect(skill.variables).toHaveLength(1);
    const variable = skill.variables[0];
    expect(variable.name).toBe('MAX_RETRIES');
    expect(variable.type).toBe('number');
    expect(variable.isConst).toBe(true);
    expect(variable.description).toBe('Maximum retries');
  });

  it('extracts a non-const variable', () => {
    const v = mockDecl('counter', ReflectionKind.Variable, {
      type: { toString: () => 'number' },
      flags: { isConst: false }
    });
    const project = mockProject([v]);
    const [skill] = extractSkills(project, false);
    expect(skill.variables[0].isConst).toBe(false);
  });

  it('defaults type to "unknown" when no type provided', () => {
    const v = mockDecl('x', ReflectionKind.Variable, { flags: {} });
    const project = mockProject([v]);
    const [skill] = extractSkills(project, false);
    expect(skill.variables[0].type).toBe('unknown');
  });
});

// ── Documents ─────────────────────────────────────────────────────────────

describe('extractSkills — documents', () => {
  it('extracts documents from project', () => {
    const project = mockProject(
      [],
      [
        { name: 'Guide', content: [{ text: 'Some guide text' }] },
        { name: 'API', content: [{ text: 'API reference' }] }
      ]
    );
    const [skill] = extractSkills(project, false);
    expect(skill.documents).toHaveLength(2);
    expect(skill.documents![0]).toEqual({ title: 'Guide', content: 'Some guide text' });
    expect(skill.documents![1]).toEqual({ title: 'API', content: 'API reference' });
  });

  it('skips documents with no content', () => {
    const project = mockProject(
      [],
      [
        { name: 'Empty', content: [] },
        { name: 'Filled', content: [{ text: 'Content here' }] }
      ]
    );
    const [skill] = extractSkills(project, false);
    // Only 'Filled' should appear (empty content trims to '')
    expect(skill.documents!.find((d) => d.title === 'Filled')).toBeDefined();
    expect(skill.documents!.find((d) => d.title === 'Empty')).toBeUndefined();
  });
});

// ── Per-package grouping with modules ────────────────────────────────────

describe('extractSkills — perPackage mode with modules', () => {
  it('groups modules by name when perPackage=true (no source files for resolution)', () => {
    const modA = mockDecl('pkg-a', ReflectionKind.Module, {
      children: [mockDecl('fnA', ReflectionKind.Function, { signatures: [mockSig([], 'void')] })]
    });
    const modB = mockDecl('pkg-b', ReflectionKind.Module, {
      children: [mockDecl('fnB', ReflectionKind.Function, { signatures: [mockSig([], 'string')] })]
    });
    const project = mockProject([modA, modB]);
    const skills = extractSkills(project, true);
    // Without source files, modules can't resolve package names, so they all
    // merge into the fallback group (project name = 'test-project')
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('test-project');
    expect(skills[0].functions).toHaveLength(2);
    expect(skills[0].functions.map((f) => f.name)).toContain('fnA');
    expect(skills[0].functions.map((f) => f.name)).toContain('fnB');
  });

  it('merges multiple modules under the fallback name when no sources', () => {
    const mod1 = mockDecl('sub-a', ReflectionKind.Module, {
      children: [mockDecl('fn1', ReflectionKind.Function, { signatures: [mockSig([], 'void')] })]
    });
    const mod2 = mockDecl('sub-b', ReflectionKind.Module, {
      children: [mockDecl('fn2', ReflectionKind.Function, { signatures: [mockSig([], 'void')] })]
    });
    const project = mockProject([mod1, mod2]);
    // Without source files, all modules merge under project name
    const skills = extractSkills(project, true);
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('test-project');
    expect(skills[0].functions).toHaveLength(2);
  });

  it('falls back to single-package when no modules present even with perPackage=true', () => {
    const fn = mockDecl('hello', ReflectionKind.Function, { signatures: [mockSig([], 'void')] });
    const project = mockProject([fn]);
    const skills = extractSkills(project, true);
    expect(skills).toHaveLength(1);
    expect(skills[0].functions[0].name).toBe('hello');
  });

  it('uses metadata.name as fallback when module has no source files', () => {
    // In perPackage mode, modules that can't resolve a package name via source
    // files fall back to metadata.name (not mod.name), preventing internal
    // submodules like "array" or "string" from becoming separate skills.
    const mod = mockDecl('internal-name', ReflectionKind.Module, {
      children: []
    });
    const project = mockProject([mod]);
    const skills = extractSkills(project, true, { name: 'override-name' });
    // Falls back to metadata.name, not mod.name
    expect(skills[0].name).toBe('override-name');
  });

  it('collects functions/classes/types/enums/variables from all modules in merged group', () => {
    const mod1 = mockDecl('lib', ReflectionKind.Module, {
      children: [
        mockDecl('MyClass', ReflectionKind.Class, { children: [] }),
        mockDecl('Status', ReflectionKind.Enum, { children: [] })
      ]
    });
    const mod2 = mockDecl('lib', ReflectionKind.Module, {
      children: [
        mockDecl('IFace', ReflectionKind.Interface, { children: [] }),
        mockDecl('MAX', ReflectionKind.Variable, {
          flags: { isConst: true },
          type: { toString: () => 'number' }
        })
      ]
    });
    const project = mockProject([mod1, mod2]);
    const [skill] = extractSkills(project, true);
    expect(skill.classes).toHaveLength(1);
    expect(skill.enums).toHaveLength(1);
    expect(skill.types).toHaveLength(1);
    expect(skill.variables).toHaveLength(1);
  });
});

// ── Mixed children (only correct kinds extracted) ────────────────────────

describe('extractSkills — kind filtering', () => {
  it('only extracts items of matching kind into correct buckets', () => {
    const fn = mockDecl('myFn', ReflectionKind.Function, { signatures: [mockSig([], 'void')] });
    const cls = mockDecl('MyClass', ReflectionKind.Class, { children: [] });
    const iface = mockDecl('IFoo', ReflectionKind.Interface, { children: [] });
    const alias = mockDecl('Alias', ReflectionKind.TypeAlias, {
      type: { toString: () => 'string' }
    });
    const en = mockDecl('Color', ReflectionKind.Enum, { children: [] });
    const v = mockDecl('CONST', ReflectionKind.Variable, {
      flags: { isConst: true },
      type: { toString: () => 'string' }
    });
    const project = mockProject([fn, cls, iface, alias, en, v]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions).toHaveLength(1);
    expect(skill.classes).toHaveLength(1);
    expect(skill.types).toHaveLength(2); // interface + alias
    expect(skill.enums).toHaveLength(1);
    expect(skill.variables).toHaveLength(1);
  });
});

// ── formatSignature with type parameters ─────────────────────────────────

describe('extractSkills — generic function signature', () => {
  it('includes type parameters in the signature', () => {
    const sig = mockSig([mockParam('value', 'T')], 'T', undefined, [{ name: 'T' }]);
    const fn = mockDecl('identity', ReflectionKind.Function, { signatures: [sig] });
    const project = mockProject([fn]);
    const [skill] = extractSkills(project, false);
    expect(skill.functions[0].signature).toBe('identity<T>(value: T): T');
  });
});
