# @to-skills/vitepress

> VitePress plugin for AI agent skill generation — uses sidebar for document ordering.

Part of the [to-skills](https://github.com/pradeepmouli/to-skills) ecosystem.

## Install

```bash
pnpm add -D @to-skills/vitepress
```

## Usage

```typescript
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { toSkills } from '@to-skills/vitepress'

export default defineConfig({
  vite: {
    plugins: [toSkills({ skillsOutDir: 'skills' })]
  },
  themeConfig: { sidebar: [...] }
})
```

## License

MIT
