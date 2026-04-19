# PixiJS v8 Migration Guide — v7 → v8 Breaking Changes

## TL;DR — Most Common Changes

| Category        | v7                                   | v8                                                 |
| --------------- | ------------------------------------ | -------------------------------------------------- |
| App init        | `new Application({ width })`         | `await app.init({ width })`                        |
| Canvas access   | `app.view`                           | `app.canvas`                                       |
| Imports         | `@pixi/sprite` sub-packages          | `pixi.js` single package                           |
| Graphics        | `beginFill().drawRect().endFill()`   | `rect().fill()`                                    |
| Ticker callback | `(dt) =>`                            | `(ticker) => ticker.deltaTime`                     |
| Bounds          | `container.getBounds()` → Rectangle  | `.getBounds().rectangle`                           |
| Object name     | `container.name`                     | `container.label`                                  |
| Enum constants  | `SCALE_MODES.NEAREST`                | `'nearest'` string                                 |
| Settings        | `settings.RESOLUTION`                | `AbstractRenderer.defaultOptions.resolution`       |
| Adapter         | `settings.ADAPTER`                   | `DOMAdapter.set(...)`                              |
| Children        | Sprites/Graphics could have children | Only `Container` accepts children                  |
| Particles       | `addChild(new Sprite())`             | `addParticle(new Particle())`                      |
| Base class      | `DisplayObject`                      | `Container`                                        |
| Cache bitmap    | `container.cacheAsBitmap = true`     | `container.cacheAsTexture(true)`                   |
| BaseTexture     | `BaseTexture`                        | `TextureSource` (typed: ImageSource, VideoSource…) |

---

## 1. Async Initialization (BREAKING)

Application must be initialized asynchronously. WebGPU renderer requires async setup.

**v7:**

```ts
const app = new Application({ width: 800, height: 600 });
document.body.appendChild(app.view);
```

**v8:**

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```

---

## 2. Single Package (BREAKING)

Sub-packages (`@pixi/sprite`, `@pixi/app`, etc.) no longer exist. Everything is in `pixi.js`.

**v7:**

```ts
import { Application } from '@pixi/app';
import { Sprite } from '@pixi/sprite';
import { Graphics } from '@pixi/graphics';
```

**v8:**

```ts
import { Application, Sprite, Graphics } from 'pixi.js';
```

### Custom Builds (Tree-shaking)

```ts
// Disable auto-import and import only what you need
await app.init({ manageImports: false });

// Explicit imports (must be done BEFORE init if needed)
import 'pixi.js/accessibility';
import 'pixi.js/filters';
import 'pixi.js/text-bitmap'; // also adds BitmapFont asset loader
import 'pixi.js/advanced-blend-modes';
```

---

## 3. Graphics API Overhaul (BREAKING)

The most changed API in v8. Order reversed: **define shape first, then fill/stroke**.

**v7:**

```ts
// begin fill → draw → end fill
g.beginFill(0xff0000).drawRect(50, 50, 100, 100).endFill();
g.lineStyle(2, 0xffffff).drawCircle(100, 100, 50);
g.beginTextureFill({ texture: myTex }).drawRect(0, 0, 100, 100).endFill();
```

**v8:**

```ts
// shape → fill → stroke
g.rect(50, 50, 100, 100).fill(0xff0000);
g.circle(100, 100, 50).stroke({ width: 2, color: 0xffffff });
g.rect(0, 0, 100, 100).fill({ texture: myTex });
```

### Shape Renames

| v7                   | v8            |
| -------------------- | ------------- |
| `drawRect`           | `rect`        |
| `drawCircle`         | `circle`      |
| `drawEllipse`        | `ellipse`     |
| `drawPolygon`        | `poly`        |
| `drawRoundedRect`    | `roundRect`   |
| `drawChamferRect`    | `chamferRect` |
| `drawFilletRect`     | `filletRect`  |
| `drawRegularPolygon` | `regularPoly` |
| `drawRoundedPolygon` | `roundPoly`   |
| `drawRoundedShape`   | `roundShape`  |
| `drawStar`           | `star`        |

### Holes

**v7:**

```ts
g.beginFill(0x00ff00)
  .drawRect(0, 0, 100, 100)
  .beginHole()
  .drawCircle(50, 50, 20)
  .endHole()
  .endFill();
