# Configuration Reference

## Application Options

Passed to `app.init(options)`. These combine renderer options with Application-specific options.

```ts
await app.init({
  // --- Renderer / Canvas ---
  width: 800, // Canvas width in CSS pixels
  height: 600, // Canvas height in CSS pixels
  backgroundColor: 0x1099bb, // Background color (ColorSource)
  backgroundAlpha: 1, // Background opacity 0-1
  antialias: true, // Enable antialiasing
  resolution: window.devicePixelRatio, // Device pixel ratio (default 1)
  autoDensity: true, // Adjust CSS size for resolution
  canvas: existingCanvas, // Provide your own canvas element
  roundPixels: false, // Force pixel-snapping globally
  clearBeforeRender: true, // Clear canvas before each render
  powerPreference: 'high-performance', // GPU hint: 'default' | 'high-performance' | 'low-power'
  failIfMajorPerformanceCaveat: false, // Fail if GPU is blacklisted

  // --- Renderer Selection ---
  preference: 'webgl', // 'webgl' | 'webgpu' | 'canvas'
  // Or an array to try in order (only listed renderers are candidates):
  // preference: ['webgpu', 'webgl'],

  // Renderer-specific overrides
  webgpu: { antialias: true },
  webgl: { antialias: false },
  canvasOptions: {},

  // --- Application Plugins ---
  autoStart: true, // Auto-start the render loop
  sharedTicker: false, // Use Ticker.shared instead of new Ticker
  resizeTo: window, // Auto-resize to element or window

  // --- Import Control ---
  manageImports: true, // Auto-import default extensions (set false for custom builds)

  // --- Multi-view ---
  multiView: false // Enable rendering to multiple canvases
});
```

## Auto-Detect Renderer Options

`autoDetectRenderer(options)` accepts `AutoDetectOptions`:

| Option                         | Type                     | Default                       | Description                          |
| ------------------------------ | ------------------------ | ----------------------------- | ------------------------------------ |
| `preference`                   | `string \| string[]`     | `['webgl','webgpu','canvas']` | Renderer priority                    |
| `webgpu`                       | `Partial<WebGPUOptions>` | --                            | WebGPU-only overrides                |
| `webgl`                        | `Partial<WebGLOptions>`  | --                            | WebGL-only overrides                 |
| `canvasOptions`                | `Partial<CanvasOptions>` | --                            | Canvas-only overrides                |
| `width`                        | `number`                 | `800`                         | Canvas width                         |
| `height`                       | `number`                 | `600`                         | Canvas height                        |
| `resolution`                   | `number`                 | `1`                           | Device pixel ratio                   |
| `backgroundColor`              | `ColorSource`            | `'black'`                     | Background color                     |
| `antialias`                    | `boolean`                | `false`                       | Enable antialiasing                  |
| `autoDensity`                  | `boolean`                | `false`                       | Adjust CSS dimensions for resolution |
| `canvas`                       | `HTMLCanvasElement`      | --                            | Existing canvas to use               |
| `roundPixels`                  | `boolean`                | `false`                       | Force pixel snapping                 |
| `powerPreference`              | `string`                 | `'default'`                   | GPU power preference                 |
| `failIfMajorPerformanceCaveat` | `boolean`                | `false`                       | Fail on weak GPU                     |
| `multiView`                    | `boolean`                | `false`                       | Multi-canvas rendering               |

## Asset Init Options

```ts
await Assets.init({
  basePath: 'https://cdn.example.com/assets/',
  defaultSearchParams: { v: '1.0.0' },
  manifest: 'assets/manifest.json', // or inline manifest object
  texturePreference: {
    resolution: window.devicePixelRatio,
    format: ['avif', 'webp', 'png'] // preferred formats in order
  },
  skipDetections: false, // skip browser format detection
  bundleIdentifier: { connector: ':' }, // bundle key format
  preferences: {
    crossOrigin: 'anonymous',
    parseAsGraphicsContext: false
  },
  loadOptions: {
    strategy: 'throw', // 'throw' | 'retry' | 'skip'
    retryCount: 3,
    retryDelay: 250
  }
});
```

## Asset Manifest Format

```json
{
  "bundles": [
    {
      "name": "game-screen",
      "assets": [
        {
          "alias": "hero",
          "src": "textures/hero.{avif,webp,png}"
        },
        {
          "alias": ["enemy", "boss"],
          "src": "textures/enemy.png"
        },
        {
          "alias": "spritesheet",
          "src": "sprites/game.json"
        }
      ]
    }
  ]
}
```

