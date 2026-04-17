---
name: pixi-js
description: PixiJS v8 — fast 2D WebGL/WebGPU rendering engine. Covers Application setup, scene graph, sprites, graphics, text, assets, filters, events, and the ticker system.
---

# PixiJS v8

PixiJS is a 2D rendering engine for the web. It renders to `<canvas>` using WebGL, WebGPU, or the Canvas 2D API. Version 8 is a single-package rewrite with async initialization, a new Graphics API, and first-class WebGPU support.

## When to Use

@useWhen building any 2D browser experience that needs hardware-accelerated rendering: games, data visualizations, interactive tools, animated UIs, or creative coding experiments.

@avoidWhen building 3D scenes (use Three.js), static document layouts (use CSS/HTML), or server-side rendering.

## Critical v8 Rules

- **NEVER pass options to the `Application` constructor** -- v8 initialization is async. Always call `await app.init(options)`.
- **NEVER access `app.renderer` before `init()` resolves** -- it is `undefined` until the promise settles.
- **NEVER use the v7 Graphics API** (`beginFill`, `drawRect`, `endFill`, `lineStyle`). v8 uses a chainable shape-then-fill API: `.rect().fill().stroke()`.
- **NEVER import from `@pixi/` sub-packages** -- v8 is a single package. Always `import { ... } from 'pixi.js'`.
- **NEVER create Sprites from unloaded textures** -- always `await Assets.load()` first or use `Sprite.from()` only for already-cached textures.
- **NEVER change `Text` content every frame** -- it re-rasterizes to a canvas texture. Use `BitmapText` for dynamic scores/timers.
- **NEVER rebuild `Graphics` geometry every frame** -- it rebuilds the mesh. Use `cacheAsTexture()` or `generateTexture()` for static shapes.
- **NEVER add a container to itself** -- creates an infinite loop.
- **NEVER forget `destroy()`** -- PixiJS objects hold GPU resources. Leaking them causes memory growth.

## Package Structure

```ts
// All imports from the single package
import { Application, Sprite, Graphics, Text, Assets, Container, Ticker } from 'pixi.js';

// Optional sub-exports (not imported by default)
import 'pixi.js/advanced-blend-modes';
import 'pixi.js/unsafe-eval';
import 'pixi.js/prepare';
import 'pixi.js/math-extras';
```

When creating an Application with `manageImports: false`, you must manually import the extensions you need (see references/configuration.md).

## Application Bootstrap

```ts
import { Application, Assets, Sprite } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  antialias: true,
  preference: 'webgl' // 'webgl' | 'webgpu' | 'canvas' or array
});

document.body.appendChild(app.canvas);

// Load assets BEFORE creating display objects
const texture = await Assets.load('bunny.png');
const sprite = new Sprite(texture);
sprite.anchor.set(0.5);
sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);

// Animation loop via ticker (auto-started by default)
app.ticker.add((ticker) => {
  sprite.rotation += 0.1 * ticker.deltaTime;
});
```

## Scene Graph

Everything visible descends from `Container`. The `app.stage` is the root.

| Class               | @useWhen                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| `Container`         | Grouping children for shared transforms, visibility, masking, or filtering |
| `Sprite`            | Displaying loaded images or texture atlas frames -- fast batched rendering |
| `Graphics`          | Drawing shapes, lines, curves programmatically; creating masks             |
| `Text`              | Canvas-rendered rich text (font families, drop shadows, stroke)            |
| `BitmapText`        | High-performance text from pre-rendered bitmap fonts (scores, HUDs)        |
| `HTMLText`          | HTML/CSS-rendered text with `<b>`, `<i>`, custom tag styles                |
| `TilingSprite`      | Repeating/scrolling backgrounds                                            |
| `NineSliceSprite`   | Scalable UI panels that preserve corner/edge detail                        |
| `AnimatedSprite`    | Frame-by-frame sprite animation from spritesheet                           |
| `Mesh`              | Custom geometry with vertex data and shaders                               |
| `ParticleContainer` | Ultra-fast rendering of 100k+ lightweight particles                        |
| `RenderLayer`       | Controlling draw order independently of scene hierarchy                    |
| `DOMContainer`      | Embedding HTML DOM elements in the PixiJS scene graph                      |

