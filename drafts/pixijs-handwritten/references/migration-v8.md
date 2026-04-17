# Migration Guide: PixiJS v7 to v8

## Overview

PixiJS v8 is a major rewrite focused on WebGPU support, better performance, and API modernization. This guide covers every breaking change.

## 1. Package Structure

v8 is a **single package**. Remove all `@pixi/*` sub-packages.

```diff
- import { Application } from '@pixi/app';
- import { Sprite } from '@pixi/sprite';
- import { Graphics } from '@pixi/graphics';
+ import { Application, Sprite, Graphics } from 'pixi.js';
```

**Action**: Delete all `@pixi/*` from `package.json`. Install only `pixi.js`.

## 2. Async Initialization

`Application` must be initialized asynchronously because WebGPU adapter requests are async.

```diff
- const app = new Application({ width: 800, height: 600 });
- document.body.appendChild(app.view);
+ const app = new Application();
+ await app.init({ width: 800, height: 600 });
+ document.body.appendChild(app.canvas);
```

**Critical**: NEVER pass options to the constructor. NEVER access `app.renderer` before `init()` resolves.

## 3. Canvas Property Rename

```diff
- document.body.appendChild(app.view);
+ document.body.appendChild(app.canvas);
```

`app.view` still exists but is deprecated and will be removed.

## 4. Graphics API (Largest Change)

The entire Graphics API is rebuilt. Shapes are drawn first, then filled/stroked.

### Basic Shapes

```diff
- graphics.beginFill(0xff0000).drawRect(0, 0, 100, 100).endFill();
+ graphics.rect(0, 0, 100, 100).fill(0xff0000);
```

### Shape Method Renames

| v7                                    | v8                             |
| ------------------------------------- | ------------------------------ |
| `drawRect(x, y, w, h)`                | `rect(x, y, w, h)`             |
| `drawRoundedRect(x, y, w, h, r)`      | `roundRect(x, y, w, h, r)`     |
| `drawCircle(x, y, r)`                 | `circle(x, y, r)`              |
| `drawEllipse(x, y, rw, rh)`           | `ellipse(x, y, rw, rh)`        |
| `drawPolygon(points)`                 | `poly(points)`                 |
| `drawStar(x, y, p, r, ir, rot)`       | `star(x, y, p, r, ir, rot)`    |
| `drawRegularPolygon(x, y, r, s, rot)` | `regularPoly(x, y, r, s, rot)` |
| `drawRoundedPolygon(...)`             | `roundPoly(...)`               |
| `drawChamferRect(...)`                | `chamferRect(...)`             |
| `drawFilletRect(...)`                 | `filletRect(...)`              |

### Fill and Stroke

```diff
- graphics.beginFill(0xff0000, 0.5);
- graphics.drawRect(0, 0, 100, 100);
- graphics.endFill();
+ graphics.rect(0, 0, 100, 100).fill({ color: 0xff0000, alpha: 0.5 });
```

```diff
- graphics.lineStyle(2, 0xffffff);
- graphics.drawRect(0, 0, 100, 100);
- graphics.endFill();
+ graphics.rect(0, 0, 100, 100).stroke({ width: 2, color: 0xffffff });
```

### Texture Fill

```diff
- graphics.beginTextureFill({ texture, alpha: 0.5, color: 0xff0000 });
- graphics.drawRect(0, 0, 100, 100);
- graphics.endFill();
+ graphics.rect(0, 0, 100, 100).fill({ texture, alpha: 0.5, color: 0xff0000 });
```

### Line Style to Stroke

```diff
- graphics.lineTextureStyle({ texture, width: 10, color: 0xff0000 });
- graphics.drawRect(0, 0, 100, 100);
+ graphics.rect(0, 0, 100, 100).stroke({ texture, width: 10, color: 0xff0000 });
```

### Holes

```diff
- graphics.beginFill(0x00ff00);
- graphics.drawRect(0, 0, 100, 100);
- graphics.beginHole();
- graphics.drawCircle(50, 50, 20);
- graphics.endHole();
- graphics.endFill();
+ graphics.rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();
```

### GraphicsGeometry to GraphicsContext

```diff
- const geometry = graphics.geometry;
- const clone = new Graphics(geometry);
+ const context = new GraphicsContext().rect(0, 0, 100, 100).fill(0xff0000);
+ const g1 = new Graphics(context);
+ const g2 = new Graphics(context);
```

## 5. Texture System

`BaseTexture` is removed. Replaced by `TextureSource` subtypes.

| v7                           | v8                                                                      |
| ---------------------------- | ----------------------------------------------------------------------- |
| `BaseTexture`                | `TextureSource` (or `ImageSource`, `CanvasSource`, `VideoSource`, etc.) |
| `new BaseTexture(resource)`  | `new ImageSource({ resource })`                                         |
| `PIXI.BaseTexture.from(img)` | `new Texture({ source: new ImageSource({ resource: img }) })`           |

In practice, use `Assets.load()` which returns `Texture` directly. Manual texture creation:

```ts
const source = new ImageSource({ resource: htmlImageElement });
const texture = new Texture({ source });
```

## 6. DisplayObject Removed

`DisplayObject` no longer exists. `Container` is the base class for everything.

```diff
- class MyObject extends DisplayObject { ... }
+ class MyObject extends Container { ... }
```

## 7. updateTransform Replaced by onRender

The `updateTransform()` override pattern is gone. Use `onRender` instead:

```diff
- class MySprite extends Sprite {
-   updateTransform() {
-     super.updateTransform();
-     this.rotation += 0.1;
-   }
- }
+ const sprite = new Sprite(texture);
+ sprite.onRender = () => {
+   sprite.rotation += 0.1;
+ };
```

