# @to-skills/vitepress

## 0.2.7

### Patch Changes

- Updated dependencies [[`f9cc01d`](https://github.com/pradeepmouli/to-skills/commit/f9cc01dc46bfe00467afe4e82eec6b557ca8e3f3)]:
  - @to-skills/core@0.13.0

## 0.2.6

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.12.0

## 0.2.5

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.11.1

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.11.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.10.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.10.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @to-skills/core@0.10.1

## 0.2.0

### Minor Changes

- VitePress plugin for AI agent skill generation
  - Vite plugin registered in .vitepress/config.mts vite.plugins array
  - Receives VitePress config via config.vitepress.site (sidebar, srcDir, title)
  - Sidebar-driven document ordering — no frontmatter heuristics
  - Generates skills at closeBundle with core's renderSkill + writeSkills
  - Sidebar walker extracts ordered doc paths from array or object sidebars