```

**v8:**

```ts
g.rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();
```

### GraphicsContext (replaces GraphicsGeometry)

**v7:**

```ts
const g = new Graphics().beginFill(0xff0000).drawRect(0, 0, 100, 100).endFill();
const g2 = new Graphics(g.geometry);
```

**v8:**

```ts
const ctx = new GraphicsContext().rect(0, 0, 100, 100).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);
```

---

## 4. Texture Changes (BREAKING)

**`Texture.from()` no longer fetches URLs** — assets must be pre-loaded through `Assets`.

**v7:**

```ts
const sprite = Sprite.from('https://example.com/sprite.png'); // auto-fetched
```

**v8:**

```ts
await Assets.load('https://example.com/sprite.png'); // must load first
const sprite = Sprite.from('https://example.com/sprite.png'); // now works
// Or:
const texture = await Assets.load('sprite.png');
const sprite = new Sprite(texture);
```

### BaseTexture → TextureSource

**v7:**

```ts
const base = new BaseTexture(image);
const texture = new Texture(base);
```

**v8:**

```ts
const source = new ImageSource({ resource: image });
const texture = new Texture({ source });
```

Available source types:

- `TextureSource` — generic (for RenderTextures)
- `ImageSource` — HTML images, ImageBitmap
- `CanvasSource` — HTMLCanvasElement
- `VideoSource` — HTMLVideoElement (auto-updates)
- `BufferSource` — raw typed array data
- `CompressedSource` — GPU compressed formats

### Mipmap Property Rename

```ts
// v7: texture.mipmap = true
// v8:
source.autoGenerateMipmaps = true;

// For RenderTextures, manually trigger mipmap updates:
myRenderTexture.source.updateMipmaps();
```

### UV Changes

Sprites no longer auto-update when texture UVs are modified:

```ts
texture.frame.width = texture.frame.width / 2;
texture.update();
sprite.onViewUpdate(); // required to force sprite re-render
```

---

## 5. DisplayObject Removed (BREAKING)

`DisplayObject` is removed. `Container` is the universal base class.

```ts
// v7: extends DisplayObject
// v8: extends Container
```

---

## 6. Leaf Nodes No Longer Accept Children (BREAKING)

**v7:** `Sprite`, `Graphics`, `Text` could have children.
**v8:** Only `Container` can have children.

```ts
// v7 (still worked, now deprecated/removed)
const sprite = new Sprite(tex);
sprite.addChild(anotherSprite);

// v8 — wrap in Container
const group = new Container();
group.addChild(sprite);
group.addChild(anotherSprite);
```

---

## 7. ParticleContainer API (BREAKING)

`ParticleContainer` no longer accepts `Sprite` children; uses lightweight `Particle` objects.

**v7:**

```ts
const container = new ParticleContainer();
container.addChild(new Sprite(texture));
```

**v8:**

```ts
const container = new ParticleContainer({
  boundsArea: new Rectangle(0, 0, 800, 600) // required (no auto-bounds)
});
container.addParticle(new Particle(texture));
// Particles stored in container.particleChildren, not container.children
```

`Particle` interface:

```ts
interface IParticle {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  anchorX: number;
  anchorY: number;
  rotation: number;
  color: number; // RGBA packed
  texture: Texture;
}
```

---

## 8. Ticker Callback Change (BREAKING)

Callback receives a `Ticker` instance, not delta time directly.

**v7:**

```ts
Ticker.shared.add((dt) => {
  sprite.rotation += 0.1 * dt;
});
```

**v8:**

```ts
Ticker.shared.add((ticker) => {
  sprite.rotation += 0.1 * ticker.deltaTime;
  // also available: ticker.deltaMS, ticker.elapsedMS, ticker.FPS
});
```

---

## 9. `settings` Object Removed (BREAKING)

**v7:**

```ts
import { settings, BrowserAdapter, WebWorkerAdapter } from 'pixi.js';
settings.RESOLUTION = 2;
settings.ADAPTER = WebWorkerAdapter;
settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
```

**v8:**

```ts
import { AbstractRenderer, DOMAdapter, BrowserAdapter, WebWorkerAdapter } from 'pixi.js';

AbstractRenderer.defaultOptions.resolution = 2;
AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat = false;
DOMAdapter.set(WebWorkerAdapter); // for web worker environments
```

---

## 10. Shader / Filter Changes (BREAKING for custom shaders)

Textures are no longer uniforms — they are resources passed separately.

**v7:**

```ts
const shader = PIXI.Shader.from(vertex, fragment, { uTexture: texture });
const filter = new Filter(vertex, fragment, { uTime: 0.0 });
```

**v8:**

```ts
// Shader supporting both WebGL and WebGPU
const shader = Shader.from({
  gl: { vertex, fragment },
  gpu: { vertex: { entryPoint: 'mainVert', source }, fragment: { entryPoint: 'mainFrag', source } },
  resources: {
    myUniforms: new UniformGroup({ uTime: { value: 0.0, type: 'f32' } }),
    myTexture: texture.source, // texture source as resource
    myStyle: texture.style // texture style as resource
  }
});