## 8. Shader / Filter Changes

Textures are no longer uniforms. They are "resources".

### Custom Filter

```diff
- const filter = new Filter(vertexSrc, fragmentSrc, { uTime: 0.0 });
+ const filter = new Filter({
+   glProgram: GlProgram.from({ vertex: vertexSrc, fragment: fragmentSrc }),
+   resources: {
+     timeUniforms: new UniformGroup({
+       uTime: { value: 0.0, type: 'f32' },
+     }),
+   },
+ });
```

### Custom Shader

```diff
- const shader = PIXI.Shader.from(vertex, fragment, uniforms);
+ const shader = Shader.from({
+   gl: { vertex, fragment },
+   resources: {
+     myUniforms: new UniformGroup({
+       uTime: { value: 1, type: 'f32' },
+     }),
+   },
+ });
```

### Uniform Types

```diff
- const ug = new UniformGroup({ uTime: 1 });
+ const ug = new UniformGroup({ uTime: { value: 1, type: 'f32' } });
```

Access remains the same: `ug.uniforms.uTime = 100;`

### WebGPU + WebGL Shader

```ts
const shader = Shader.from({
  gl: { vertex: glslVert, fragment: glslFrag },
  gpu: {
    vertex: { entryPoint: 'mainVert', source: wgslSource },
    fragment: { entryPoint: 'mainFrag', source: wgslSource }
  },
  resources: {
    /* ... */
  }
});
```

## 9. Community Filters Package

```diff
- import { AdjustmentFilter } from '@pixi/filter-adjustment';
+ import { AdjustmentFilter } from 'pixi-filters/adjustment';
```

The `@pixi/filter-*` individual packages are no longer maintained for v8.

## 10. ParticleContainer Rework

Particles are no longer `Sprite` objects. Use the lightweight `Particle` class.

```diff
- const container = new ParticleContainer();
- for (let i = 0; i < 100000; i++) {
-   container.addChild(new Sprite(texture));
- }
+ const container = new ParticleContainer({
+   boundsArea: new Rectangle(0, 0, 800, 600), // important for perf
+ });
+ for (let i = 0; i < 100000; i++) {
+   container.addParticle(new Particle(texture));
+ }
```

Key differences:

- Particles stored in `particleChildren`, not `children`
- Use `addParticle()` / `removeParticle()`, not `addChild()` / `removeChild()`
- No filters or nested children on particles
- ParticleContainer does NOT auto-calculate bounds (provide `boundsArea`)

## 11. Text Constructor

```diff
- const text = new Text('Hello', { fontSize: 24, fill: 0xff0000 });
+ const text = new Text({
+   text: 'Hello',
+   style: { fontSize: 24, fill: 0xff0000 },
+ });
```

The positional `(text, style)` constructor still works but is deprecated.

## 12. Renderer Creation

```diff
- const renderer = PIXI.autoDetectRenderer({ width: 800, height: 600 });
+ const renderer = await autoDetectRenderer({ width: 800, height: 600 });
```

Note: `autoDetectRenderer` is now async and returns a Promise.

## 13. Renderer.render() Signature

```diff
- renderer.render(stage);
+ renderer.render({ container: stage });
```

Takes an options object, not a positional argument.

## 14. Interaction / Events

The `@pixi/interaction` plugin is gone. Events are built-in via `EventSystem`.

```diff
- import { InteractionManager } from '@pixi/interaction';
// No import needed, events are built-in

- sprite.interactive = true;
+ sprite.eventMode = 'static';

- sprite.buttonMode = true;
+ sprite.cursor = 'pointer';
```

## 15. Other Notable Changes

| v7                                   | v8                                                          |
| ------------------------------------ | ----------------------------------------------------------- |
| `container.mask = graphics`          | Same, or use `container.setMask({ mask, inverse })`         |
| `Ticker.shared.add(fn)`              | Same, but callback receives `Ticker` not `deltaTime` number |
| `new Spritesheet(baseTexture, data)` | `new Spritesheet({ texture, data })`                        |
| `sprite.cacheAsBitmap = true`        | `sprite.cacheAsTexture({ resolution: 1 })`                  |
| `container.sortableChildren = true`  | Same                                                        |
| `PIXI.settings.RESOLUTION`           | `AbstractRenderer.defaultOptions.resolution`                |
| `PIXI.utils.*`                       | Import directly: `import { path, isMobile } from 'pixi.js'` |

## 16. Renderer Selection Priority

v8 default priority: `['webgl', 'webgpu', 'canvas']`. WebGL is tried first as the most stable. To force WebGPU:

```ts
await app.init({ preference: 'webgpu' }); // tries webgpu first, falls back
await app.init({ preference: ['webgpu'] }); // webgpu ONLY, throws if unavailable
```

## Migration Checklist

1. Remove all `@pixi/*` packages, install `pixi.js@^8`
2. Update all imports to `from 'pixi.js'`
3. Make Application init async: `const app = new Application(); await app.init({...});`
4. Replace `app.view` with `app.canvas`
5. Rewrite all Graphics calls: shape-first, then `.fill()` / `.stroke()`
6. Replace `beginHole/endHole` with `.cut()`
7. Update Text constructors to options objects
8. Replace `interactive = true` with `eventMode = 'static'`
9. Replace `buttonMode = true` with `cursor = 'pointer'`
10. Replace `cacheAsBitmap` with `cacheAsTexture()`
11. Replace `updateTransform()` overrides with `onRender`
12. Update any custom shaders/filters to use `resources` pattern
13. Update ParticleContainer to use `Particle` + `addParticle()`
14. Replace `BaseTexture` usage with `TextureSource` subtypes
15. Test with both WebGL and WebGPU (if targeting WebGPU)
