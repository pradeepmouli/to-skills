# PixiJS v8 — Configuration Reference

## ApplicationOptions

`ApplicationOptions` extends `AutoDetectOptions` which extends `RendererOptions`. All fields are optional.

### Renderer Selection

```ts
interface AutoDetectOptions {
  // Preferred renderer type(s)
  // string: try that first, then fall back in default priority (webgl → webgpu → canvas)
  // array: only try those, in that order; omitted types are excluded entirely
  preference?: 'webgl' | 'webgpu' | 'canvas' | Array<'webgl' | 'webgpu' | 'canvas'>;

  // Per-renderer overrides (merged with base options when that renderer is selected)
  webgpu?: Partial<WebGPUOptions>;
  webgl?: Partial<WebGLOptions>;
  canvasOptions?: Partial<CanvasOptions>;
}
```

Default renderer priority: `webgl → webgpu → canvas`

### Shared Renderer Options (RendererOptions)

```ts
interface SharedRendererOptions {
  // Canvas dimensions
  width?: number; // default: 800
  height?: number; // default: 600

  // Canvas element
  canvas?: ICanvas; // provide existing canvas element
  view?: ICanvas; // deprecated alias for canvas

  // Background
  backgroundColor?: ColorSource; // default: 0x000000 (black)
  backgroundAlpha?: number; // default: 1
  clearBeforeRender?: boolean; // default: true

  // Quality
  antialias?: boolean; // default: false
  resolution?: number; // default: 1 (use window.devicePixelRatio for HiDPI)
  autoDensity?: boolean; // default: false (auto-adjust CSS size for resolution)

  // Rendering behavior
  roundPixels?: boolean; // default: false (force pixel-snapping globally)
  multiView?: boolean; // default: false (allow multiple canvas targets)

  // WebGL-specific
  premultipliedAlpha?: boolean; // default: true
  preserveDrawingBuffer?: boolean; // default: false (needed for screenshots)
  failIfMajorPerformanceCaveat?: boolean; // default: false

  // Power preference
  powerPreference?: 'default' | 'high-performance' | 'low-power';

  // Extensions
  manageImports?: boolean; // default: true (auto-import built-in extensions)
  skipExtensionImports?: boolean; // advanced alias for manageImports: false
}
```

### TickerPlugin Options (merged into ApplicationOptions)

```ts
// From TickerPlugin (automatically added to Application)
interface TickerPluginOptions {
  autoStart?: boolean; // default: true
  sharedTicker?: boolean; // default: false
}
```

### ResizePlugin Options (merged into ApplicationOptions)

```ts
// From ResizePlugin (automatically added to Application)
interface ResizePluginOptions {
  resizeTo?: Window | HTMLElement; // auto-resize to this element
}
```

### Texture GC Options (merged into ApplicationOptions)

```ts
// From TextureGCSystem
interface TextureGCOptions {
  textureGCActive?: boolean; // default: true
  textureGCMaxIdle?: number; // default: 3600 frames (~60s at 60fps)
  textureGCCheckCountMax?: number; // default: 600 frames (~10s at 60fps)
}
```

---

## Complete init() Example

```ts
const app = new Application();

await app.init({
  // Canvas
  width: 800,
  height: 600,

  // Renderer
  preference: 'webgl', // or 'webgpu', or ['webgl', 'canvas']
  antialias: true,
  resolution: window.devicePixelRatio,
  autoDensity: true, // scales canvas CSS size to match resolution

  // Background
  backgroundColor: 0x1099bb,
  backgroundAlpha: 1,

  // Performance
  roundPixels: false,
  failIfMajorPerformanceCaveat: false,

  // Loop
  autoStart: true,
  sharedTicker: false,

  // Layout
  resizeTo: window, // auto-resize canvas to window

  // Texture GC
  textureGCActive: true,
  textureGCMaxIdle: 3600,
  textureGCCheckCountMax: 600,

  // Custom renderer options per type
  webgpu: { antialias: true, backgroundColor: 'blue' },
  webgl: { antialias: true, backgroundColor: 'green' }
});
```

