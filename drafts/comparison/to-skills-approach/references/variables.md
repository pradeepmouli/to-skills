# Variables & Constants

## assets

### `Assets`

The global Assets class is a singleton that manages loading, caching, and unloading of all resources
in your PixiJS application.

Key responsibilities:

- **URL Resolution**: Maps URLs/keys to browser-compatible resources
- **Resource Loading**: Handles loading and transformation of assets
- **Asset Caching**: Manages a global cache to prevent duplicate loads
- **Memory Management**: Provides unloading capabilities to free memory

Advanced Features:

- **Asset Bundles**: Group and manage related assets together
- **Background Loading**: Load assets before they're needed over time
- **Format Detection**: Automatically select optimal asset formats

Supported Asset Types:
| Type | Extensions | Loaders |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Textures | `.png`, `.jpg`, `.gif`, `.webp`, `.avif`, `.svg` | loadTextures, loadSvg |
| Video Textures | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | loadVideoTextures |
| Sprite Sheets | `.json` | spritesheetAsset |
| Bitmap Fonts | `.fnt`, `.xml`, `.txt` | loadBitmapFont |
| Web Fonts | `.ttf`, `.otf`, `.woff`, `.woff2` | loadWebFont |
| JSON | `.json` | loadJson |
| Text | `.txt` | loadTxt |
| Compressed Textures | `.basis`, `.dds`, `.ktx`, `.ktx2` | loadBasis, loadDDS, loadKTX, loadKTX2 |

> [!NOTE] Some loaders allow for custom configuration, please refer to the specific loader documentation for details.

```ts
const Assets: AssetsClass;
```

### `Cache`

A global cache for all assets in your PixiJS application. The cache system provides fast
access to loaded assets and prevents duplicate loading.

Key Features:

- Automatic caching of loaded assets
- Support for custom cache parsers
- Automatic parsing of complex assets (e.g., spritesheets)
- Memory management utilities
  > [!IMPORTANT] You typically do not need to use this class directly.
  > Use the main Assets class for high-level asset management.
  > `Assets.get(key)` will automatically use the cache.

```ts
const Cache: CacheClass;
```

### `loadJson`

A simple loader plugin for loading json data

```ts
const loadJson: {
  extension: { type: LoadParser; priority: LoaderParserPriority };
  name: string;
  id: string;
  test: any;
  load: any;
};
```

### `loadTxt`

A simple loader plugin for loading text data

```ts
const loadTxt: {
  name: string;
  id: string;
  extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
  test: any;
  load: any;
};
```

### `loadWebFont`

A loader plugin for handling web fonts

```ts
const loadWebFont: {
  extension: { type: LoadParser; priority: LoaderParserPriority };
  name: string;
  id: string;
  test: any;
  load: any;
  unload: any;
};
```

### `loadSvg`

A loader plugin for loading SVG data as textures or graphics contexts.

```ts
const loadSvg: LoaderParser<
  Texture | GraphicsContext,
  TextureSourceOptions & LoadSVGConfig,
  LoadSVGConfig
>;
```

### `loadTextures`

A simple plugin to load our textures!
This makes use of imageBitmaps where available.
We load the `ImageBitmap` on a different thread using workers if possible.
We can then use the `ImageBitmap` as a source for a Pixi texture

You can customize the behavior of this loader by setting the `config` property.
Which can be found [here]LoadTextureConfig

```js
// Set the config
import { loadTextures } from 'pixi.js';

loadTextures.config = {
  // If true we will use a worker to load the ImageBitmap
  preferWorkers: true,
  // If false we will use new Image() instead of createImageBitmap,
  // we'll also disable the use of workers as it requires createImageBitmap
  preferCreateImageBitmap: true,
  crossOrigin: 'anonymous'
};
```

```ts
const loadTextures: LoaderParser<Texture, TextureSourceOptions, LoadTextureConfig>;
```

### `loadVideoTextures`

A simple plugin to load video textures.

You can pass VideoSource options to the loader via the .data property of the asset descriptor
when using Assets.load().

