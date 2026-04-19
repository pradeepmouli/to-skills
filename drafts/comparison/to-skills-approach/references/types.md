# Types & Enums

## accessibility

### `PointerEvents`

The type of the pointer event to listen for.

```ts
'auto' |
  'none' |
  'visiblePainted' |
  'visibleFill' |
  'visibleStroke' |
  'visible' |
  'painted' |
  'fill' |
  'stroke' |
  'all' |
  'inherit';
```

## `AccessibleTarget`

The Accessibility object is attached to the Container.
**Properties:**

- `_accessibleActive: boolean`
- `_accessibleDiv: AccessibleHTMLElement`
- `_renderId: number`
- `accessible: boolean` — Flag for if the object is accessible. If true AccessibilityManager will overlay a
  shadow div with attributes set
- `accessibleTitle: string` — Sets the title attribute of the shadow div
  If accessibleTitle AND accessibleHint has not been this will default to 'container [tabIndex]'
- `accessibleHint: string` — Sets the aria-label attribute of the shadow div
- `tabIndex: number` — Sets the tabIndex of the shadow div. You can use this to set the order of the
  elements when using the tab key to navigate.
- `accessibleType: keyof HTMLElementTagNameMap` — Specify the type of div the accessible layer is. Screen readers treat the element differently
  depending on this type. Defaults to button.
- `accessiblePointerEvents: PointerEvents` — Specify the pointer-events the accessible div will use
  Defaults to auto.
- `accessibleText: string` — Sets the text content of the shadow
- `accessibleChildren: boolean` — Setting to false will prevent any children inside this container to
  be accessible. Defaults to true.

## `EmitterListeners`

Internal storage of event listeners in EventEmitter.

```ts
Record<string, EmitterListener | EmitterListener[]>;
```

## `CacheAsTextureMixinConstructor`

**Properties:**

- `cacheAsTexture: (val: boolean | CacheAsTextureOptions) => void` (optional)

## `EffectsMixinConstructor`

**Properties:**

- `mask: Mask` (optional) — The mask to apply, which can be a Container or null.

If null, it clears the existing mask.

- `setMask: (options: Partial<MaskOptionsAndMask>) => void` (optional)
- `filters: Filter | readonly Filter[]` (optional) — Sets the filters for the displayObject.
  Filters are visual effects that can be applied to any display object and its children.

> [!IMPORTANT] This is a WebGL/WebGPU only feature and will be ignored by the canvas renderer.

## `FindMixinConstructor`

**Properties:**

- `label: string` (optional) — The instance label of the object.

## `MeasureMixinConstructor`

**Properties:**

- `width: number` (optional) — The width of the display object, in pixels.
- `height: number` (optional) — The height of the display object, in pixels.

## `SortMixinConstructor`

**Properties:**

- `zIndex: number` (optional) — The zIndex of the container.

Controls the rendering order of children within their parent container.

A higher value will mean it will be moved towards the front of the rendering order.

- `sortableChildren: boolean` (optional) — If set to true, the container will sort its children by `zIndex` value
  when the next render is called, or manually if `sortChildren()` is called.

This actually changes the order of elements in the array of children,
so it will affect the rendering order.

> [!NOTE] Also be aware of that this may not work nicely with the `addChildAt()` function,
> as the `zIndex` sorting may cause the child to automatically sorted to another position.

## `BitmapFontRawData`

Internal data format used to convert to BitmapFontData.
**Properties:**

- `info: { face: string; size: string }[]`
- `common: { lineHeight: string; base: string }[]`
- `page: { id: string; file: string }[]`
- `chars: { count: number }[]`
- `char: { id: string; page: string; xoffset: string; yoffset: string; xadvance: string; x: string; y: string; width: string; height: string; letter?: string; char?: string }[]`
- `kernings: { count: number }[]` (optional)
- `kerning: { first: string; second: string; amount: string }[]` (optional)
- `distanceField: { fieldType: "none" | "sdf" | "msdf"; distanceRange: string }[]` (optional)

## `DXGI_FORMAT`

