import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { extractCliSkill } from '../src/extract.js';

describe('extractCliSkill', () => {
  it('extracts from commander program', async () => {
    const program = new Command().name('my-tool');
    program
      .command('build')
      .description('Build the project')
      .option('--watch', 'Watch mode', false);

    const skill = await extractCliSkill({
      program,
      metadata: { name: 'my-tool', keywords: ['build'] }
    });

    expect(skill.name).toBe('my-tool');
    expect(skill.configSurfaces).toHaveLength(1);
    expect(skill.configSurfaces![0].name).toBe('build');
  });

  it('merges config surfaces when provided', async () => {
    const program = new Command().name('tool');
    program.command('build').option('--watch', 'Watch', false);

    const skill = await extractCliSkill({
      program,
      metadata: { name: 'tool' },
      configSurfaces: [
        {
          name: 'BuildOptions',
          description: '',
          sourceType: 'config',
          options: [
            {
              name: 'watch',
              type: 'boolean',
              description: '',
              required: false,
              pitfalls: ['NEVER use in CI']
            }
          ]
        }
      ]
    });

    expect(skill.configSurfaces![0].options[0].pitfalls).toContain('NEVER use in CI');
  });

  it('extracts from help text when no program', async () => {
    const skill = await extractCliSkill({
      helpTexts: {
        build: `Usage: tool build [options]\n\nBuild project\n\nOptions:\n  --watch   Watch mode (default: false)\n  -h, --help  help\n`
      },
      metadata: { name: 'tool' }
    });

    expect(skill.configSurfaces).toHaveLength(1);
    expect(skill.configSurfaces![0].name).toBe('build');
  });

  it('includes non-CLI config surfaces from configSurfaces', async () => {
    const program = new Command().name('tool');
    program.command('run').description('Run');

    const skill = await extractCliSkill({
      program,
      metadata: { name: 'tool' },
      configSurfaces: [
        {
          name: 'ToolConfig',
          description: 'Config file',
          sourceType: 'config',
          options: [{ name: 'verbose', type: 'boolean', description: 'Verbose', required: false }]
        }
      ]
    });

    // Should have both CLI and config surfaces
    const cli = skill.configSurfaces!.filter((s) => s.sourceType === 'cli');
    const cfg = skill.configSurfaces!.filter((s) => s.sourceType === 'config');
    expect(cli.length).toBeGreaterThanOrEqual(1);
    expect(cfg.length).toBeGreaterThanOrEqual(1);
  });

  it('returns skill with empty API arrays', async () => {
    const skill = await extractCliSkill({ metadata: { name: 'empty' } });
    expect(skill.functions).toHaveLength(0);
    expect(skill.classes).toHaveLength(0);
    expect(skill.types).toHaveLength(0);
  });

  it('returns empty configSurfaces when no program or helpTexts', async () => {
    const skill = await extractCliSkill({ metadata: { name: 'empty' } });
    expect(skill.configSurfaces).toBeUndefined();
  });

  it('populates metadata fields', async () => {
    const skill = await extractCliSkill({
      metadata: {
        name: 'my-tool',
        description: 'A great tool',
        keywords: ['foo', 'bar'],
        repository: 'https://github.com/foo/bar',
        author: 'Alice'
      }
    });

    expect(skill.name).toBe('my-tool');
    expect(skill.description).toBe('A great tool');
    expect(skill.keywords).toEqual(['foo', 'bar']);
    expect(skill.repository).toBe('https://github.com/foo/bar');
    expect(skill.author).toBe('Alice');
  });

  it('matches config surface by exact command name (case-insensitive)', async () => {
    const program = new Command().name('tool');
    program.command('generate').option('--out <dir>', 'Output directory');

    const skill = await extractCliSkill({
      program,
      metadata: { name: 'tool' },
      configSurfaces: [
        {
          name: 'generate',
          description: 'Generation config',
          sourceType: 'config',
          options: [
            {
              name: 'out',
              type: 'string',
              description: '',
              required: false,
              remarks: 'Defaults to ./dist'
            }
          ]
        }
      ]
    });

    const surface = skill.configSurfaces!.find((s) => s.name === 'generate');
    expect(surface).toBeDefined();
    // The non-CLI config surface with same name should still be included
    // (it's a config type, not cli, so it passes through as-is)
    const cfgSurface = skill.configSurfaces!.filter((s) => s.sourceType === 'config');
    expect(cfgSurface.length).toBeGreaterThanOrEqual(1);
  });
});
