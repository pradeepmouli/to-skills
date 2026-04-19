# PixiJS v8 — Core Classes Reference

## Container

The base class for all scene objects. All display objects inherit from `Container`. Only `Container` instances can have children — leaf nodes (Sprite, Graphics, Text) do not support `addChild`.

### ContainerOptions

```ts
interface ContainerOptions {
  // Transform
  x?: number;
  y?: number;
  position?: PointData;
  scale?: PointData | number;
  rotation?: number; // radians
  angle?: number; // degrees (alias for rotation)
  pivot?: PointData | number; // rotation center in local coords
  origin?: PointData | number; // rotate around point without repositioning
  skew?: PointData;

  // Appearance
  alpha?: number; // 0–1, multiplicative with parent
  tint?: ColorSource; // 0xRRGGBB, 'red', '#ff0000', etc.
  visible?: boolean; // false = skip draw + transform
  renderable?: boolean; // false = skip draw, keep transform
  blendMode?: BLEND_MODES; // 'normal' | 'add' | 'multiply' | 'screen' | ...

  // Structure
  children?: ContainerChild[];
  parent?: Container;
  isRenderGroup?: boolean; // mark as GPU-optimized render group

  // Culling
  // set after construction:
  // cullable, cullArea, cullableChildren
  boundsArea?: Rectangle; // skip recursive bounds measurement
  label?: string; // debug name (was 'name' in v7)
}
```

### Key Methods

```ts
// Children
addChild(...children: Container[]): Container
removeChild(...children: Container[]): Container
addChildAt(child, index): Container
removeChildAt(index): Container
getChildAt(index): Container
getChildByLabel(label, deep?): Container | null
setChildIndex(child, index): void
removeAllChildren(): Container[]
children: readonly Container[]

// Bounds
getBounds(skipUpdate?, bounds?): Bounds      // returns Bounds, NOT Rectangle
getLocalBounds(): Bounds
getBoundsRect(): Rectangle                    // convenience
getBoundingBox(): Bounds                      // fast global bounds

// Coordinate conversion
toGlobal(position, point?, skipUpdate?): Point
toLocal(position, from?, point?, skipUpdate?): Point

// Sorting
sortableChildren: boolean   // enable z-index sorting
zIndex: number

// Transform
updateLocalTransform(): void
localTransform: Matrix     // local transform matrix
worldTransform: Matrix     // computed world transform (read-only)

// RenderGroup
enableRenderGroup(): void
disableRenderGroup(): void
isRenderGroup: boolean

// Cache
cacheAsTexture(val: boolean, options?): void  // was cacheAsBitmap in v7

// Destroy
destroy(options?: DestroyOptions): void
// DestroyOptions: { children?: boolean, texture?: boolean, textureSource?: boolean }

// Events (from EventEmitter3)
on(event, fn): this
off(event, fn): this
once(event, fn): this
emit(event, ...args): boolean
```

### Container Events

| Event            | Payload                   | Description             |
| ---------------- | ------------------------- | ----------------------- |
| `added`          | `container: Container`    | Added to a parent       |
| `removed`        | `container: Container`    | Removed from parent     |
| `childAdded`     | `child, container, index` | Child was added         |
| `childRemoved`   | `child, container, index` | Child was removed       |
| `destroyed`      | `container`               | Container was destroyed |
| `visibleChanged` | `visible: boolean`        | Visibility changed      |

### Interaction / Events

```ts
container.eventMode = 'static'; // 'none' | 'passive' | 'auto' | 'static' | 'dynamic'
// Default in v8: 'passive' (was 'auto' in v7)

container.on('pointerdown', handler);
container.on('pointerup', handler);
container.on('pointermove', handler);
container.on('pointerover', handler);
container.on('pointerout', handler);
container.on('click', handler);
container.hitArea = new Rectangle(0, 0, w, h); // custom hit area
container.interactiveChildren = false; // skip children in hit testing
```

### Culling