- `DXGI_FORMAT_UNKNOWN` = `0`
- `DXGI_FORMAT_R32G32B32A32_TYPELESS` = `1`
- `DXGI_FORMAT_R32G32B32A32_FLOAT` = `2`
- `DXGI_FORMAT_R32G32B32A32_UINT` = `3`
- `DXGI_FORMAT_R32G32B32A32_SINT` = `4`
- `DXGI_FORMAT_R32G32B32_TYPELESS` = `5`
- `DXGI_FORMAT_R32G32B32_FLOAT` = `6`
- `DXGI_FORMAT_R32G32B32_UINT` = `7`
- `DXGI_FORMAT_R32G32B32_SINT` = `8`
- `DXGI_FORMAT_R16G16B16A16_TYPELESS` = `9`
- `DXGI_FORMAT_R16G16B16A16_FLOAT` = `10`
- `DXGI_FORMAT_R16G16B16A16_UNORM` = `11`
- `DXGI_FORMAT_R16G16B16A16_UINT` = `12`
- `DXGI_FORMAT_R16G16B16A16_SNORM` = `13`
- `DXGI_FORMAT_R16G16B16A16_SINT` = `14`
- `DXGI_FORMAT_R32G32_TYPELESS` = `15`
- `DXGI_FORMAT_R32G32_FLOAT` = `16`
- `DXGI_FORMAT_R32G32_UINT` = `17`
- `DXGI_FORMAT_R32G32_SINT` = `18`
- `DXGI_FORMAT_R32G8X24_TYPELESS` = `19`
- `DXGI_FORMAT_D32_FLOAT_S8X24_UINT` = `20`
- `DXGI_FORMAT_R32_FLOAT_X8X24_TYPELESS` = `21`
- `DXGI_FORMAT_X32_TYPELESS_G8X24_UINT` = `22`
- `DXGI_FORMAT_R10G10B10A2_TYPELESS` = `23`
- `DXGI_FORMAT_R10G10B10A2_UNORM` = `24`
- `DXGI_FORMAT_R10G10B10A2_UINT` = `25`
- `DXGI_FORMAT_R11G11B10_FLOAT` = `26`
- `DXGI_FORMAT_R8G8B8A8_TYPELESS` = `27`
- `DXGI_FORMAT_R8G8B8A8_UNORM` = `28`
- `DXGI_FORMAT_R8G8B8A8_UNORM_SRGB` = `29`
- `DXGI_FORMAT_R8G8B8A8_UINT` = `30`
- `DXGI_FORMAT_R8G8B8A8_SNORM` = `31`
- `DXGI_FORMAT_R8G8B8A8_SINT` = `32`
- `DXGI_FORMAT_R16G16_TYPELESS` = `33`
- `DXGI_FORMAT_R16G16_FLOAT` = `34`
- `DXGI_FORMAT_R16G16_UNORM` = `35`
- `DXGI_FORMAT_R16G16_UINT` = `36`
- `DXGI_FORMAT_R16G16_SNORM` = `37`
- `DXGI_FORMAT_R16G16_SINT` = `38`
- `DXGI_FORMAT_R32_TYPELESS` = `39`
- `DXGI_FORMAT_D32_FLOAT` = `40`
- `DXGI_FORMAT_R32_FLOAT` = `41`
- `DXGI_FORMAT_R32_UINT` = `42`
- `DXGI_FORMAT_R32_SINT` = `43`
- `DXGI_FORMAT_R24G8_TYPELESS` = `44`
- `DXGI_FORMAT_D24_UNORM_S8_UINT` = `45`
- `DXGI_FORMAT_R24_UNORM_X8_TYPELESS` = `46`
- `DXGI_FORMAT_X24_TYPELESS_G8_UINT` = `47`
- `DXGI_FORMAT_R8G8_TYPELESS` = `48`
- `DXGI_FORMAT_R8G8_UNORM` = `49`
- `DXGI_FORMAT_R8G8_UINT` = `50`
- `DXGI_FORMAT_R8G8_SNORM` = `51`
- `DXGI_FORMAT_R8G8_SINT` = `52`
- `DXGI_FORMAT_R16_TYPELESS` = `53`
- `DXGI_FORMAT_R16_FLOAT` = `54`
- `DXGI_FORMAT_D16_UNORM` = `55`
- `DXGI_FORMAT_R16_UNORM` = `56`
- `DXGI_FORMAT_R16_UINT` = `57`
- `DXGI_FORMAT_R16_SNORM` = `58`
- `DXGI_FORMAT_R16_SINT` = `59`
- `DXGI_FORMAT_R8_TYPELESS` = `60`
- `DXGI_FORMAT_R8_UNORM` = `61`
- `DXGI_FORMAT_R8_UINT` = `62`
- `DXGI_FORMAT_R8_SNORM` = `63`
- `DXGI_FORMAT_R8_SINT` = `64`
- `DXGI_FORMAT_A8_UNORM` = `65`
- `DXGI_FORMAT_R1_UNORM` = `66`
- `DXGI_FORMAT_R9G9B9E5_SHAREDEXP` = `67`
- `DXGI_FORMAT_R8G8_B8G8_UNORM` = `68`
- `DXGI_FORMAT_G8R8_G8B8_UNORM` = `69`
- `DXGI_FORMAT_BC1_TYPELESS` = `70`
- `DXGI_FORMAT_BC1_UNORM` = `71`
- `DXGI_FORMAT_BC1_UNORM_SRGB` = `72`
- `DXGI_FORMAT_BC2_TYPELESS` = `73`
- `DXGI_FORMAT_BC2_UNORM` = `74`
- `DXGI_FORMAT_BC2_UNORM_SRGB` = `75`
- `DXGI_FORMAT_BC3_TYPELESS` = `76`
- `DXGI_FORMAT_BC3_UNORM` = `77`
- `DXGI_FORMAT_BC3_UNORM_SRGB` = `78`
- `DXGI_FORMAT_BC4_TYPELESS` = `79`
- `DXGI_FORMAT_BC4_UNORM` = `80`
- `DXGI_FORMAT_BC4_SNORM` = `81`
- `DXGI_FORMAT_BC5_TYPELESS` = `82`
- `DXGI_FORMAT_BC5_UNORM` = `83`
- `DXGI_FORMAT_BC5_SNORM` = `84`
- `DXGI_FORMAT_B5G6R5_UNORM` = `85`
- `DXGI_FORMAT_B5G5R5A1_UNORM` = `86`
- `DXGI_FORMAT_B8G8R8A8_UNORM` = `87`
- `DXGI_FORMAT_B8G8R8X8_UNORM` = `88`
- `DXGI_FORMAT_R10G10B10_XR_BIAS_A2_UNORM` = `89`
- `DXGI_FORMAT_B8G8R8A8_TYPELESS` = `90`
- `DXGI_FORMAT_B8G8R8A8_UNORM_SRGB` = `91`
- `DXGI_FORMAT_B8G8R8X8_TYPELESS` = `92`
- `DXGI_FORMAT_B8G8R8X8_UNORM_SRGB` = `93`
- `DXGI_FORMAT_BC6H_TYPELESS` = `94`
- `DXGI_FORMAT_BC6H_UF16` = `95`
- `DXGI_FORMAT_BC6H_SF16` = `96`
- `DXGI_FORMAT_BC7_TYPELESS` = `97`
- `DXGI_FORMAT_BC7_UNORM` = `98`
- `DXGI_FORMAT_BC7_UNORM_SRGB` = `99`
- `DXGI_FORMAT_AYUV` = `100`
- `DXGI_FORMAT_Y410` = `101`
- `DXGI_FORMAT_Y416` = `102`
- `DXGI_FORMAT_NV12` = `103`
- `DXGI_FORMAT_P010` = `104`
- `DXGI_FORMAT_P016` = `105`
- `DXGI_FORMAT_420_OPAQUE` = `106`
- `DXGI_FORMAT_YUY2` = `107`
- `DXGI_FORMAT_Y210` = `108`
- `DXGI_FORMAT_Y216` = `109`
- `DXGI_FORMAT_NV11` = `110`
- `DXGI_FORMAT_AI44` = `111`
- `DXGI_FORMAT_IA44` = `112`
- `DXGI_FORMAT_P8` = `113`
- `DXGI_FORMAT_A8P8` = `114`
- `DXGI_FORMAT_B4G4R4A4_UNORM` = `115`
- `DXGI_FORMAT_P208` = `116`
- `DXGI_FORMAT_V208` = `117`
- `DXGI_FORMAT_V408` = `118`
- `DXGI_FORMAT_SAMPLER_FEEDBACK_MIN_MIP_OPAQUE` = `119`
- `DXGI_FORMAT_SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE` = `120`
- `DXGI_FORMAT_FORCE_UINT` = `121`