// Filter
const filter = new Filter({
  glProgram: GlProgram.from({ vertex, fragment }),
  resources: {
    timeUniforms: { uTime: { value: 0.0, type: 'f32' } }
  }
});
```

UniformGroup construction changed:

```ts
// v7
const ug = new UniformGroup({ uTime: 1 });
// v8 — must specify type
const ug = new UniformGroup({ uTime: { value: 1, type: 'f32' } });
```

Community filters package:

```ts
// v7
import { AdjustmentFilter } from '@pixi/filter-adjustment';
// v8
import { AdjustmentFilter } from 'pixi-filters/adjustment';
```

---

## 11. Culling API Change

Culling is no longer automatic — must be triggered manually or via plugin.

```ts
// v8 culling setup
container.cullable = true;
container.cullArea = new Rectangle(0, 0, 400, 400);
container.cullableChildren = false;

// Manual
Culler.shared.cull(container, viewRect);
renderer.render(container);

// Auto (via plugin, simulates v7 behavior)
import { extensions, CullerPlugin } from 'pixi.js';
extensions.add(CullerPlugin);
```

---

## 12. getBounds() Returns Bounds, Not Rectangle

```ts
// v7
const rect: Rectangle = container.getBounds();
const { x, y, width, height } = rect;

// v8
const bounds: Bounds = container.getBounds();
const rect: Rectangle = bounds.rectangle;
const { x, y, width, height } = bounds.rectangle;
```

---

## 13. Other Renamed APIs

| v7                           | v8                                         |
| ---------------------------- | ------------------------------------------ |
| `app.view`                   | `app.canvas`                               |
| `container.name`             | `container.label`                          |
| `container.cacheAsBitmap`    | `container.cacheAsTexture(true)`           |
| `NineSlicePlane`             | `NineSliceSprite`                          |
| `SimpleMesh`                 | `MeshSimple`                               |
| `SimplePlane`                | `MeshPlane`                                |
| `SimpleRope`                 | `MeshRope`                                 |
| `SCALE_MODES.NEAREST`        | `'nearest'`                                |
| `SCALE_MODES.LINEAR`         | `'linear'`                                 |
| `WRAP_MODES.CLAMP`           | `'clamp-to-edge'`                          |
| `WRAP_MODES.REPEAT`          | `'repeat'`                                 |
| `WRAP_MODES.MIRRORED_REPEAT` | `'mirror-repeat'`                          |
| `DRAW_MODES.TRIANGLES`       | `'triangle-list'`                          |
| `TextFormat` (bitmap font)   | `bitmapFontTextParser`                     |
| `XMLStringFormat`            | `bitmapFontXMLStringParser`                |
| `XMLFormat`                  | `bitmapFontXMLParser`                      |
| `utils.isMobile`             | `import { isMobile } from 'pixi.js'`       |
| `Assets.add('key', 'url')`   | `Assets.add({ alias: 'key', src: 'url' })` |
| `updateTransform()` override | `container.onRender = fn`                  |

---

## 14. Constructor Signature Changes

Most constructors changed from positional arguments to options objects.

```ts
// v7 positional → v8 options object

// BlurFilter
new BlurFilter(8, 4, 1, 5)
→ new BlurFilter({ blur: 8, quality: 4, resolution: 1, kernelSize: 5 })

// Text
new Text('Hello', { fontSize: 24 })
→ new Text({ text: 'Hello', style: { fontSize: 24 } })

// BitmapText
new BitmapText('Hi', { fontName: 'Arial' })
→ new BitmapText({ text: 'Hi', style: { fontFamily: 'Arial' } })

// TileSprite
new TileSprite(texture, width, height)
→ new TileSprite({ texture, width, height })

// NineSliceSprite (was NineSlicePlane)
new NineSlicePlane(texture, 10, 10, 10, 10)
→ new NineSliceSprite({ texture, leftWidth: 10, topHeight: 10, rightWidth: 10, bottomHeight: 10 })

// Mesh
new Mesh(geometry, shader, state, drawMode)
→ new Mesh({ geometry, shader })
```

---

## 15. Default eventMode Changed

```ts
// v7 default: 'auto'
// v8 default: 'passive'
// If your v7 code relied on containers being interactive by default,
// set eventMode explicitly:
container.eventMode = 'static'; // for non-moving interactive objects
container.eventMode = 'dynamic'; // for moving interactive objects
```

---

## 16. Application Type Generic Change

```ts
// v7
const app = new Application<HTMLCanvasElement>();

// v8
const app = new Application(); // untyped
const app = new Application<Renderer>(); // typed (WebGL or WebGPU)
const app = new Application<WebGLRenderer>(); // WebGL specific
const app = new Application<WebGPURenderer>(); // WebGPU specific
```
