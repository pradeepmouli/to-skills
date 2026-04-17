# Core Classes Reference

## Container

The base class of every scene object. Holds children, transforms, alpha, tint, visibility, masks, and filters.

### Constructor

```ts
new Container(options?: ContainerOptions)
```

Key options: `x`, `y`, `position`, `scale`, `pivot`, `origin`, `rotation`, `angle`, `alpha`, `tint`, `visible`, `renderable`, `blendMode`, `children`, `isRenderGroup`, `boundsArea`.

### Key Properties

| Property        | Type                | Description                                                              |
| --------------- | ------------------- | ------------------------------------------------------------------------ |
| `children`      | `Container[]`       | Read-only array of child display objects                                 |
| `parent`        | `Container \| null` | Parent in the scene graph                                                |
| `position`      | `ObservablePoint`   | Position relative to parent                                              |
| `scale`         | `ObservablePoint`   | Scale factors (default 1,1)                                              |
| `rotation`      | `number`            | Rotation in radians                                                      |
| `angle`         | `number`            | Rotation in degrees (alias)                                              |
| `pivot`         | `ObservablePoint`   | Center of rotation/scaling                                               |
| `origin`        | `ObservablePoint`   | Like pivot but does not move position                                    |
| `skew`          | `ObservablePoint`   | Skew in radians                                                          |
| `alpha`         | `number`            | Opacity 0-1, relative to parent                                          |
| `tint`          | `ColorSource`       | Multiply tint color (default 0xFFFFFF)                                   |
| `visible`       | `boolean`           | If false, skips rendering AND transform updates                          |
| `renderable`    | `boolean`           | If false, skips rendering but still updates transforms                   |
| `filters`       | `Filter[]`          | Post-processing filter chain                                             |
| `mask`          | `Container \| null` | Masking shape                                                            |
| `zIndex`        | `number`            | Sort order (requires `sortableChildren` on parent)                       |
| `label`         | `string`            | Debug label                                                              |
| `destroyed`     | `boolean`           | True after destroy() called                                              |
| `isRenderGroup` | `boolean`           | Promotes to GPU-level render group                                       |
| `cullable`      | `boolean`           | Enable view culling                                                      |
| `cullArea`      | `Rectangle \| null` | Custom culling rectangle                                                 |
| `eventMode`     | `EventMode`         | Interaction mode: 'none' \| 'passive' \| 'auto' \| 'static' \| 'dynamic' |

### Key Methods

```ts
// Children
container.addChild(child1, child2, ...): child1
container.removeChild(child): child
container.removeChildAt(index): Container
container.removeChildren(begin?, end?): Container[]
container.getChildAt(index): Container
container.setChildIndex(child, index): void
container.sortChildren(): void  // sorts by zIndex

// Transforms
container.toGlobal(localPoint, globalPoint?): Point
container.toLocal(globalPoint, from?, localPoint?): Point
container.getBounds(): Bounds
container.getLocalBounds(): Bounds

// Lifecycle
container.destroy(options?: DestroyOptions): void
// DestroyOptions: boolean | { children?: boolean, texture?: boolean, textureSource?: boolean, context?: boolean }

// RenderGroup
container.enableRenderGroup(): void

// Per-frame callback (replaces v7 updateTransform)
container.onRender = (renderer) => { /* called each frame */ };

// Masking
container.setMask({ mask, inverse?: boolean }): void

// Cache subtree as texture
container.cacheAsTexture(options?: { resolution?: number }): void
container.updateCacheTexture(): void
```

### Events

Container emits lifecycle events via EventEmitter3:

- `added` -- when added to a parent
- `removed` -- when removed from parent
- `childAdded` -- when a child is added (child, container, index)
- `childRemoved` -- when a child is removed (child, container, index)
- `destroyed` -- when destroy() is called

Pointer events (when `eventMode` is set):

- `pointerdown`, `pointerup`, `pointermove`, `pointerover`, `pointerout`
- `click`, `rightclick`, `tap`
- `wheel`

---

## Sprite

Displays a `Texture` as a batched quad. The most commonly used display object.

### Constructor

```ts
new Sprite(options?: SpriteOptions | Texture)
```

Options: `texture`, `anchor`, `roundPixels`, plus all ContainerOptions (`x`, `y`, `scale`, etc.).

### Static Methods

