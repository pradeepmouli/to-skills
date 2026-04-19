# v8 Migration Guide

# v8 Migration Guide

Welcome to the PixiJS v8 Migration Guide! This document is designed to help you smoothly transition your projects from PixiJS v7 to the latest and greatest PixiJS v8. Please follow these steps to ensure a successful migration.

## Table of Contents

1. [Introduction](#introduction)
2. [Breaking Changes](#breaking-changes)
3. [Deprecated Features](#deprecated-features)
4. [Resources](#resources)

## 1. Introduction

PixiJS v8 introduces several exciting changes and improvements that dramatically enhance the performance of the renderer. While we've made efforts to keep the migration process as smooth as possible, some breaking changes are inevitable. This guide will walk you through the necessary steps to migrate your PixiJS v7 project to PixiJS v8.

## 2. Breaking Changes

Before diving into the migration process, let's review the breaking changes introduced in PixiJS v8. Make sure to pay close attention to these changes as they may impact your existing codebase.

### Should I Upgrade?

Generally, the answer is yes! But currently, there may be reasons that suggest it's best not to upgrade just yet. Ask yourself the following question:

- **Does your project leverage existing Pixi libraries that have not yet been migrated to v8?**
  We are working hard to migrate our key libraries to v8 but did not want this to be a blocker for those who are using pure Pixi. This means some libraries will not have a v8 counterpart just yet. It's best to hold off on migration if this is the case for you.

**Migrated**

- Filters
- Sound
- Gif
- Storybook
- UI
- Open Games

**Migrating Right Now:**

- React
- Spine (esoteric version)

**To Be Migrated:**

- Pixi layers (rather than migrating this, we will likely incorporate it directly into PixiJS v8 as a feature)

### **New Package Structure**

Since version 5, PixiJS has utilized individual sub-packages to organize its codebase into smaller units. However, this approach led to issues, such as conflicting installations of different PixiJS versions, causing complications with internal caches.

In v8, PixiJS has reverted to a single-package structure. While you can still import specific parts of PixiJS, you only need to install the main package.

**Old:**

```ts
import { Application } from '@pixi/app';
import { Sprite } from '@pixi/sprite';
```

**New:**

```ts
import { Application, Sprite } from 'pixi.js';
```

#### Custom Builds

PixiJS uses an "extensions" system to add renderer functionality. By default, PixiJS includes many extensions for a comprehensive out-of-the-box experience. However, for full control over features and bundle size, you can manually import specific PixiJS components.

```ts
// imported by default
import 'pixi.js/accessibility';
import 'pixi.js/app';
import 'pixi.js/events';
import 'pixi.js/filters';
import 'pixi.js/sprite-tiling';
import 'pixi.js/text';
import 'pixi.js/text-bitmap';
import 'pixi.js/text-html';
import 'pixi.js/graphics';
import 'pixi.js/mesh';
import 'pixi.js/sprite-nine-slice';

// not added by default, everyone needs to import these manually
import 'pixi.js/advanced-blend-modes';
import 'pixi.js/unsafe-eval';
import 'pixi.js/prepare';
import 'pixi.js/math-extras';
import 'pixi.js/dds';
import 'pixi.js/ktx';
import 'pixi.js/ktx2';
import 'pixi.js/basis';

import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  manageImports: false // disable importing the above extensions
});
```

When initializing the application, you can disable the auto-import feature, preventing PixiJS from importing any extensions automatically. You'll need to import them manually, as demonstrated above.

It should also be noted that the `pixi.js/text-bitmap`, also add `Assets` loading functionality.
Therefore if you want to load bitmap fonts **BEFORE** initialising the renderer, you will need to import this extension.

```ts
import 'pixi.js/text-bitmap';
import { Assets, Application } from 'pixi.js';

await Assets.load('my-font.fnt'); // If 'pixi.js/text-bitmap' is not imported, this will not load
await new Application().init();
```

### **Async Initialisation**

PixiJS will now need to be initialised asynchronously. With the introduction of the WebGPU renderer PixiJS will now need to be awaited before being used

**Old:**

```ts
import { Application } from 'pixi.js';

const app = new Application();

// do pixi things
```

**New:**

```ts
import { Application } from 'pixi.js';

const app = new Application();

(async () => {
  await app.init({
    // application options
  });

  // do pixi things
})();
```

With this change it also means that the `ApplicationOptions` object can now be passed into the `init` function instead of the constructor.

### ** Texture adjustments **

Textures structures have been modified to simplify what was becoming quite a mess behind the scenes in v7.
Textures no longer know or manage loading of resources. This needs to be done upfront by you or the assets manager. Textures expect full loaded resources only. This makes things so much easier to manage as the validation of a texture can essentially be done at construction time and left at that!
BaseTexture no longer exists. Instead we now have a variety of TextureSources available. A texture source combines the settings of a texture with how to upload and use that texture. In v8 there are the following texture sources:

TextureSource - a vanilla texture that you can render too or upload however you wish. (used mainly by render textures)
ImageSource - a texture source that contains an image resource of some kind (eg ImageBitmap or html image)
CanvasSource - a canvas source that contains a canvas. Used mainly for rendering canvases or rendering to a canvas (webGPU)
VideoSource - a texture source that contains a video. Takes care of updating the texture on the GPU to ensure that they stay in sync.
BufferSource - a texture source that contains a buffer. What ever you want really! make sure your buffer type and format are compatible!
CompressedSource - a texture source that handles compressed textures. Used by the GPU compressed texture formats.

Whilst the majority of the time `Assets` will return Textures you may want to make your own! More power to ya!

To create a texture source the signature differs from baseTexture. example:

```

const image = new Image();

image.onload = function(){

  // create a texture source
  const source = new ImageSource({
    resource: image,
  });

  // create a texture
  const texture = new Texture({
    source
  });
}

image.src = 'myImage.png';

```

### **Graphics API Overhaul**

There are a few key changes to the Graphics API. In fact this is probably the most changed part of v8. We have added deprecations where possible but below is the rundown of changes:

- Instead of beginning a fill or a stroke and then building a shape, v8 asks you to build your shape and then stroke / fill it. The terminology of `Line` has been replaced with the terminology of `Stroke`

**Old:**

```ts
// red rect
const graphics = new Graphics().beginFill(0xff0000).drawRect(50, 50, 100, 100).endFill();

// blue rect with stroke
const graphics2 = new Graphics()
  .lineStyle(2, 'white')
  .beginFill('blue')
  .circle(530, 50, 140, 100)
  .endFill();
```

**New:**

```ts
// red rect
const graphics = new Graphics().rect(50, 50, 100, 100).fill(0xff0000);

// blue rect with stroke
const graphics2 = new Graphics()
  .rect(50, 50, 100, 100)
  .fill('blue')
  .stroke({ width: 2, color: 'white' });
```

- Shape functions have been renamed. Each drawing function has been simplified into a shorter version of its name. They have the same parameters though:

| v7 API Call        | v8 API Equivalent |
| ------------------ | ----------------- |
| drawChamferRect    | chamferRect       |
| drawCircle         | circle            |
| drawEllipse        | ellipse           |
| drawFilletRect     | filletRect        |
| drawPolygon        | poly              |
| drawRect           | rect              |
| drawRegularPolygon | regularPoly       |
| drawRoundedPolygon | roundPoly         |
| drawRoundedRect    | roundRect         |
| drawRoundedShape   | roundShape        |
| drawStar           | star              |

- fills functions expect `FillStyle` options or a color, rather than a string of parameters. This also replaces `beginTextureFill`

**Old:**

```ts
const rect = new Graphics()
  .beginTextureFill({ texture: Texture.WHITE, alpha: 0.5, color: 0xff0000 })
  .drawRect(0, 0, 100, 100)
  .endFill()
  .beginFill(0xffff00, 0.5)
  .drawRect(100, 0, 100, 100)
  .endFill();
```

**New:**

```ts
const rect = new Graphics()
  .rect(0, 0, 100, 100)
  .fill({ texture: Texture.WHITE, alpha: 0.5, color: 0xff0000 })
  .rect(100, 0, 100, 100)
  .fill({ color: 0xffff00, alpha: 0.5 });
```

- strokes functions expect `StrokeStyle` options or a color, rather than a string of parameters. This also replaces `lineTextureStyle`
  **Old:**

```ts
  const rect = new Graphics()
    .lineTextureStyle({texture:Texture.WHITE, width:10, color:0xFF0000})
    .drawRect(0, 0, 100, 100)
    .endFill()
    .lineStyle(2, 0xFEEB77);
    .drawRect(100, 0, 100, 100)
    .endFill();

```

**New:**

```ts
const rect = new Graphics()
  .rect(0, 0, 100, 100)
  .stroke({ texture: Texture.WHITE, width: 10, color: 0xff0000 })
  .rect(100, 0, 100, 100)
  .stroke({ color: 0xfeeb77, width: 2 });
```

- holes now make use of a new `cut` function. As with `stroke` and `fill`, `cut` acts on the previous shape.
  **Old:**

```ts
const rectAndHole = new Graphics()
  .beginFill(0x00ff00)
  .drawRect(0, 0, 100, 100)
  .beginHole()
  .drawCircle(50, 50, 20)
  .endHole()
  .endFill();
```

**New:**

```ts
const rectAndHole = new Graphics().rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();
```

- `GraphicsGeometry` has been replaced with `GraphicsContext` this allows for sharing of `Graphics` data more efficiently.

**Old:**

```ts
const rect = new Graphics().beginFill(0xff0000).drawRect(50, 50, 100, 100).endFill();

const geometry = rect.geometry;

const secondRect = new Graphics(geometry);
```

**New:**

```ts
const context = new GraphicsContext().rect(50, 50, 100, 100).fill(0xff0000);

const rect = new Graphics(context);
const secondRect = new Graphics(context);
```

### Shader changes

As we now need to accommodate both WebGL and WebGPU shaders, the way they are constructed has been tweaked to take this into account. The main differences you will notice (this is for shaders in general) is that Textures are no longer considered uniforms (as in they cannot be included in a uniform group). Instead we have the concept of resources. A resource can be a few things including:

- TextureSource - A source texture `myTexture.source`
- TextureStyle - A texture style `myTexture.style`
- UniformGroup - A collection of number based uniforms `myUniforms = new UniformGroup({})`
- BufferResource - A buffer that is treated as a uniform group (advanced)

creating a webgl only shader now looks like this:

**old**

```ts
const shader = PIXI.Shader.from(vertex, fragment, uniforms);
```

**new**

just WebGL

```ts
const shader = Shader.from({
  gl: { vertex, fragment },
  resources // resource used from above including uniform groups
});
```

WebGL and WebGPU

```ts
const shader = Shader.from({
  gl: { vertex, fragment },
  gpu: {
    vertex: {
      entryPoint: 'mainVert',
      source
    },
    fragment: {
      entryPoint: 'mainFrag',
      source
    }
  },
  resources // resource used from above including uniform groups
});
```

Uniforms are also constructed in a slightly different way. When creating them, you now provide the type of variable you want it to be.

**old**

```ts
const uniformGroup = new UniformGroup({
  uTime: 1
});

uniformGroup.uniforms.uTime = 100;
```

**new**

```ts
const uniformGroup = new UniformGroup({
  uTime: { value: 1, type: 'f32' }
});

uniformGroup.uniforms.uTime = 100;
```

The best way to play and fully and get to know this new setup please check out the Mesh and Shader examples:

**old**: [v7 example](https://pixijs.com/7.x/examples/mesh-and-shaders/triangle-color)
**new**: [v8 example](https://pixijs.com/8.x/examples/mesh-and-shaders/triangle-color)

### Filters

Filters work almost exactly the same, unless you are constructing a custom one. If this is the case, the shader changes mentioned above need to taken into account.

**old**

```ts
const filter = new Filter(vertex, fragment, {
  uTime: 0.0
});
```

**new**

```ts
const filter = new Filter({
  glProgram: GlProgram.from({
    fragment,
    vertex
  }),
  resources: {
    timeUniforms: {
      uTime: { value: 0.0, type: 'f32' }
    }
  }
});
```

**old**: [v7 example](https://pixijs.com/7.x/examples/filters-advanced/custom)
**new**: [v8 example](https://pixijs.com/8.x/examples/filters-advanced/custom)

If you're using the [community filters](https://github.com/pixijs/filters), note that the `@pixi/filter-*` packages are no-longer maintained for v8, however, you can import directly from the `pixi-filters` package as sub-modules.

**old**

```ts
import { AdjustmentFilter } from '@pixi/filter-adjustment';
```

**new**

```ts
import { AdjustmentFilter } from 'pixi-filters/adjustment';
```

---

### ParticleContainer

`ParticleContainer` has been reworked in v8 to allow for far more particles than before. There are a few key changes you should be aware of:

A `ParticleContainer` no longer accepts sprites as its children. Instead, it requires a `Particle` class (or an object that implements the `IParticle` interface), which follows this interface:

```
export interface IParticle
{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    anchorX: number;
    anchorY: number;
    rotation: number;
    color: number;
    texture: Texture;
}
```

The reason for this change is that sprites come with many extra properties and events that are generally unnecessary when dealing with large numbers of particles. This approach explicitly removes any ambiguity we had in v7, such as "Why doesn't my sprite work with filters?" or "Why can't I nest children in my sprites?" It’s a bit more predictable. Additionally, due to the lightweight nature of particles, this means we can render far more of them!

So, no functionality is lost—just an API tweak with a massive performance boost!

Particles are also not stored in the `children` array of the `ParticleContainer`, as particles are not technically part of the scene graph (for performance reasons). Instead, they are stored in a flat list called `particleChildren`, which is part of the `ParticleContainer` class. You can modify this array directly for extra speed, or you can use the `addParticle` and `removeParticle` methods to manage your particles.

Another optimization is that `ParticleContainer` does not calculate its own bounds, as doing so would negate the performance gains we've created! Instead, it's up to you to provide a `boundsArea` when initializing the `ParticleContainer`.

---

**OLD**

```ts
const container = new ParticleContainer();

for (let i = 0; i < 100000; i++) {
  const particle = new Sprite(texture);
  container.addChild(particle);
}
```

**NEW**

```ts
const container = new ParticleContainer();

for (let i = 0; i < 100000; i++) {
  const particle = new Particle(texture);
  container.addParticle(particle);
}
```

with a bounds area

```ts
const container = new ParticleContainer({
  boundsArea: new Rectangle(0, 0, 500, 500)
});
```

### Other Breaking Changes

- `DisplayObject` has been removed. `Container` is now the base class for all PixiJS objects.

- `updateTransform` has been removed as nodes no longer contain any rendering logic

  We do recognise that many people used this function to do custom logic every frame, so we have added a new `onRender` function that can be used for this purpose.

  **Old:**

  ```ts
  class MySprite extends Sprite {
    constructor() {
      super();
      this.updateTransform();
  ```

<!-- truncated -->