```js
// Set the data
const texture = await Assets.load({
  src: './assets/city.mp4',
  data: {
    preload: true,
    autoPlay: true
  }
});
```

```ts
const loadVideoTextures: {
  name: string;
  id: string;
  extension: { type: LoadParser; name: string };
  test: any;
  load: any;
  unload: any;
};
```

### `loadBasis`

Loads Basis textures using a web worker.

```ts
const loadBasis: {
  extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
  name: string;
  id: string;
  test: any;
  load: any;
  unload: any;
};
```

### `basisTranscoderUrls`

The urls for the Basis transcoder files.
These can be set to custom paths if needed.

```ts
const basisTranscoderUrls: { jsUrl: string; wasmUrl: string };
```

### `loadDDS`

Loads DDS textures.

```ts
const loadDDS: {
  extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
  name: string;
  id: string;
  test: any;
  load: any;
  unload: any;
};
```

### `loadKTX`

Loads KTX textures.

```ts
const loadKTX: {
  extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
  name: string;
  id: string;
  test: any;
  load: any;
  unload: any;
};
```

### `loadKTX2`

Loader parser for KTX2 textures.
This parser loads KTX2 textures using a web worker for transcoding.
It supports both single and multiple textures.

```ts
const loadKTX2: {
  extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
  name: string;
  id: string;
  test: any;
  load: any;
  unload: any;
};
```

### `ktxTranscoderUrls`

The urls for the KTX transcoder library.
These can be set to custom paths if needed.

```ts
const ktxTranscoderUrls: { jsUrl: string; wasmUrl: string };
```

### `loadBitmapFont`

Loader plugin for loading bitmap fonts.
It supports both XML and text formats, and can handle distance field fonts.

```ts
const loadBitmapFont: {
  extension: { type: LoadParser; priority: LoaderParserPriority };
  name: string;
  id: string;
  test: any;
  testParse: any;
  parse: any;
  load: any;
  unload: any;
};
```

### `spritesheetAsset`

Asset extension for loading spritesheets

```ts
const spritesheetAsset: {
  extension: Asset;
  cache: {
    test: (asset: Spritesheet) => boolean;
    getCacheableAssets: (keys: string[], asset: Spritesheet) => Record<string, any>;
  };
  resolver: {
    extension: { type: ResolveParser; name: string };
    test: (value: string) => boolean;
    parse: (value: string) => { resolution: number; format: string; src: string };
  };
  loader: {
    name: string;
    id: string;
    extension: { type: LoadParser; priority: LoaderParserPriority; name: string };
    testParse: any;
    parse: any;
    unload: any;
  };
};
```

### `WorkerManager`

Manages a pool of web workers for loading ImageBitmap objects asynchronously.

This class provides a thread-safe way to load images using web workers,
automatically managing worker creation, pooling, and cleanup. It supports
checking ImageBitmap support and queuing multiple load requests.

> [!IMPORTANT] You should not need to use this class directly
> However, you can call `WorkerManager.reset()` to clean up all workers when they are no longer needed.

```ts
const WorkerManager: WorkerManagerClass;
```

## `FOURCC_TO_TEXTURE_FORMAT`

Maps `FOURCC_*` formats to TEXTURE_FORMATS.
https://en.wikipedia.org/wiki/S3_Texture_Compression#S3TC_format_comparison
https://github.com/microsoft/DirectXTex/blob/main/DDSTextureLoader/DDSTextureLoader11.cpp

```ts
const FOURCC_TO_TEXTURE_FORMAT: { [id: number]: TEXTURE_FORMATS };
```

## `DXGI_TO_TEXTURE_FORMAT`

Maps DXGI_FORMAT to TEXTURE_FORMATS

```ts
const DXGI_TO_TEXTURE_FORMAT: { [id: number]: TEXTURE_FORMATS };
```

## `buildPolygon`

Builds a rectangle to draw

Ignored from docs since it is not directly exposed.

```ts
const buildPolygon: ShapeBuildCommand<Polygon>;
```

## `buildRectangle`

Builds a rectangle to draw

Ignored from docs since it is not directly exposed.

```ts
const buildRectangle: ShapeBuildCommand<Rectangle>;
```

