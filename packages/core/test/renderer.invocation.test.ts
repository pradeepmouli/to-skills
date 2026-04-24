import { describe, expect, it, vi } from 'vitest';
import { canonicalize, renderSkill, renderSkills } from '@to-skills/core';
import type {
  AdapterRenderContext,
  ExtractedSkill,
  InvocationAdapter,
  RenderedSkill
} from '@to-skills/core';

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

describe('renderSkill — invocation hook', () => {
  it('returns same shape as today when invocation is absent (synchronous)', () => {
    const out = renderSkill(minimalSkill);
    expect(out).toHaveProperty('skill.filename', 'my-lib/SKILL.md');
    expect(out.skill.content).toContain('name: my-lib');
    expect(out.skill.content).toContain('description: A test library');
  });

  it('canonicalizes default-path output — canonicalize(output) equals output', () => {
    const out = renderSkill(minimalSkill);
    const recanonicalized = canonicalize(out);
    expect(recanonicalized.skill.content).toBe(out.skill.content);
    expect(recanonicalized.references.length).toBe(out.references.length);
    for (let i = 0; i < out.references.length; i++) {
      expect(recanonicalized.references[i]!.content).toBe(out.references[i]!.content);
    }
  });

  it('delegates to invocation.render when present and passes a correct AdapterRenderContext', async () => {
    const fakeRendered: RenderedSkill = {
      skill: { filename: 'my-lib/SKILL.md', content: '---\nz: 1\na: 2\n---\n\n\nbody   \n' },
      references: []
    };
    const render = vi.fn(
      async (_skill: ExtractedSkill, _ctx: AdapterRenderContext) => fakeRendered
    );
    const adapter: InvocationAdapter = {
      target: 'mcp-protocol',
      fingerprint: { adapter: '@to-skills/target-mcp-protocol', version: '0.0.0-test' },
      render
    };

    const out = await renderSkill(minimalSkill, { invocation: adapter, maxTokens: 1234 });

    expect(render).toHaveBeenCalledTimes(1);
    const [passedSkill, passedCtx] = render.mock.calls[0]!;
    expect(passedSkill).toBe(minimalSkill);
    expect(passedCtx.skillName).toBe('my-lib');
    expect(passedCtx.maxTokens).toBe(1234);
    expect(passedCtx.canonicalize).toBe(true);
    expect(passedCtx.packageName).toBeUndefined();

    // Result is canonicalized: keys sorted, whitespace normalized.
    expect(out.skill.content.startsWith('---\na: 2\nz: 1\n---\n')).toBe(true);
    // Idempotent under a second pass.
    expect(canonicalize(out).skill.content).toBe(out.skill.content);
  });

  it('honors namePrefix when building AdapterRenderContext.skillName', async () => {
    const render = vi.fn(
      async (_s: ExtractedSkill, _c: AdapterRenderContext): Promise<RenderedSkill> => ({
        skill: { filename: 's/SKILL.md', content: '---\nname: s\n---\n' },
        references: []
      })
    );
    const adapter: InvocationAdapter = {
      target: 'mcp-protocol',
      fingerprint: { adapter: 'x', version: '0' },
      render
    };
    await renderSkill(minimalSkill, { invocation: adapter, namePrefix: 'custom-name' });
    expect(render.mock.calls[0]![1].skillName).toBe('custom-name');
  });

  // Type-guard: renderSkills must reject an invocation adapter at compile time.
  // This is a compile-time assertion, not a runtime one — if the file type-checks,
  // the guard is in place. The runtime body is a no-op.
  it('renderSkills rejects invocation adapter at compile time', () => {
    const skills: ExtractedSkill[] = [];
    const opts = {
      outDir: '.',
      includeExamples: true,
      includeSignatures: true,
      maxTokens: 4000,
      namePrefix: '',
      license: 'MIT'
    };
    const adapter: InvocationAdapter = {
      target: 'mcp-protocol',
      fingerprint: { adapter: 'x', version: '0' },
      render: async () => ({ skill: { filename: 's/SKILL.md', content: '' }, references: [] })
    };
    // @ts-expect-error — invocation should be disallowed on renderSkills options
    renderSkills(skills, { ...opts, invocation: adapter });
    // If the above @ts-expect-error DOESN'T trigger, this test will fail the build.
    expect(true).toBe(true);
  });
});