---

## AbstractRenderer.defaultOptions

For global defaults that apply before `init()` is called:

```ts
import { AbstractRenderer } from 'pixi.js';

// Override global defaults
AbstractRenderer.defaultOptions.resolution = window.devicePixelRatio;
AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat = false;
AbstractRenderer.defaultOptions.roundPixels = false;
```

---

## Assets.init() Options (AssetInitOptions)

```ts
await Assets.init({
  // Base URL for all assets
  basePath?: string;              // e.g. 'https://cdn.example.com/assets/'

  // Cache-busting / versioning params appended to all URLs
  defaultSearchParams?: string | Record<string, any>;
  // e.g. '?v=1.0.0' or { v: '1.0.0', t: Date.now() }

  // Asset manifest — define all app assets upfront
  manifest?: string | AssetsManifest;
  // Can be a URL to a JSON file or an inline object

  // Format/resolution preferences
  texturePreference?: {
    resolution?: number | number[];        // e.g. window.devicePixelRatio
    format?: string | string[];            // e.g. ['avif', 'webp', 'png']
  };

  // Skip browser format detection (faster init, but you must set formats manually)
  skipDetections?: boolean;

  // Bundle ID collision handling
  bundleIdentifier?: {
    connector?: string;            // default ':'
    createBundleAssetId?: (bundleId: string, assetId: string) => string;
    extractAssetIdFromBundle?: (bundleId: string, bundleAssetId: string) => string;
  };

  // Loader preferences
  preferences?: {
    crossOrigin?: string;          // 'anonymous' | 'use-credentials'
    parseAsGraphicsContext?: boolean;
  };

  // Load behavior
  loadOptions?: {
    onProgress?: (progress: number) => void;
    onError?: (error: Error, asset: ResolvedAsset) => void;
    strategy?: 'throw' | 'retry' | 'skip';
    retryCount?: number;           // default 3
    retryDelay?: number;           // ms, default 250
  };
});
```

### AssetsManifest Format

```ts
interface AssetsManifest {
  bundles: Array<{
    name: string;
    assets: Array<{
      alias: string | string[];
      src: string | string[]; // 'sprite.{webp,png}' or array
      data?: Record<string, any>; // passed to loader: scaleMode, etc.
    }>;
  }>;
}

// Example
await Assets.init({
  manifest: {
    bundles: [
      {
        name: 'loading-screen',
        assets: [{ alias: 'loading-bg', src: 'loading-bg.{avif,webp,png}' }]
      },
      {
        name: 'game',
        assets: [
          { alias: 'hero', src: 'hero.webp' },
          { alias: 'tilemap', src: 'tilemap.json' },
          { alias: ['music', 'bgm'], src: 'music.mp3' }
        ]
      }
    ]
  }
});

await Assets.loadBundle('loading-screen');
await Assets.loadBundle('game');
```

---

## TextureOptions

```ts
interface TextureOptions {
  source?: TextureSource; // underlying GPU resource
  label?: string;
  frame?: Rectangle; // which portion of the source to display
  orig?: Rectangle; // original unscaled area
  trim?: Rectangle; // trimmed transparency area
  defaultAnchor?: { x: number; y: number };
  defaultBorders?: TextureBorders; // for NineSliceSprite
  rotate?: number; // texture packer rotation
  dynamic?: boolean; // set true if modifying frame/UVs at runtime
}
```

---

## TextureSource Types (replaces BaseTexture)

