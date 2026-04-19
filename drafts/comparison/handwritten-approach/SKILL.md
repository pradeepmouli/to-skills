---
name: pixijs-v8
description: PixiJS v8 — fast 2D WebGL/WebGPU renderer. Use when building interactive graphics, games, or data visualizations in the browser. Covers Application setup, scene graph, sprites, graphics, text, and asset loading.
---

# PixiJS v8 Skill

## When to Use

- Building 2D games, interactive experiences, or animated UIs in the browser
- Rendering many sprites, particles, or animated objects at high frame rates
- Need hardware-accelerated 2D graphics with WebGL or WebGPU

## Avoid When

- Simple static UI — use CSS/HTML instead
- Server-side rendering without a canvas environment
- 3D scenes — use Three.js or Babylon.js instead

---

## Critical Pitfalls (NEVER rules)

**NEVER pass options to the `Application` constructor — always use `await app.init()`.**

```ts
// WRONG (deprecated, triggers warning in v8)
const app = new Application({ width: 800 });

// RIGHT
const app = new Application();
await app.init({ width: 800, height: 600 });
```

**NEVER use `app.view` — it was renamed to `app.canvas`.**

```ts
// WRONG
document.body.appendChild(app.view);

// RIGHT
document.body.appendChild(app.canvas);
```

**NEVER use `Texture.from(url)` to load a URL that hasn't been loaded yet — load through `Assets` first.**

```ts
// WRONG — will return empty texture if not preloaded
const tex = Texture.from('https://example.com/sprite.png');

// RIGHT
await Assets.load('https://example.com/sprite.png');
const tex = Texture.from('https://example.com/sprite.png');
// Or simply:
const tex = await Assets.load<Texture>('sprite.png');
```

**NEVER use the v7 Graphics API (beginFill / drawRect / endFill) — v8 changed the order.**

```ts
// WRONG (v7 style)
g.beginFill(0xff0000).drawRect(0, 0, 100, 100).endFill();

// RIGHT (v8 style: shape first, then fill/stroke)
g.rect(0, 0, 100, 100).fill(0xff0000);
```

**NEVER add children to leaf nodes (Sprite, Graphics, Text) — only `Container` accepts children.**

```ts
// WRONG
const sprite = new Sprite(texture);
sprite.addChild(otherSprite); // deprecated / will warn

// RIGHT
const container = new Container();
container.addChild(sprite);
container.addChild(otherSprite);
```

**NEVER use `DisplayObject` — it was removed. Everything is a `Container`.**

**NEVER use `container.name` — it was renamed to `container.label`.**

**NEVER use `SCALE_MODES.NEAREST` enum — use the string `'nearest'` instead.**

**NEVER use `container.cacheAsBitmap = true` — call `container.cacheAsTexture(true)` instead.**

**NEVER use `container.getBounds()` expecting a `Rectangle` — v8 returns a `Bounds` object; use `.rectangle`.**

```ts
const rect = container.getBounds().rectangle;
```

**NEVER use `Ticker.shared.add(dt => ...)` expecting delta time — the callback now receives the Ticker instance.**

```ts
// WRONG
Ticker.shared.add((dt) => {
  sprite.x += dt;
});

// RIGHT
Ticker.shared.add((ticker) => {
  sprite.x += ticker.deltaTime;
});
```

**NEVER import from sub-packages like `@pixi/sprite` — v8 uses a single package.**

```ts
// WRONG
import { Sprite } from '@pixi/sprite';

// RIGHT
import { Sprite } from 'pixi.js';
```

**NEVER use `utils.isMobile` — import directly.**

```ts
// WRONG
import { utils } from 'pixi.js';
utils.isMobile.any();

// RIGHT
import { isMobile } from 'pixi.js';
isMobile.any();
```

**NEVER use `settings.RESOLUTION` — configure via `AbstractRenderer.defaultOptions` or init options.**

```ts
// WRONG
settings.RESOLUTION = 2;

// RIGHT
await app.init({ resolution: window.devicePixelRatio });
```

**NEVER use `updateTransform()` for per-frame logic — use `onRender` instead.**

```ts
// RIGHT
mySprite.onRender = () => {
  /* custom per-frame logic */
};
```

**NEVER use `ParticleContainer` with `Sprite` children — v8 requires `Particle` objects.**

```ts
// WRONG
container.addChild(new Sprite(texture));

// RIGHT
container.addParticle(new Particle(texture));
```

---

## Key Classes — Decision Table