## Texture Options

```ts
new Texture({
  source: textureSource, // TextureSource (ImageSource, CanvasSource, etc.)
  frame: new Rectangle(), // Sub-region of the source
  orig: new Rectangle(), // Original dimensions
  trim: new Rectangle(), // Trimmed area
  defaultAnchor: { x: 0.5, y: 0.5 },
  rotate: 0, // groupD8 rotation
  dynamic: false // Set true if you will modify frame/UVs at runtime
});
```

## TextureStyle Options

```ts
new TextureStyle({
  addressMode: 'clamp-to-edge', // 'repeat' | 'clamp-to-edge' | 'mirror-repeat'
  addressModeU: 'repeat',
  addressModeV: 'clamp-to-edge',
  magFilter: 'linear', // 'nearest' | 'linear'
  minFilter: 'linear',
  mipmapFilter: 'linear',
  maxAnisotropy: 1
});
```

## Filter Options

```ts
new Filter({
  glProgram: GlProgram.from({ vertex, fragment }),
  gpuProgram: GpuProgram.from({ vertex: { entryPoint, source }, fragment: { entryPoint, source } }),
  resources: {
    myUniforms: new UniformGroup({
      uTime: { value: 0, type: 'f32' },
      uColor: { value: [1, 0, 0, 1], type: 'vec4<f32>' }
    }),
    uTexture: texture.source,
    uSampler: texture.style
  },
  padding: 0,
  resolution: 1, // or 'inherit'
  antialias: 'off', // 'on' | 'off' | 'inherit'
  blendMode: 'normal',
  blendRequired: false // true if filter needs the back-buffer
});
```

## Built-in Filters

| Filter               | Key Options                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| `AlphaFilter`        | `alpha`                                                                 |
| `BlurFilter`         | `strength`, `quality`, `kernelSize`                                     |
| `ColorMatrixFilter`  | `.brightness()`, `.contrast()`, `.saturate()`, `.hue()`, `.greyscale()` |
| `DisplacementFilter` | `sprite` (displacement map), `scale`                                    |
| `NoiseFilter`        | `noise` (0-1), `seed`                                                   |

## Ticker Options (TickerPlugin)

| Option         | Type      | Default | Description          |
| -------------- | --------- | ------- | -------------------- |
| `autoStart`    | `boolean` | `true`  | Auto-start rendering |
| `sharedTicker` | `boolean` | `false` | Use `Ticker.shared`  |

## Resize Options (ResizePlugin)

| Option     | Type                    | Default | Description        |
| ---------- | ----------------------- | ------- | ------------------ |
| `resizeTo` | `Window \| HTMLElement` | --      | Auto-resize target |

## Event System Options

| Option          | Type        | Default  | Description                                            |
| --------------- | ----------- | -------- | ------------------------------------------------------ |
| `eventMode`     | `EventMode` | `'auto'` | Default event mode for new containers                  |
| `eventFeatures` | `object`    | all true | Enable/disable: `move`, `globalMove`, `click`, `wheel` |

## Garbage Collection Options

```ts
// Renderer-level GC
TextureGCSystem.defaultOptions = {
  textureGCActive: true,
  textureGCMaxIdle: 3600, // seconds before texture is GC'd
  textureGCCheckCountMax: 600 // frames between GC checks
};

// Renderable-level GC
RenderableGCSystem.defaultOptions = {
  renderableGCActive: true,
  renderableGCMaxUnusedTime: 60_000, // ms
  renderableGCFrequency: 30_000 // ms between checks
};
```

## Custom Builds (manual imports)

When `manageImports: false`, you control exactly which extensions are loaded:

```ts
// These are imported by default (with manageImports: true):
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
import 'pixi.js/particle-container';

// These must always be imported manually:
import 'pixi.js/advanced-blend-modes';
import 'pixi.js/unsafe-eval';
import 'pixi.js/prepare';
import 'pixi.js/math-extras';
import 'pixi.js/dds';
import 'pixi.js/ktx';
import 'pixi.js/ktx2';
import 'pixi.js/basis';
```

**Pitfall**: If you load bitmap fonts via `Assets.load('font.fnt')` BEFORE `app.init()`, you must explicitly `import 'pixi.js/text-bitmap'` first -- otherwise the bitmap font loader is not registered.