## `D3D10_RESOURCE_DIMENSION`

Possible values of the field DDS_DX10_FIELDS.RESOURCE_DIMENSION

- `DDS_DIMENSION_TEXTURE1D` = `2`
- `DDS_DIMENSION_TEXTURE2D` = `3`
- `DDS_DIMENSION_TEXTURE3D` = `6`

## app

### `ApplicationPlugin`

Interface for creating Application plugins. Any plugin that's usable for Application must implement these methods.

To create a plugin:

1. Create a class that implements this interface
2. Add the required static extension property
3. Register the plugin using extensions.add()

## assets

### `ProgressCallback`

Callback function for tracking asset loading progress. The function is called repeatedly
during the loading process with a progress value between 0.0 and 1.0.

```ts
(progress: number) => void
```

### `AssetsPreferences`

Extensible preferences that can be used, for instance, when configuring loaders.
**Properties:**

- `preferWorkers: boolean` — When set to `true`, loading and decoding images will happen with Worker thread,
  if available on the browser. This is much more performant as network requests
  and decoding can be expensive on the CPU. However, not all environments support
  Workers, in some cases it can be helpful to disable by setting to `false`.
- `preferCreateImageBitmap: boolean` — When set to `true`, loading and decoding images will happen with `createImageBitmap`,
  otherwise it will use `new Image()`.
