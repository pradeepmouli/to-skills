import { defineConfig } from 'vitepress';
import { toSkills } from '@to-skills/vitepress';

export default defineConfig({
  title: 'to-skills',
  description: 'Generate AI agent skills from TypeScript documentation',

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