```ts
container.cullable = true;
container.cullArea = new Rectangle(0, 0, w, h); // faster than measuring bounds
container.cullableChildren = true; // default true; set false to skip child culling

// Manual culling
Culler.shared.cull(container, viewRect);
renderer.render(container);

// Auto culling plugin
import { extensions, CullerPlugin } from 'pixi.js';
extensions.add(CullerPlugin);
```

### RenderGroup (GPU transform optimization)

```ts
// Declare at construction
const world = new Container({ isRenderGroup: true });

// Or enable later
world.enableRenderGroup();

// Best practices:
// - Use for large stable sub-trees (HUD, game world, UI layer)
// - Don't overuse — each group has overhead; profile before adding
// - "Stable" means the structure (children list) stays the same,
//   not that objects are frozen
```

---

## Sprite

Extends `Container` (via `ViewContainer`). Renders a `Texture` using a quad. Does not accept children.

### SpriteOptions

```ts
interface SpriteOptions extends ViewContainerOptions {
  texture?: Texture; // defaults to Texture.EMPTY
  anchor?: PointData | number; // 0=top-left, 0.5=center, 1=bottom-right
  roundPixels?: boolean; // snap to pixel grid
  // + all ContainerOptions
}
```

### Creation Patterns

```ts
// From pre-loaded texture (preferred)
const texture = await Assets.load<Texture>('sprite.png');
const sprite = new Sprite(texture);

// Shorthand (texture must already be cached)
const sprite = Sprite.from('sprite.png');

// With options
const sprite = new Sprite({
  texture,
  anchor: { x: 0.5, y: 0.5 },
  x: 400,
  y: 300,
  scale: 2,
  rotation: Math.PI / 4
});

// From spritesheet
const sheet = await Assets.load('sheet.json');
const sprite = new Sprite(sheet.textures['frame-01.png']);
```

### Key Properties

```ts
sprite.texture: Texture      // swap texture at runtime
sprite.anchor: ObservablePoint  // set(x, y) or set(0.5) for uniform
sprite.width: number         // derived from texture.width * scale.x
sprite.height: number
sprite.tint: ColorSource
sprite.alpha: number
```

### After Manual Texture Modification

```ts
// If you modify texture.frame or UVs, sprites won't auto-update:
texture.frame.width = texture.frame.width / 2;
texture.update(); // mark texture dirty
sprite.onViewUpdate(); // force sprite to re-read texture
// Or subscribe:
texture.on('update', () => sprite.onViewUpdate());
```

---

## Graphics

Extends `ViewContainer`. Used for procedural shape drawing. Does not accept children.

### GraphicsOptions

```ts
interface GraphicsOptions extends ViewContainerOptions {
  context?: GraphicsContext; // shared drawing data (optional)
  roundPixels?: boolean;
}
```

### v8 Drawing Pattern: Shape → Fill/Stroke

```ts
const g = new Graphics();

// WRONG (v7):  beginFill → drawShape → endFill
// RIGHT (v8):  shape → fill/stroke

// Filled shapes
g.rect(x, y, w, h).fill(0xff0000);
g.rect(x, y, w, h).fill({ color: 0xff0000, alpha: 0.5 });
g.rect(x, y, w, h).fill({ texture: myTexture, color: 0xff0000, alpha: 0.5 });
g.circle(cx, cy, r).fill(color);
g.ellipse(cx, cy, rx, ry).fill(color);
g.roundRect(x, y, w, h, radius).fill(color);
g.chamferRect(x, y, w, h, chamfer).fill(color);
g.filletRect(x, y, w, h, fillet).fill(color);
g.poly([x1, y1, x2, y2, ...], closeShape?).fill(color);
g.regularPoly(x, y, radius, sides, rotation?).fill(color);
g.star(x, y, points, radius, innerRadius?, rotation?).fill(color);

// Strokes
g.rect(x, y, w, h).stroke({ width: 2, color: 0xffffff });
g.stroke({ width: 2, color: 0xffffff, alpha: 0.8, texture: myTexture });

// Path drawing
g.moveTo(x, y).lineTo(x2, y2).closePath().stroke({ width: 1 });
g.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
g.quadraticCurveTo(cpx, cpy, x, y);
g.arc(cx, cy, radius, startAngle, endAngle, anticlockwise?);

// Holes (cut = hollows out the preceding shape)
g.rect(0, 0, 100, 100).fill(0x00ff00)
 .circle(50, 50, 20).cut();

// Texture fill (replaces v7 beginTextureFill)
g.rect(0, 0, 100, 100).fill({ texture: myTexture, alpha: 0.5, color: 0xff0000 });

// Stroke texture (replaces v7 lineTextureStyle)
g.rect(0, 0, 100, 100).stroke({ texture: myTexture, width: 10, color: 0xff0000 });

// SVG path
g.svg('M 0 0 L 100 0 L 100 100 Z').fill(0xff0000);
```