## `buildTriangle`

Builds a triangle to draw

Ignored from docs since it is not directly exposed.

```ts
const buildTriangle: ShapeBuildCommand<Triangle>;
```

## `blendTemplateFrag`

```ts
const blendTemplateFrag: 'string';
```

## `blendTemplateVert`

```ts
const blendTemplateVert: 'string';
```

## `blendTemplateWgsl`

```ts
const blendTemplateWgsl: 'string';
```

## `fragmentGlTemplate`

```ts
const fragmentGlTemplate: '\n\n    in vec4 vColor;\n    in vec2 vUV;\n\n    out vec4 finalColor;\n\n    {{header}}\n\n    void main(void) {\n\n        {{start}}\n\n        vec4 outColor;\n\n        {{main}}\n\n        finalColor = outColor * vColor;\n\n        {{end}}\n    }\n';
```

## `fragmentGPUTemplate`

```ts
const fragmentGPUTemplate: '\n    @in vUV : vec2<f32>;\n    @in vColor : vec4<f32>;\n\n    {{header}}\n\n    @fragment\n    fn main(\n        {{in}}\n      ) -> @location(0) vec4<f32> {\n\n        {{start}}\n\n        var outColor:vec4<f32>;\n\n        {{main}}\n\n        var finalColor:vec4<f32> = outColor * vColor;\n\n        {{end}}\n\n        return finalColor;\n      };\n';
```

## `vertexGlTemplate`

```ts
const vertexGlTemplate: '\n    in vec2 aPosition;\n    in vec2 aUV;\n\n    out vec4 vColor;\n    out vec2 vUV;\n\n    {{header}}\n\n    void main(void){\n\n        mat3 worldTransformMatrix = uWorldTransformMatrix;\n        mat3 modelMatrix = mat3(\n            1.0, 0.0, 0.0,\n            0.0, 1.0, 0.0,\n            0.0, 0.0, 1.0\n          );\n        vec2 position = aPosition;\n        vec2 uv = aUV;\n\n        {{start}}\n\n        vColor = vec4(1.);\n\n        {{main}}\n\n        vUV = uv;\n\n        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;\n\n        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n\n        vColor *= uWorldColorAlpha;\n\n        {{end}}\n    }\n';
```

## `vertexGPUTemplate`

```ts
const vertexGPUTemplate: '\n    @in aPosition: vec2<f32>;\n    @in aUV: vec2<f32>;\n\n    @out @builtin(position) vPosition: vec4<f32>;\n    @out vUV : vec2<f32>;\n    @out vColor : vec4<f32>;\n\n    {{header}}\n\n    struct VSOutput {\n        {{struct}}\n    };\n\n    @vertex\n    fn main( {{in}} ) -> VSOutput {\n\n        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;\n        var modelMatrix = mat3x3<f32>(\n            1.0, 0.0, 0.0,\n            0.0, 1.0, 0.0,\n            0.0, 0.0, 1.0\n          );\n        var position = aPosition;\n        var uv = aUV;\n\n        {{start}}\n\n        vColor = vec4<f32>(1., 1., 1., 1.);\n\n        {{main}}\n\n        vUV = uv;\n\n        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;\n\n        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);\n\n        vColor *= globalUniforms.uWorldColorAlpha;\n\n        {{end}}\n\n        {{return}}\n    };\n';
```

## environment

### `DOMAdapter`

The DOMAdapter is a singleton that allows PixiJS to perform DOM operations, such as creating a canvas.
This allows PixiJS to be used in any environment, such as a web browser, Web Worker, or Node.js.
It uses the Adapter interface to abstract away the differences between these environments
and uses the BrowserAdapter by default.

It has two methods: `get():Adapter` and `set(adapter: Adapter)`.

Defaults to the BrowserAdapter.

```ts
const DOMAdapter: { get: any; set: any };
```

### `BrowserAdapter`

This is an implementation of the Adapter interface.
It can be used to make Pixi work in the browser.

```ts
const BrowserAdapter: Adapter;
```

### `WebWorkerAdapter`