See references/core-classes.md for detailed API signatures and examples.

## Assets

```ts
// Initialize with a manifest for production apps
await Assets.init({
  manifest: {
    bundles: [
      {
        name: 'game-screen',
        assets: [
          { alias: 'hero', src: 'hero.{webp,png}' },
          { alias: 'spritesheet', src: 'sprites.json' }
        ]
      }
    ]
  }
});

// Load a bundle with progress
await Assets.loadBundle('game-screen', (progress) => {
  console.log(`${Math.round(progress * 100)}%`);
});

// Retrieve cached assets
const heroTexture = Assets.get('hero');

// Background loading for next screen
Assets.backgroundLoadBundle('next-screen');
```

Key points:

- `Assets.load()` returns a promise. The resolved value is the parsed asset (Texture, Spritesheet, JSON, etc.).
- Use `Assets.init({ basePath })` for CDN prefixes.
- Format negotiation: `'hero.{avif,webp,png}'` picks the best format the browser supports.
- Spritesheets: loading a `.json` atlas auto-creates `Texture` objects for each frame.

## Graphics (v8 API)

The v8 Graphics API is **shape-first, then fill/stroke**. This is the single biggest API change from v7.

```ts
const g = new Graphics();

// Rectangle with fill and stroke
g.rect(0, 0, 200, 100).fill({ color: 0xff0000, alpha: 0.8 }).stroke({ width: 2, color: 0x000000 });

// Circle
g.circle(150, 150, 50).fill('blue');

// Rounded rectangle
g.roundRect(10, 10, 200, 100, 15).fill(0x00ff00);

// Path drawing
g.moveTo(0, 0).lineTo(100, 0).lineTo(100, 100).closePath().fill({ color: 0xffff00, alpha: 0.5 });

// Holes via cut()
g.rect(0, 0, 200, 200).fill(0x00ff00).circle(100, 100, 40).cut();

// Gradient fill
const gradient = new FillGradient({
  end: { x: 1, y: 0 },
  colorStops: [
    { offset: 0, color: 0xff0000 },
    { offset: 1, color: 0x0000ff }
  ]
});
g.rect(0, 0, 200, 100).fill(gradient);
```

Share geometry efficiently with `GraphicsContext`:

```ts
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);

const g1 = new Graphics(ctx); // shares GPU geometry
const g2 = new Graphics(ctx); // zero extra cost
```

## Text

```ts
// Canvas text (rich styling, expensive to update)
const text = new Text({
  text: 'Hello PixiJS!',
  style: {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xff1010,
    stroke: { color: '#4a1850', width: 5 },
    dropShadow: { color: '#000000', blur: 4, distance: 6 },
    wordWrap: true,
    wordWrapWidth: 300
  }
});

// BitmapText (fast updates, ideal for HUDs)
const score = new BitmapText({
  text: 'Score: 0',
  style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
});

// HTMLText (supports <b>, <i>, custom tags)
const html = new HTMLText({
  text: '<b>Bold</b> and <custom>styled</custom>',
  style: {
    fontSize: 24,
    fill: 0x000000,
    tagStyles: { custom: { fill: '#00ff00', fontStyle: 'italic' } }
  }
});
```

## Ticker

```ts
// Use app.ticker for the main loop
app.ticker.add((ticker) => {
  // ticker.deltaTime: ~1.0 at 60fps (dimensionless, frame-rate independent)
  // ticker.deltaMS: milliseconds since last frame
  sprite.x += speed * ticker.deltaTime;
});

// One-time callback
app.ticker.addOnce(() => {
  /* runs next frame only */
});

// Priority control
app.ticker.add(physicsTick, undefined, UPDATE_PRIORITY.HIGH);

// Manual rendering (disable auto-start)
const app = new Application();
await app.init({ autoStart: false });
function loop() {
  app.render();
  requestAnimationFrame(loop);
}
loop();
```

## Filters

Filters are post-processing effects applied to any Container.