### Shape Method Renames (v7 → v8)

| v7                   | v8                     |
| -------------------- | ---------------------- |
| `drawRect`           | `rect`                 |
| `drawCircle`         | `circle`               |
| `drawEllipse`        | `ellipse`              |
| `drawPolygon`        | `poly`                 |
| `drawRoundedRect`    | `roundRect`            |
| `drawChamferRect`    | `chamferRect`          |
| `drawFilletRect`     | `filletRect`           |
| `drawRegularPolygon` | `regularPoly`          |
| `drawRoundedPolygon` | `roundPoly`            |
| `drawStar`           | `star`                 |
| `beginHole/endHole`  | `.cut()`               |
| `beginTextureFill`   | `.fill({ texture })`   |
| `lineTextureStyle`   | `.stroke({ texture })` |

### GraphicsContext — Sharing Drawing Data

```ts
// Create context once (GPU geometry compiled once)
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);

// Share across multiple Graphics instances (like sharing a Texture)
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);
// g1 and g2 share GPU geometry but have independent transforms/alpha/tint

// Modifying ctx affects all instances:
ctx.clear(); // re-draw on ctx to update all references

// Was GraphicsGeometry in v7:
// OLD: const g2 = new Graphics(g1.geometry);
// NEW: const g2 = new Graphics(ctx);
```

### Graphics as Mask

```ts
const mask = new Graphics();
mask.circle(50, 50, 50).fill(0xffffff);
sprite.mask = mask;
// Graphics masks use the stencil buffer — faster than sprite masks
```

### Performance Tips

- Graphics objects are fastest when **not modified every frame** (excluding transform/alpha/tint changes)
- Small graphics (<100 points) are batched like sprites — very fast
- For many complex shapes, convert to a texture: `renderer.generateTexture(g)`
- Group same-type objects together to minimize draw calls

---

## Text

Extends `AbstractText`. Renders text to an offscreen canvas, then uploads as a GPU texture. Flexible styling but expensive to update frequently.

### CanvasTextOptions

```ts
interface CanvasTextOptions extends TextOptions {
  text?: string | number;
  style?: TextStyleOptions | TextStyle;
  anchor?: PointData | number;
  textureStyle?: TextureStyle | TextureStyleOptions; // scaleMode, etc.
  autoGenerateMipmaps?: boolean;
  roundPixels?: boolean;
  // + ContainerOptions
}
```

### TextStyleOptions (key fields)

```ts
interface TextStyleOptions {
  align?: 'left' | 'center' | 'right' | 'justify';
  breakWords?: boolean;
  dropShadow?: boolean | {
    alpha?: number;      // 0–1, default 1
    angle?: number;      // radians, default Math.PI/6
    blur?: number;       // px, default 0
    color?: ColorSource; // default 'black'
    distance?: number;   // px, default 5
  };
  fill?: FillInput;               // color, gradient, pattern, hex, string
  fontFamily?: string | string[];
  fontSize?: number | string;     // px, pt, %, em
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100'–'900';
  letterSpacing?: number;
  lineHeight?: number;
  leading?: number;
  padding?: number;               // extra padding to prevent clipping
  stroke?: StrokeInput;           // { color, width, join, ... }
  textBaseline?: 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
  whiteSpace?: 'normal' | 'pre' | 'pre-line';
  wordWrap?: boolean;
  wordWrapWidth?: number;
}
```

### v7 → v8 Constructor Change