```ts
Sprite.from(source: Texture | string | HTMLCanvasElement, skipCache?: boolean): Sprite
```

**Pitfall**: `Sprite.from('path.png')` only works if the texture is already cached (via prior `Assets.load`). It will NOT load the texture for you.

### Key Properties

| Property      | Type              | Description                      |
| ------------- | ----------------- | -------------------------------- |
| `texture`     | `Texture`         | The displayed texture            |
| `anchor`      | `ObservablePoint` | Origin point (0-1). 0.5 = center |
| `width`       | `number`          | Scaled width                     |
| `height`      | `number`          | Scaled height                    |
| `roundPixels` | `boolean`         | Snap to whole pixels             |

### Typical Patterns

```ts
// Load + create
const texture = await Assets.load('hero.png');
const hero = new Sprite(texture);
hero.anchor.set(0.5);
hero.position.set(400, 300);

// From spritesheet
const sheet = await Assets.load('sprites.json');
const frame = new Sprite(sheet.textures['walk01.png']);

// Swap texture at runtime
hero.texture = sheet.textures['idle.png'];
```

---

## Graphics

Draws vector shapes with fill and stroke. Shapes are defined first, then styled.

### Constructor

```ts
new Graphics(options?: GraphicsOptions | GraphicsContext)
```

### Shape Methods (chainable, return `this`)

| Method             | Parameters                                | Description                |
| ------------------ | ----------------------------------------- | -------------------------- |
| `rect`             | `(x, y, w, h)`                            | Rectangle                  |
| `roundRect`        | `(x, y, w, h, radius)`                    | Rounded rectangle          |
| `circle`           | `(cx, cy, r)`                             | Circle                     |
| `ellipse`          | `(cx, cy, rx, ry)`                        | Ellipse                    |
| `poly`             | `(points, close?)`                        | Polygon from point array   |
| `regularPoly`      | `(cx, cy, r, sides, rotation?)`           | Regular polygon            |
| `star`             | `(cx, cy, points, r, innerR?, rotation?)` | Star shape                 |
| `arc`              | `(cx, cy, r, start, end, ccw?)`           | Arc                        |
| `arcTo`            | `(x1, y1, x2, y2, r)`                     | Arc through tangent points |
| `bezierCurveTo`    | `(cx1, cy1, cx2, cy2, x, y)`              | Cubic bezier               |
| `quadraticCurveTo` | `(cx, cy, x, y)`                          | Quadratic bezier           |
| `moveTo`           | `(x, y)`                                  | Move path cursor           |
| `lineTo`           | `(x, y)`                                  | Line to point              |
| `closePath`        | `()`                                      | Close current path         |

### Style Methods

```ts
g.fill(style?: FillInput): this       // Fill the last shape
g.stroke(style?: StrokeInput): this    // Stroke the last shape
g.cut(): this                          // Cut a hole using the last shape

// FillInput: number | string | { color?, alpha?, texture?, matrix? } | FillGradient | FillPattern
// StrokeInput: number | string | { color?, alpha?, width?, alignment?, cap?, join?, miterLimit?, texture? }
```

### GraphicsContext (shared geometry)

```ts
const ctx = new GraphicsContext();
ctx.rect(0, 0, 100, 100).fill(0xff0000);

// Multiple Graphics share the same GPU geometry
const a = new Graphics(ctx);
const b = new Graphics(ctx);
```

### As a Mask

```ts
const mask = new Graphics().circle(100, 100, 50).fill(0xffffff);
sprite.mask = mask;
```

---

## Text

Canvas-rendered text. Each instance creates its own texture. Expensive to update.

### Constructor

```ts
new Text(options: CanvasTextOptions)
// CanvasTextOptions: { text, style, anchor?, roundPixels?, textureStyle?, ...ContainerOptions }
```

### TextStyle Properties

| Property        | Type                               | Default    | Description          |
| --------------- | ---------------------------------- | ---------- | -------------------- |
| `fontFamily`    | `string`                           | `'Arial'`  | Font family          |
| `fontSize`      | `number`                           | `26`       | Font size in pixels  |
| `fill`          | `ColorSource`                      | `'black'`  | Text fill color      |
| `stroke`        | `{ color, width }`                 | --         | Outline stroke       |
| `align`         | `'left'\|'center'\|'right'`        | `'left'`   | Multi-line alignment |
| `wordWrap`      | `boolean`                          | `false`    | Enable word wrapping |
| `wordWrapWidth` | `number`                           | `100`      | Max line width       |
| `lineHeight`    | `number`                           | --         | Line spacing         |
| `dropShadow`    | `{ color, blur, distance, angle }` | --         | Drop shadow          |
| `fontWeight`    | `string`                           | `'normal'` | Font weight          |
| `fontStyle`     | `string`                           | `'normal'` | Font style           |