- `crossOrigin: string` — The crossOrigin value to use for images when `preferCreateImageBitmap` is `false`.
- `parseAsGraphicsContext: boolean` — When set to `true`, loading and decoding images will happen with `new Image()`,

### `CacheParser`

For every asset that is cached, it will call the parsers test function
the flow is as follows:

1. `cacheParser.test()`: Test the asset.
2. `cacheParser.getCacheableAssets()`: If the test passes call the getCacheableAssets function with the asset

Useful if you want to add more than just a raw asset to the cache
(for example a spritesheet will want to make all its sub textures easily accessible in the cache)
**Properties:**

- `extension: ExtensionMetadata` (optional) — The extension type of this cache parser
- `config: Record<string, any>` (optional) — A config to adjust the parser
- `test: (asset: T) => boolean` — Gets called by the cache when a dev caches an asset
- `getCacheableAssets: (keys: string[], asset: T) => Record<string, any>` — If the test passes, this function is called to get the cacheable assets
  an example may be that a spritesheet object will return all the sub textures it has so they can
  be cached.

### `FormatDetectionParser`

Format detection is useful for detecting feature support on the current platform.
**Properties:**

- `extension: ExtensionMetadata` (optional) — Should be ExtensionType.DetectionParser
- `test: () => Promise<boolean>` — Browser/platform feature detection supported if return true
- `add: (formats: string[]) => Promise<string[]>` — Add formats (file extensions) to the existing list of formats.
  Return an new array with added formats, do not mutate the formats argument.
- `remove: (formats: string[]) => Promise<string[]>` — Remove formats (file extensions) from the list of supported formats.
  This is used when uninstalling this DetectionParser.
  Return an new array with filtered formats, do not mutate the formats argument.

### `LoaderParserAdvanced`

A more verbose version of the LoaderParser, allowing you to set the loaded, parsed, and unloaded asset separately
**Properties:**

- `extension: ExtensionMetadata` (optional) — Should be ExtensionType.LoaderParser
- `config: CONFIG` (optional) — A config to adjust the parser
- `name: string` (optional)
- `id: string` — The name of the parser (this can be used when specifying parser in a ResolvedAsset)
- `test: (url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => boolean` (optional) — Each URL to load will be tested here,
  if the test is passed the assets are loaded using the load function below.
  Good place to test for things like file extensions!
- `load: (url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<ASSET | T>` (optional) — This is the promise that loads the URL provided
  resolves with a loaded asset if returned by the parser.
- `testParse: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<boolean>` (optional) — This function is used to test if the parse function should be run on the asset
  If this returns true then parse is called with the asset
- `parse: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<PARSED_ASSET | T>` (optional) — Gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful
- `unload: (asset: UNLOAD_ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => void | Promise<void>` (optional) — If an asset is parsed using this parser, the unload function will be called when the user requests an asset
  to be unloaded. This is useful for things like sounds or textures that can be unloaded from memory

### `LoaderParser`

The interface to define a loader parser _(all functions are optional)_.

When you create a `parser` object, the flow for every asset loaded is:

1. `parser.test()` - Each URL to load will be tested here, if the test is passed the assets are
   loaded using the load function below. Good place to test for things like file extensions!
2. `parser.load()` - This is the promise that loads the URL provided resolves with a loaded asset
   if returned by the parser.
3. `parser.testParse()` - This function is used to test if the parse function should be run on the
   asset If this returns true then parse is called with the asset
4. `parse.parse()` - Gets called on the asset it testParse passes. Useful to convert a raw asset
   into something more useful

<br/>
Some loaders may only be used for parsing, some only for loading, and some for both!
**Properties:**
- `extension: ExtensionMetadata` (optional) — Should be ExtensionType.LoaderParser
- `config: CONFIG` (optional) — A config to adjust the parser
- `name: string` (optional)
- `id: string` — The name of the parser (this can be used when specifying parser in a ResolvedAsset)
- `test: (url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => boolean` (optional) — Each URL to load will be tested here,
if the test is passed the assets are loaded using the load function below.
Good place to test for things like file extensions!
- `load: (url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<ASSET | T>` (optional) — This is the promise that loads the URL provided
resolves with a loaded asset if returned by the parser.
- `testParse: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<boolean>` (optional) — This function is used to test if the parse function should be run on the asset
If this returns true then parse is called with the asset
- `parse: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<ASSET | T>` (optional) — Gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful
- `unload: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => void | Promise<void>` (optional) — If an asset is parsed using this parser, the unload function will be called when the user requests an asset
to be unloaded. This is useful for things like sounds or textures that can be unloaded from memory

### `LoadFontData`

Data for loading a font

### `LoadSVGConfig`

<!-- truncated -->