```ts
// OLD (deprecated, triggers warning)
new Text('Hello World', { fontSize: 24 });

// NEW
new Text({ text: 'Hello World', style: { fontSize: 24 } });
```

### Updating Text

```ts
text.text = 'New content'; // triggers texture rebuild
text.style.fontSize = 32; // triggers rebuild
text.style = { fontSize: 32 }; // full style replace
```

### Performance: When to Use Which

| Class        | CPU cost                     | GPU cost           | Best for                                    |
| ------------ | ---------------------------- | ------------------ | ------------------------------------------- |
| `Text`       | High (canvas draw on change) | Low                | Labels that change occasionally             |
| `BitmapText` | Low                          | Very low (batched) | Score counters, frequently changing numbers |
| `HTMLText`   | High                         | Low                | Rich HTML markup, styled inline text        |

---

## BitmapText

Pre-renders glyphs into a texture atlas for high-performance text. Best for text that updates frequently (counters, timers) or when you need many text instances.

```ts
// Dynamic bitmap font (auto-generated from system font)
const text = new BitmapText({
  text: 'Score: 0',
  style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
});

// Pre-installed font
BitmapFont.install({ name: 'myFont', style: { fontFamily: 'Arial' } });
const text = new BitmapText({ text: '0', style: { fontFamily: 'myFont', fontSize: 36 } });

// Loaded external font (FNT/XML) — supports MSDF/SDF for crisp scaling
import 'pixi.js/text-bitmap'; // required before Assets.load for bitmap fonts
const font = await Assets.load('fonts/myFont.fnt');
const text = new BitmapText({ text: 'Hello', style: { fontFamily: 'myFont' } });
```

---

## HTMLText

Renders HTML markup into a texture using SVG foreignObject. Supports CSS-styled text spans.

```ts
const text = new HTMLText({
  text: '<b>Bold</b> and <span style="color:red">red</span>',
  style: {
    fontSize: 24,
    tagStyles: {
      b: { fontWeight: 'bold' },
      em: { fontStyle: 'italic', fill: '#00ff00' }
    }
  }
});
```

Limitations:

- Slower than `Text` and `BitmapText`
- Cross-origin images in HTML may fail due to SVG security restrictions
- Not available in Web Workers

---

## Texture

```ts
// From loaded asset (preferred)
const texture = await Assets.load<Texture>('image.png');

// From existing source
const source = new ImageSource({ resource: htmlImageElement });
const texture = new Texture({ source });

// Static helpers
Texture.EMPTY; // 1×1 transparent
Texture.WHITE; // 1×1 white

// Sub-texture (from spritesheet frame)
const frame = new Rectangle(x, y, w, h);
const subTexture = new Texture({ source: texture.source, frame });

// Dynamic texture (signal that frame/UVs may change)
const dynTex = new Texture({ source, dynamic: true });

// Destroy
texture.destroy();
texture.source.unload(); // remove from GPU

// Scale mode (was SCALE_MODES enum in v7)
// 'nearest' — pixel art, no filtering
// 'linear'  — smooth scaling (default)
```

---

## Application

```ts
class Application {
  stage: Container; // root scene node
  renderer: Renderer; // WebGL or WebGPU renderer instance
  ticker: Ticker; // animation loop (via TickerPlugin)
  canvas: HTMLCanvasElement; // the DOM canvas element
  screen: Rectangle; // { x:0, y:0, width, height }

  async init(options?: ApplicationOptions): Promise<void>;
  render(): void; // manual render (usually unneeded with TickerPlugin)
  destroy(rendererOptions?, containerOptions?): void;

  // Deprecated in v8:
  // view → canvas
  // Application constructor options → use init()
}
```

### Resize

```ts
// Auto-resize
await app.init({ resizeTo: window });

// Manual resize
app.renderer.resize(800, 600);
// or
app.renderer.resize(800, 600, window.devicePixelRatio);
```

### Access Renderer Directly

```ts
// Generate texture from container
const texture = app.renderer.generateTexture(container);

// Render to texture
const rt = RenderTexture.create({ width: 100, height: 100 });
app.renderer.render({ container: myContainer, target: rt });
```
