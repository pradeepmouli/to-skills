import { defineConfig } from 'vitepress';
import { toSkills } from '@to-skills/vitepress';

export default defineConfig({
  title: 'to-skills',
  description: 'Generate AI agent skills from TypeScript documentation',
  lastUpdated: true,
  sitemap: {
    hostname: 'https://pradeepmouli.github.io/to-skills/',
  },
  head: [
    ['meta', { name: 'keywords', content: 'to-skills, agent skills, SKILL.md, TypeDoc, AI, LLM, documentation, JSDoc, TypeScript, skill generation' }],
    ['meta', { property: 'og:title', content: 'to-skills — Compile-time AI agent skill generation' }],
    ['meta', { property: 'og:description', content: 'Inline docs, CLI definitions, config schemas, and examples compile into progressively disclosed SKILL.md files that any LLM can discover.' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],

  vite: {
    plugins: [
      toSkills({
        skillsOutDir: '../skills',
        name: 'to-skills-docs',
        license: 'MIT',
      }),
    ],
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is to-skills?', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
          ],
        },
        {
          text: 'Guide',
          items: [
            { text: 'JSDoc Conventions', link: '/guide/conventions' },
            { text: 'Documentation Audit', link: '/guide/audit' },
            { text: 'CLI Extraction', link: '/guide/cli-extraction' },
            { text: 'Markdown Docs', link: '/guide/markdown-docs' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/pradeepmouli/to-skills' },
    ],
  },
});