```ts
import { BlurFilter, AlphaFilter, ColorMatrixFilter } from 'pixi.js';

sprite.filters = [new BlurFilter({ strength: 8 })];

// Multiple filters chain
container.filters = [new AlphaFilter({ alpha: 0.5 }), new ColorMatrixFilter()];

// Use as mask
const maskGraphics = new Graphics().circle(200, 200, 100).fill(0xffffff);
sprite.mask = maskGraphics;
// Or inverse mask
sprite.setMask({ mask: maskGraphics, inverse: true });
```

## Events

PixiJS uses a DOM-like federated event model.

```ts
sprite.eventMode = 'static'; // enable interaction
sprite.cursor = 'pointer';

sprite.on('pointerdown', (e) => {
  console.log('clicked at', e.global.x, e.global.y);
});

sprite.on('pointerover', () => {
  sprite.tint = 0xff0000;
});
sprite.on('pointerout', () => {
  sprite.tint = 0xffffff;
});

// Drag pattern
sprite.eventMode = 'static';
sprite.on('pointerdown', onDragStart);
function onDragStart(event) {
  this.alpha = 0.5;
  app.stage.on('pointermove', onDragMove);
  app.stage.once('pointerup', onDragEnd);
}
```

Event modes: `'none'` (no events), `'passive'` (no hit testing, receives bubbled events), `'auto'` (hit test if parent does), `'static'` (always hit tests), `'dynamic'` (hit tests every frame).

## Performance

- **RenderGroups**: Call `container.isRenderGroup = true` on containers that move as a unit (e.g., game world). Transforms are applied on the GPU, avoiding per-child recalculation.
- **Culling**: Set `container.cullable = true` and optionally `container.cullArea = new Rectangle(...)` to skip off-screen objects.
- **ParticleContainer**: Use `Particle` (not `Sprite`) for 100k+ particles -- much lighter objects.
- **cacheAsTexture()**: Freeze complex subtrees into a single texture. Call `container.cacheAsTexture({ resolution: 1 })`.
- **boundsArea**: Set `container.boundsArea = new Rectangle(...)` to skip recursive bounds calculation for known-size containers.
- **Texture atlases**: Batch draw calls by packing sprites into spritesheets.
- **`roundPixels: true`**: For pixel art, prevents sub-pixel blurring.

## Spritesheets

Spritesheets are the primary way to batch sprites efficiently.

```ts
// Load a spritesheet (JSON atlas + texture)
const sheet = await Assets.load('sprites.json');

// Access individual frames
const hero = new Sprite(sheet.textures['hero.png']);

// Access named animations (arrays of textures)
const walkFrames = sheet.animations['walk'];
const anim = new AnimatedSprite(walkFrames);
anim.animationSpeed = 0.15;
anim.play();
```

All frames from a single spritesheet share one GPU texture, enabling batch rendering (one draw call for many sprites).

## Destroy Patterns

Always destroy objects when removing them permanently:

```ts
// Basic destroy
sprite.destroy();

// Destroy with children and textures
container.destroy({ children: true, texture: true, textureSource: true });

// Destroy application
app.destroy(true, { children: true, texture: true, textureSource: true });
// First arg: { removeView: true } removes canvas from DOM
// Second arg: DestroyOptions for the stage
```

When using `Assets`, unload assets you no longer need:

```ts
await Assets.unload('hero');
Assets.cache.remove('hero');
```

## Configuration

See references/configuration.md for the full `ApplicationOptions`, `AutoDetectOptions`, renderer options, and `AssetInitOptions` reference.

## Migration from v7

See references/migration-v8.md for the complete v7-to-v8 migration guide covering:

- Async initialization
- Single-package imports
- New Graphics API (shape-first)
- Texture/BaseTexture changes
- ParticleContainer rework
- Shader/Filter constructor changes
- DisplayObject removal (Container is the base)
- `updateTransform` replaced by `onRender`

## Links

- Repository: https://github.com/pixijs/pixijs
- Docs: https://pixijs.com/8.x/guides
- Examples: https://pixijs.com/8.x/examples