This is an implementation of the Adapter interface.
It can be used to make Pixi work in a Web Worker.

```ts
const WebWorkerAdapter: Adapter;
```

## events

### `EventsTicker`

This class handles automatic firing of PointerEvents
in the case where the pointer is stationary for too long.
This is to ensure that hit-tests are still run on moving objects.

```ts
const EventsTicker: EventsTickerClass;
```

## maths

### `groupD8`

Implements the dihedral group D8, which is similar to
[group D4]http://mathworld.wolfram.com/DihedralGroupD4.html;
D8 is the same but with diagonals, and it is used for texture
rotations.

The directions the U- and V- axes after rotation
of an angle of `a: GD8Constant` are the vectors `(uX(a), uY(a))`
and `(vX(a), vY(a))`. These aren't necessarily unit vectors.

```ts
const groupD8: {
  E: number;
  SE: number;
  S: number;
  SW: number;
  W: number;
  NW: number;
  N: number;
  NE: number;
  MIRROR_VERTICAL: number;
  MAIN_DIAGONAL: number;
  MIRROR_HORIZONTAL: number;
  REVERSE_DIAGONAL: number;
  uX: (ind: number) => number;
  uY: (ind: number) => number;
  vX: (ind: number) => number;
  vY: (ind: number) => number;
  inv: (rotation: number) => number;
  add: (rotationSecond: number, rotationFirst: number) => number;
  sub: (rotationSecond: number, rotationFirst: number) => number;
  rotate180: (rotation: number) => number;
  isVertical: (rotation: number) => boolean;
  byDirection: (dx: number, dy: number) => number;
  matrixAppendRotationInv: (
    matrix: Matrix,
    rotation: number,
    tx: number,
    ty: number,
    dw: number,
    dh: number
  ) => void;
  transformRectCoords: (
    rect: RectangleLike,
    sourceFrame: RectangleLike,
    rotation: number,
    out: Rectangle
  ) => Rectangle;
};
```

### `PI_2`

Two Pi.

```ts
const PI_2: number;
```

### `RAD_TO_DEG`

Conversion factor for converting radians to degrees.

```ts
const RAD_TO_DEG: number;
```

### `DEG_TO_RAD`

Conversion factor for converting degrees to radians.

```ts
const DEG_TO_RAD: number;
```

## rendering

### `MaskEffectManager`

A class that manages the conversion of masks to mask effects.

```ts
const MaskEffectManager: MaskEffectManagerClass;
```

### `DRAW_MODES`

```ts
const DRAW_MODES: {
  POINTS: string;
  LINES: string;
  LINE_STRIP: string;
  TRIANGLES: string;
  TRIANGLE_STRIP: string;
};
```

### `BLEND_TO_NPM`

The map of blend modes supported by Pixi

```ts
const BLEND_TO_NPM: { normal: string; add: string; screen: string };
```

### `WRAP_MODES`

The wrap modes that are supported by pixi.

```ts
const WRAP_MODES: typeof DEPRECATED_WRAP_MODES;
```

### `SCALE_MODES`

The scale modes that are supported by pixi.

```ts
const SCALE_MODES: typeof DEPRECATED_SCALE_MODES;
```

### `TexturePool`

The default texture pool instance.

```ts
const TexturePool: TexturePoolClass;
```

## scene

### `styleAttributes`

A map of SVG style attributes and their default values.
Each attribute has a type and default value used for SVG parsing.

- 'paint' type can be a color or gradient
- 'number' type is a numeric value
- 'string' type is a text value

```ts
const styleAttributes: { fill: { type: string; default: number }; fill-opacity: { type: string; default: number }; stroke: { type: string; default: number }; stroke-width: { type: string; default: number }; stroke-opacity: { type: string; default: number }; stroke-linecap: { type: string; default: string }; stroke-linejoin: { type: string; default: string }; stroke-miterlimit: { type: string; default: number }; stroke-dasharray: { type: string; default: string }; stroke-dashoffset: { type: string; default: number }; opacity: { type: string; default: number } }
```

### `shapeBuilders`

A record of shape builders, keyed by shape type.

```ts

<!-- truncated -->
```