| Goal                          | Class to Use                           | Notes                                              |
| ----------------------------- | -------------------------------------- | -------------------------------------------------- |
| App scaffolding               | `Application`                          | Manages renderer + stage + ticker                  |
| Group/layer objects           | `Container`                            | Only class that accepts children                   |
| Display an image/texture      | `Sprite`                               | Fastest renderable; use spritesheets               |
| Draw shapes programmatically  | `Graphics`                             | v8: shape→fill order; shares `GraphicsContext`     |
| Canvas-rendered text          | `Text`                                 | Flexible styling; expensive if updated every frame |
| High-perf static/dynamic text | `BitmapText`                           | GPU-batched; best for score counters, labels       |
| HTML/CSS styled text          | `HTMLText`                             | Rich formatting; slower than canvas text           |
| 10k+ particles                | `ParticleContainer` + `Particle`       | Flat list, no children, requires `boundsArea`      |
| Custom rendering batch        | `Mesh`                                 | Full shader control                                |
| 9-slice UI panel              | `NineSliceSprite`                      | Renamed from NineSlicePlane in v8                  |
| Tiling background             | `TilingSprite`                         | Repeating texture                                  |
| Load assets                   | `Assets` (static)                      | Global singleton, cached, async                    |
| GPU-optimized sub-tree        | `Container` with `isRenderGroup: true` | Transforms applied on GPU                          |

---

## Quick Start

```ts
import { Application, Assets, Sprite } from 'pixi.js';

// 1. Create and initialize the app (MUST await)
const app = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio,
  autoDensity: true
});

// 2. Add canvas to the DOM
document.body.appendChild(app.canvas);

// 3. Load assets via Assets (returns cached textures on repeat calls)
const texture = await Assets.load('bunny.png');

// 4. Create a sprite and add to stage
const bunny = new Sprite(texture);
bunny.anchor.set(0.5); // center anchor
bunny.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(bunny);

// 5. Animate with ticker
app.ticker.add((ticker) => {
  bunny.rotation += 0.05 * ticker.deltaTime;
});
```

---

## ApplicationOptions (key fields)

| Option                         | Type                              | Default    | Description                              |
| ------------------------------ | --------------------------------- | ---------- | ---------------------------------------- |
| `width`                        | `number`                          | `800`      | Canvas width in pixels                   |
| `height`                       | `number`                          | `600`      | Canvas height in pixels                  |
| `backgroundColor`              | `ColorSource`                     | `0x000000` | Background fill color                    |
| `backgroundAlpha`              | `number`                          | `1`        | Background alpha (0 = transparent)       |
| `antialias`                    | `boolean`                         | `false`    | Enable MSAA antialiasing                 |
| `resolution`                   | `number`                          | `1`        | Device pixel ratio                       |
| `autoDensity`                  | `boolean`                         | `false`    | Auto-adjust CSS size to match resolution |
| `preference`                   | `'webgl' \| 'webgpu' \| 'canvas'` | `'webgl'`  | Renderer preference                      |
| `resizeTo`                     | `Window \| HTMLElement`           | —          | Auto-resize to element                   |
| `autoStart`                    | `boolean`                         | `true`     | Start ticker automatically               |
| `sharedTicker`                 | `boolean`                         | `false`    | Use shared global ticker                 |
| `manageImports`                | `boolean`                         | `true`     | Auto-import default extensions           |
| `textureGCActive`              | `boolean`                         | `true`     | Enable texture garbage collection        |
| `textureGCMaxIdle`             | `number`                          | `3600`     | Frames before texture GC                 |
| `roundPixels`                  | `boolean`                         | `false`    | Force pixel-rounding on renderer         |
| `failIfMajorPerformanceCaveat` | `boolean`                         | `false`    | Fail on GPU denylist                     |

---

## Quick Reference

### Container (base class for all scene objects)

```ts
// Transform
container.x = 100; container.y = 200;
container.position.set(100, 200);
container.scale.set(2);           // uniform scale
container.rotation = Math.PI / 4; // radians
container.angle = 45;             // degrees (alias)
container.pivot.set(50, 50);      // rotation origin (local coords)
container.origin.set(50, 50);     // rotate around point without offset

// Appearance
container.alpha = 0.5;
container.visible = false;        // skips draw + transform
container.renderable = false;     // skips draw, keeps transform
container.tint = 0xff0000;        // red tint
container.blendMode = 'add';

// Children
container.addChild(child);
container.removeChild(child);
container.addChildAt(child, 0);
container.setChildIndex(child, 2);
container.sortableChildren = true;
child.zIndex = 10;

// Bounds
const bounds = container.getBounds().rectangle; // returns Bounds, use .rectangle
container.boundsArea = new Rectangle(0, 0, 400, 400); // optimization

// Culling
container.cullable = true;
container.cullArea = new Rectangle(0, 0, 400, 400);
container.cullableChildren = false;

// Events
container.on('pointerdown', (e) => { ... });
container.eventMode = 'static';  // 'none' | 'passive' | 'auto' | 'static' | 'dynamic'
container.interactiveChildren = false; // skip hit-testing children

// Utility
const globalPos = container.toGlobal(new Point(0, 0));
const localPos  = container.toLocal(new Point(100, 100));
container.label = 'myContainer';   // was .name in v7
container.onRender = () => { /* per-frame logic */ }; // replaces updateTransform

// Performance
const rg = new Container({ isRenderGroup: true }); // GPU-side transforms
container.cacheAsTexture(true); // was cacheAsBitmap in v7
```

