import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Application, Converter, type Context, ParameterType } from 'typedoc';
import type { ExtractedSkill } from '@to-skills/core';
import {
  renderSkills,
  writeSkills,
  renderLlmsTxt,
  auditSkill,
  formatAuditText,
  formatAuditJson,
  parseReadme
} from '@to-skills/core';
import type { AuditContext } from '@to-skills/core';
import { extractSkills } from './extractor.js';

export function load(app: Application): void {
  // --- Options ---

  app.options.addDeclaration({
    name: 'skillsOutDir',
    help: '[Skills] Output directory for generated skill files',
    type: ParameterType.String,
    defaultValue: 'skills'
  });

  app.options.addDeclaration({
    name: 'skillsPerPackage',
    help: '[Skills] Emit one skill per package in a monorepo',
    type: ParameterType.Boolean,
    defaultValue: true
  });

  app.options.addDeclaration({
    name: 'skillsIncludeExamples',
    help: '[Skills] Include usage examples from @example tags',
    type: ParameterType.Boolean,
    defaultValue: true
  });

  app.options.addDeclaration({
    name: 'skillsIncludeSignatures',
    help: '[Skills] Include type signatures in skill output',
    type: ParameterType.Boolean,
    defaultValue: true
  });

  app.options.addDeclaration({
    name: 'skillsMaxTokens',
    help: '[Skills] Maximum approximate token budget per skill file',
    type: ParameterType.Number,
    defaultValue: 4000
  });

  app.options.addDeclaration({
    name: 'skillsNamePrefix',
    help: '[Skills] Custom skill name prefix (default: package name)',
    type: ParameterType.String,
    defaultValue: ''
  });

  app.options.addDeclaration({
    name: 'skillsLicense',
    help: '[Skills] License for generated skills (default: read from package.json)',
    type: ParameterType.String,
    defaultValue: ''
  });

  app.options.addDeclaration({
    name: 'llmsTxt',
    help: '[Skills] Generate llms.txt and llms-full.txt alongside skills',
    type: ParameterType.Boolean,
    defaultValue: false
  });

  app.options.addDeclaration({
    name: 'llmsTxtOutDir',
    help: '[Skills] Output directory for llms.txt files (default: repo root)',
    type: ParameterType.String,
    defaultValue: '.'
  });

  app.options.addDeclaration({
    name: 'skillsAudit',
    help: '[Skills] Run documentation audit during skill generation',
    type: ParameterType.Boolean,
    defaultValue: true
  });

  app.options.addDeclaration({
    name: 'skillsAuditFailOnError',
    help: '[Skills] Fail build on fatal or error severity audit issues',
    type: ParameterType.Boolean,
    defaultValue: false
  });

  app.options.addDeclaration({
    name: 'skillsAuditJson',
    help: "[Skills] Path to write JSON audit report (empty = don't write)",
    type: ParameterType.String,
    defaultValue: ''
  });

  // --- State ---
  // Accumulate skills across converter runs for llms.txt (project-wide).
  // Skills files are written immediately per converter run (per-package scope).
  const allSkills: ExtractedSkill[] = [];
  const pkg = readPackageJson();

  // --- Per-package: extract + write skills immediately ---
  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    const project = context.project;
    const perPackage = app.options.getValue('skillsPerPackage') as boolean;
    const outDir = app.options.getValue('skillsOutDir') as string;
    const license = (app.options.getValue('skillsLicense') as string) || pkg.license || '';

    const skills = extractSkills(project, perPackage, {
      name: pkg.name,
      description: pkg.description,
      keywords: pkg.keywords,
      repository: normalizeRepoUrl(pkg.repository),
      author: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name
    });

    // Accumulate for llms.txt
    allSkills.push(...skills);

    // Render and write this package's skills immediately
    // Each skill writes to skills/<package-name>/ — doesn't touch other packages
    const rendered = renderSkills(skills, {
      outDir,
      includeExamples: app.options.getValue('skillsIncludeExamples') as boolean,
      includeSignatures: app.options.getValue('skillsIncludeSignatures') as boolean,
      maxTokens: app.options.getValue('skillsMaxTokens') as number,
      namePrefix: app.options.getValue('skillsNamePrefix') as string,
      license
    });

    writeSkills(rendered, { outDir });

    for (const skill of rendered) {
      const st = skill.skill.tokens ? ` (~${skill.skill.tokens} tokens)` : '';
      app.logger.info(`[skills] ${skill.skill.filename}${st}`);
      for (const ref of skill.references) {
        const rt = ref.tokens ? ` (~${ref.tokens} tokens)` : '';
        app.logger.info(`[skills]   └─ ${ref.filename}${rt}`);
      }
    }

    // --- Audit ---
    const auditEnabled = app.options.getValue('skillsAudit') as boolean;
    if (auditEnabled) {
      const readmeContent = readReadmeFile();
      const readme = readmeContent ? parseReadme(readmeContent) : undefined;

      const auditContext: AuditContext = {
        packageDescription: pkg.description,
        keywords: pkg.keywords,
        repository: normalizeRepoUrl(pkg.repository),
        readme
      };

      for (const skill of skills) {
        const auditResult = auditSkill(skill, auditContext);
        const text = formatAuditText(auditResult);

        // Log each line with appropriate severity
        for (const line of text.split('\n')) {
          if (line.includes('FATAL') || line.includes('ERROR')) {
            app.logger.warn(line);
          } else if (line.trim()) {
            app.logger.info(line);
          }
        }

        // Write JSON report if configured
        const jsonPath = app.options.getValue('skillsAuditJson') as string;
        if (jsonPath) {
          writeFileSync(jsonPath, formatAuditJson(auditResult), 'utf-8');
          app.logger.info(`[audit] JSON report written to ${jsonPath}`);
        }

        // Fail build if configured and there are fatal/error issues
        const failOnError = app.options.getValue('skillsAuditFailOnError') as boolean;
        if (failOnError && (auditResult.summary.fatal > 0 || auditResult.summary.error > 0)) {
          app.logger.error(
            `[audit] Build failed: ${auditResult.summary.fatal} fatal, ${auditResult.summary.error} error issues found`
          );
        }
      }
    }
  });

  // --- Project-wide: write llms.txt once after all packages ---
  app.renderer.postRenderAsyncJobs.push(async () => {
    const llmsEnabled = app.options.getValue('llmsTxt') as boolean;
    if (!llmsEnabled || allSkills.length === 0) return;

    const llmsOutDir = app.options.getValue('llmsTxtOutDir') as string;
    const result = renderLlmsTxt(allSkills, {
      projectName: pkg.name || 'project',
      projectDescription: pkg.description || ''
    });

    mkdirSync(llmsOutDir, { recursive: true });

    const summaryPath = join(llmsOutDir, 'llms.txt');
    writeFileSync(summaryPath, result.summary, 'utf-8');
    app.logger.info(`[llms-txt] ${summaryPath} (~${result.summaryTokens} tokens)`);

    const fullPath = join(llmsOutDir, 'llms-full.txt');
    writeFileSync(fullPath, result.full, 'utf-8');
    app.logger.info(`[llms-txt] ${fullPath} (~${result.fullTokens} tokens)`);
  });
}

interface PackageJson {
  name?: string;
  description?: string;
  license?: string;
  keywords?: string[];
  repository?: string | { type?: string; url?: string };
  author?: string | { name?: string };
}

function readPackageJson(): PackageJson {
  try {
    const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf-8');
    return JSON.parse(raw) as PackageJson;
  } catch {
    return {};
  }
}

function normalizeRepoUrl(repo: PackageJson['repository']): string | undefined {
  if (!repo) return undefined;
  if (typeof repo === 'string') return repo;
  const url = repo.url;
  if (!url) return undefined;
  return url.replace(/^git\+/, '').replace(/\.git$/, '');
}

function readReadmeFile(): string | undefined {
  const names = ['README.md', 'readme.md', 'Readme.md'];
  for (const name of names) {
    const readmePath = join(process.cwd(), name);
    if (existsSync(readmePath)) {
      try {
        return readFileSync(readmePath, 'utf-8');
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
