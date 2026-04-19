# Hand-Written Skill Results

## Files created

- SKILL.md: 425 lines
- references/core-classes.md: 531 lines
- references/configuration.md: 412 lines
- references/migration-v8.md: 478 lines
- Total: 1846 lines

## Effort

- Source files read: 15
  - src/app/Application.ts
  - src/scene/container/Container.ts (two passes: lines 1-150, 150-600)
  - src/scene/sprite/Sprite.ts (two passes: 1-100, 100-300)
  - src/scene/graphics/shared/Graphics.ts (two passes: 1-150, 150-350)
  - src/scene/text/Text.ts
  - src/assets/Assets.ts (three passes: 1-100, 100-300, 400-600)
  - src/rendering/renderers/shared/system/AbstractRenderer.ts
  - src/index.docs.ts
  - README.md
  - src/**docs**/concepts/architecture.md
  - src/**docs**/concepts/performance-tips.md
  - src/**docs**/concepts/scene-graph.mdx
  - src/**docs**/concepts/render-groups.md
  - src/**docs**/concepts/garbage-collection.md
  - src/**docs**/migrations/v8.md

## Approach

Read key source files in priority order: Application.ts first (entry point and
init pattern), then Container.ts (base class, all options), Sprite.ts and
Graphics.ts (most commonly used renderables), Text.ts (text rendering), and
Assets.ts (asset loading). Then read the conceptual docs (architecture,
scene-graph, render-groups, performance-tips, garbage-collection) and the v8
migration guide to extract all breaking changes.

SKILL.md covers: YAML frontmatter with WHEN/KEYWORDS, When to Use / Avoid When,
NEVER rules derived directly from code (constructor deprecation, Graphics API
reversal, leaf-node children restriction, Ticker callback signature change, etc.),
a decision table mapping goals to classes, a working Quick Start code example,
ApplicationOptions configuration table, and a Quick Reference covering Container,
Sprite, Graphics, Text, Assets, Ticker, and destroy patterns.

Reference files provide deeper detail: core-classes.md covers Container (full
options, methods, events, culling, RenderGroups), Sprite (creation patterns, UV
update behavior), Graphics (v8 drawing pattern, all shape methods, GraphicsContext
sharing, mask usage), Text/BitmapText/HTMLText comparison, Texture, and
Application. configuration.md covers all Options interfaces (ApplicationOptions,
TextureSource types, AssetsManifest format, FillStyle/StrokeStyle, RenderOptions,
Ticker properties). migration-v8.md covers all 16 breaking change categories with
before/after code examples directly sourced from the migration doc and source code.