```ts
// v7 BaseTexture is replaced by typed sources in v8:

// General purpose (for render textures)
const source = new TextureSource({ width: 256, height: 256 });

// Image (HTMLImageElement, ImageBitmap, etc.)
const source = new ImageSource({ resource: htmlImageElement });

// Canvas
const source = new CanvasSource({ resource: htmlCanvasElement });

// Video
const source = new VideoSource({ resource: htmlVideoElement });

// Buffer (raw data)
const source = new BufferSource({ data: uint8Array, width, height });

// Compressed texture
const source = new CompressedSource({ ... });

// All sources share:
source.scaleMode: 'nearest' | 'linear';
source.wrapMode: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
source.autoGenerateMipmaps: boolean; // was 'mipmap' in v7
source.unload(): void;               // remove from GPU
source.update(): void;               // mark dirty, re-upload
source.updateMipmaps(): void;        // manually update mipmaps (RenderTextures)
```

---

## RenderOptions

Options passed to `renderer.render()`:

```ts
interface RenderOptions {
  container: Container; // what to render
  target?: RenderSurface; // where to render (default: main canvas)
  transform?: Matrix; // override container transform
  clearColor?: ColorSource; // override background color
  clear?: boolean | CLEAR; // whether to clear before rendering
  mipLevel?: number; // mip level for texture targets (default 0)
  layer?: number; // array layer for array textures (default 0)
}

// Usage
renderer.render({ container: myScene });
renderer.render({ container: myScene, target: renderTexture });
renderer.render({ container: myScene, clearColor: 0x1099bb, clear: true });
```

---

## GraphicsContext.defaultFillStyle / defaultStrokeStyle

```ts
// Defaults used when no style is specified
GraphicsContext.defaultFillStyle = {
  color: 0xffffff,
  alpha: 1,
  texture: Texture.WHITE,
  matrix: null,
  fill: null,
  textureSpace: 'local' // 'local' | 'global'
};

GraphicsContext.defaultStrokeStyle = {
  width: 1,
  color: 0xffffff,
  alpha: 1
  // ... cap, join, miterLimit, etc.
};
```

---

## FillStyle / StrokeStyle

```ts
type FillInput =
  | ColorSource // 0xff0000, 'red', '#ff0000'
  | {
      color?: ColorSource;
      alpha?: number;
      texture?: Texture;
      textureSpace?: 'local' | 'global';
      matrix?: Matrix;
    }
  | FillGradient // gradient fill
  | FillPattern; // texture pattern fill

type StrokeInput =
  | ColorSource
  | {
      color?: ColorSource;
      alpha?: number;
      width?: number;
      cap?: 'butt' | 'round' | 'square';
      join?: 'miter' | 'bevel' | 'round';
      miterLimit?: number;
      alignment?: number; // 0=inner, 0.5=center, 1=outer
      texture?: Texture;
      textureSpace?: 'local' | 'global';
    };
```

---

## DOMAdapter

Replaces `settings.ADAPTER` from v7:

```ts
import { DOMAdapter, BrowserAdapter, WebWorkerAdapter } from 'pixi.js';

// Default (browser environment)
DOMAdapter.set(BrowserAdapter);

// Web Worker
DOMAdapter.set(WebWorkerAdapter);
DOMAdapter.get().createCanvas();

// Access current adapter
const adapter = DOMAdapter.get();
```

---

## Ticker

```ts
import { Ticker } from 'pixi.js';

// Shared global ticker (used by default in Application)
const ticker = Ticker.shared;
// System ticker (always running, for internal use)
const ticker = Ticker.system;

ticker.add((ticker: Ticker) => {
  // ticker.deltaTime  — elapsed frames (1 at 60fps, 2 at 30fps, etc.)
  // ticker.deltaMS    — elapsed milliseconds
  // ticker.elapsedMS  — elapsed since last frame in ms
  // ticker.speed      — ticker speed multiplier
  // ticker.FPS        — current frames per second
  // ticker.lastTime   — timestamp of last frame
});

ticker.addOnce(fn); // run fn once, then remove
ticker.remove(fn);
ticker.start();
ticker.stop();
ticker.speed = 0.5; // slow motion
ticker.minFPS = 10; // minimum FPS (stops tick if slower)
ticker.maxFPS = 60; // cap FPS
```