### Sprite

```ts
// Creation
const sprite = new Sprite(texture);
const sprite = Sprite.from('image.png'); // requires texture already loaded via Assets
const sprite = new Sprite({ texture, anchor: 0.5, roundPixels: true });

// Anchor (0=top-left, 0.5=center, 1=bottom-right)
sprite.anchor.set(0.5);
sprite.anchor.set(0.5, 0);

// Size
sprite.width = 100;
sprite.height = 200;

// Texture swap
sprite.texture = newTexture;
// After manual UV modification, force update:
sprite.onViewUpdate();
```

### Graphics

```ts
const g = new Graphics();

// v8 pattern: build shape THEN apply fill/stroke
g.rect(x, y, w, h).fill(0xff0000);
g.rect(x, y, w, h).fill({ color: 0xff0000, alpha: 0.5 });
g.rect(x, y, w, h).fill({ texture: myTexture }).stroke({ width: 2, color: 'white' });

// Shapes
g.circle(cx, cy, radius).fill(0x00ff00);
g.ellipse(cx, cy, rx, ry).fill(color);
g.roundRect(x, y, w, h, radius).fill(color);
g.poly([x1, y1, x2, y2, x3, y3]).fill(color);
g.moveTo(x, y).lineTo(x2, y2).stroke({ width: 2, color: 0xffffff });

// Holes (cut = hollow out previous shape)
g.rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();

// Shared context (draw once, render many)
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx); // same GPU data, different transforms

// As mask
sprite.mask = g;
```

### Text / BitmapText / HTMLText

```ts
// Canvas text — flexible, expensive to update
const text = new Text({
  text: 'Hello!',
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xff1010,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: 200,
    stroke: { color: '#4a1850', width: 5 },
    dropShadow: { color: '#000000', blur: 4, distance: 6, angle: Math.PI / 6 }
  },
  anchor: 0.5
});

// BitmapText — best for score counters, frequently updated labels
const bmpText = new BitmapText({ text: '0', style: { fontFamily: 'Arial', fontSize: 24 } });

// HTMLText — rich HTML markup support
const htmlText = new HTMLText({ text: '<b>Bold</b> and <i>italic</i>' });

// Constructor change from v7:
// OLD: new Text('Hello', { fontSize: 24 })
// NEW: new Text({ text: 'Hello', style: { fontSize: 24 } })
```

### Assets

```ts
// Load single asset
const texture = await Assets.load<Texture>('sprite.png');

// Load multiple
const assets = await Assets.load(['a.png', 'b.png']);

// With alias
Assets.add({ alias: 'hero', src: 'hero.{webp,png}' });
const texture = await Assets.load('hero');

// Bundles
await Assets.init({
  manifest: {
    bundles: [{ name: 'game', assets: [{ alias: 'bg', src: 'bg.png' }] }]
  }
});
await Assets.loadBundle('game');

// Background preload
Assets.backgroundLoad(['next-level.png']);

// Unload
await Assets.unload('sprite.png');
texture.source.unload(); // manual GPU unload
```

### Ticker

```ts
// App ticker (runs automatically)
app.ticker.add((ticker) => {
  sprite.rotation += 0.05 * ticker.deltaTime; // deltaTime = frame delta in ticks
});

// Shared global ticker
import { Ticker } from 'pixi.js';
Ticker.shared.add((ticker) => { ... });
Ticker.shared.remove(myFn);

// Manual control
app.ticker.stop();
app.ticker.start();
```

### Destroy / Cleanup

```ts
// Sprite only (preserves texture)
sprite.destroy();

// Sprite + texture
sprite.destroy({ texture: true, textureSource: true });

// Container tree
container.destroy({ children: true });

// Full app teardown
app.destroy({ removeView: true }, { children: true, texture: true });

// Unload via Assets (removes from cache + GPU)
await Assets.unload('sprite.png');
```

---

## References

- [Core Classes](references/core-classes.md) — Container, Sprite, Graphics, Text details
- [Configuration](references/configuration.md) — all Options interfaces
- [Migration v7→v8](references/migration-v8.md) — breaking changes