### BitmapText

Same constructor pattern but uses pre-rendered bitmap font glyphs for much faster rendering:

```ts
const score = new BitmapText({
  text: 'Score: 0',
  style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
});
// Safe to update every frame:
score.text = `Score: ${currentScore}`;
```

Install custom bitmap fonts:

```ts
BitmapFont.install({ name: 'myFont', style: { fontFamily: 'Arial' } });
// Or load external: await Assets.load('fonts/myFont.fnt');
```

### HTMLText

```ts
const html = new HTMLText({
  text: '<b>Bold</b> text',
  style: {
    fontSize: 24,
    fill: 0x000000,
    tagStyles: { b: { fontWeight: 'bold', fill: 'red' } }
  }
});
```

### Decision Guide

| Scenario                                   | Class                       |
| ------------------------------------------ | --------------------------- |
| Static labels, titles                      | `Text`                      |
| Frequently changing numbers (score, timer) | `BitmapText`                |
| Rich formatting with HTML tags             | `HTMLText`                  |
| Pixel-art text                             | `BitmapText` with MSDF font |

---

## AnimatedSprite

Frame-by-frame animation from a texture array or spritesheet.

```ts
const sheet = await Assets.load('character.json');
const anim = new AnimatedSprite(sheet.animations['walk']);
anim.animationSpeed = 0.15;
anim.play();
anim.onComplete = () => console.log('done');
anim.onLoop = () => console.log('looped');
```

Key properties: `animationSpeed`, `loop`, `currentFrame`, `totalFrames`, `playing`.

Methods: `play()`, `stop()`, `gotoAndPlay(frame)`, `gotoAndStop(frame)`.

---

## TilingSprite

Repeating texture, ideal for scrolling backgrounds.

```ts
const bg = new TilingSprite({
  texture: await Assets.load('pattern.png'),
  width: 800,
  height: 600
});

app.ticker.add(() => {
  bg.tilePosition.x -= 1; // scroll
});
```

Key properties: `tilePosition`, `tileScale`, `tileRotation`, `anchor`.

---

## NineSliceSprite

Scalable UI element that preserves corners and edges.

```ts
const panel = new NineSliceSprite({
  texture: await Assets.load('panel.png'),
  leftWidth: 15,
  topHeight: 15,
  rightWidth: 15,
  bottomHeight: 15
});
panel.width = 300;
panel.height = 200;
```

---

## ParticleContainer

Ultra-fast rendering for massive particle counts. Uses lightweight `Particle` objects, not Sprites.

```ts
const particles = new ParticleContainer({
  boundsArea: new Rectangle(0, 0, 800, 600) // REQUIRED for performance
});

for (let i = 0; i < 100000; i++) {
  const p = new Particle(texture);
  p.x = Math.random() * 800;
  p.y = Math.random() * 600;
  particles.addParticle(p);
}
```

**Pitfall**: `ParticleContainer` does NOT accept `Sprite` children. Use `Particle` objects only. Particles are stored in `particleChildren`, not `children`.

---

## RenderLayer

Controls draw order independently of scene graph hierarchy.

```ts
const uiLayer = new RenderLayer({ sortableChildren: true });
app.stage.addChild(uiLayer);

const sprite = new Sprite(texture);
container.addChild(sprite); // scene graph parent
uiLayer.attach(sprite); // rendered from layer position

// Custom sort
const yLayer = new RenderLayer({
  sortableChildren: true,
  sortFunction: (a, b) => a.position.y - b.position.y
});
```

**Note**: Filters on ancestor containers do NOT apply to children attached to a RenderLayer.

---

## Mesh

Custom geometry with vertex positions, UVs, and optional shaders.

```ts
const mesh = new Mesh({
  geometry: new MeshGeometry({
    positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3])
  }),
  texture: await Assets.load('image.png')
});
```

Convenience subclasses: `MeshPlane`, `MeshRope`, `MeshSimple`, `PerspectiveMesh`.
