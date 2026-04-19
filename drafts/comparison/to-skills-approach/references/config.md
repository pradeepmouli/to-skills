# Configuration

## AccessibilitySystemOptions

Initialisation options for the accessibility system when used with an Application.

### Properties

#### accessibilityOptions

Options for the accessibility system

**Type:** `AccessibilityOptions`

## AccessibilityOptions

The options for the accessibility system.

### Properties

#### enabledByDefault

Whether to enable accessibility features on initialization instead of waiting for tab key

**Type:** `boolean`

#### debug

Whether to visually show the accessibility divs for debugging

**Type:** `boolean`

#### activateOnTab

Whether to allow tab key press to activate accessibility features

**Type:** `boolean`

#### deactivateOnMouseMove

Whether to deactivate accessibility when mouse moves

**Type:** `boolean`

## AccessibleOptions

When `accessible` is enabled on any display object, these properties will affect its accessibility.

### Properties

#### accessible

Flag for if the object is accessible. If true AccessibilityManager will overlay a
shadow div with attributes set

**Type:** `boolean`

**Required:** yes

#### accessibleTitle

Sets the title attribute of the shadow div
If accessibleTitle AND accessibleHint has not been this will default to 'container [tabIndex]'

**Type:** `string`

**Required:** yes

#### accessibleHint

Sets the aria-label attribute of the shadow div

**Type:** `string`

**Required:** yes

#### tabIndex

Sets the tabIndex of the shadow div. You can use this to set the order of the
elements when using the tab key to navigate.

**Type:** `number`

**Required:** yes

#### accessibleType

Specify the type of div the accessible layer is. Screen readers treat the element differently
depending on this type. Defaults to button.

**Type:** `keyof HTMLElementTagNameMap`

**Required:** yes

#### accessiblePointerEvents

Specify the pointer-events the accessible div will use
Defaults to auto.

**Type:** `PointerEvents`

**Required:** yes

#### accessibleText

Sets the text content of the shadow

**Type:** `string`

**Required:** yes

#### accessibleChildren

Setting to false will prevent any children inside this container to
be accessible. Defaults to true.

**Type:** `boolean`

**Required:** yes

## ApplicationOptions

Application options supplied to the Application#init method.
These options configure how your PixiJS application behaves.

### Properties

#### preference

The preferred renderer type(s).

- When a **string** is provided (e.g. `'webgpu'`), that renderer is tried first and
  the remaining renderers are used as fallbacks in the default priority order.
- When an **array** is provided (e.g. `['webgpu', 'webgl']`), only the listed
  renderers are tried, in the given order. Any renderer type **not** in the array
  is excluded entirely — this can be used as a blocklist.

**Type:** `RendererPreference | RendererPreference[]`

#### webgpu

Optional WebGPUOptions to pass only to WebGPU renderer.

**Type:** `Partial<WebGPUOptions>`

#### webgl

Optional WebGLOptions to pass only to the WebGL renderer

**Type:** `Partial<WebGLOptions>`

#### canvasOptions

Optional CanvasOptions to pass only to the Canvas renderer

**Type:** `Partial<CanvasOptions>`

#### skipExtensionImports

Whether to stop PixiJS from dynamically importing default extensions for the renderer.
It is false by default, and means PixiJS will load all the default extensions, based
on the environment e.g browser/webworker.
If you set this to true, then you will need to manually import the systems and extensions you need.

e.g.

```js
import 'accessibility';
import 'app';
import 'events';
import 'spritesheet';
import 'graphics';
import 'mesh';
import 'text';
import 'text-bitmap';
import 'text-html';
import { autoDetectRenderer } from 'pixi.js';

const renderer = await autoDetectRenderer({
  width: 800,
  height: 600,
  skipExtensionImports: true
});
```

**Type:** `boolean`

#### manageImports

**Type:** `boolean`

#### renderableGCActive

If set to true, this will enable the garbage collector on the GPU.

**Type:** `boolean`

**Required:** yes

#### renderableGCMaxUnusedTime

The maximum idle frames before a texture is destroyed by garbage collection.

**Type:** `number`

**Required:** yes

#### renderableGCFrequency

Frames between two garbage collections.

**Type:** `number`

**Required:** yes

#### textureGCActive

If set to true, this will enable the garbage collector on the GPU.

**Type:** `boolean`

**Required:** yes

#### textureGCAMaxIdle

**Type:** `number`

**Required:** yes

#### textureGCMaxIdle

The maximum idle frames before a texture is destroyed by garbage collection.

**Type:** `number`

**Required:** yes

#### textureGCCheckCountMax

Frames between two garbage collections.

**Type:** `number`

**Required:** yes

#### gcActive

If set to true, this will enable the garbage collector.

**Type:** `boolean`

**Required:** yes

#### gcMaxUnusedTime

The maximum time in milliseconds a resource can be unused before being garbage collected.

**Type:** `number`

**Required:** yes

#### gcFrequency

How frequently to run garbage collection in milliseconds.

**Type:** `number`

**Required:** yes

#### width

The width of the screen.

**Type:** `number`

#### height

The height of the screen.

**Type:** `number`

#### canvas

The canvas to use as a view, optional.

**Type:** `ICanvas`

#### view

Alias for `canvas`.

**Type:** `ICanvas`

#### autoDensity

Resizes renderer view in CSS pixels to allow for resolutions other than 1.

This is only supported for HTMLCanvasElement
and will be ignored if the canvas is an OffscreenCanvas.

**Type:** `boolean`

#### resolution

The resolution / device pixel ratio of the renderer.

**Type:** `number`

#### antialias

Whether to enable anti-aliasing. This may affect performance.

**Type:** `boolean`

#### depth

Whether to ensure the main view has can make use of the depth buffer. Always true for WebGL renderer.

**Type:** `boolean`

#### hello

Whether to log the version and type information of renderer to console.

**Type:** `boolean`

**Required:** yes

#### backgroundColor

The background color used to clear the canvas. See ColorSource for accepted color values.

**Type:** `ColorSource`

**Required:** yes

#### background

Alias for `backgroundColor`

**Type:** `ColorSource`

#### backgroundAlpha

Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
This value determines whether the canvas is initialized with alpha transparency support.
Note: This cannot be changed after initialization. If set to `1`, the canvas will remain opaque,
even if a transparent background color is set later.

**Type:** `number`

#### clearBeforeRender

Whether to clear the canvas before new render passes.

**Type:** `boolean`

#### eventMode

The type of interaction behavior for a Container. This is set via the Container#eventMode property.

**Type:** `EventMode`

#### eventFeatures

Configuration for enabling/disabling specific event features.
Use this to optimize performance by turning off unused functionality.

**Type:** `Partial<EventSystemFeatures>`

#### failIfMajorPerformanceCaveat

**Type:** `boolean`

#### roundPixels

**Type:** `boolean`

#### bezierSmoothness

A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother)

**Type:** `number`

**Required:** yes

#### context

User-provided WebGL rendering context object.

**Type:** `WebGL2RenderingContext`

**Required:** yes

#### powerPreference

An optional hint indicating what configuration of GPU is suitable for the WebGL context,
can be `'high-performance'` or `'low-power'`.
Setting to `'high-performance'` will prioritize rendering performance over power consumption,
while setting to `'low-power'` will prioritize power saving over rendering performance.

**Type:** `GpuPowerPreference`

#### premultipliedAlpha

Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha.

**Type:** `boolean`

**Required:** yes

#### preserveDrawingBuffer

Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.

**Type:** `boolean`

**Required:** yes

#### preferWebGLVersion

The preferred WebGL version to use.

**Type:** `1 | 2`

#### multiView

Whether to enable multi-view rendering. Set to true when rendering to multiple
canvases on the dom.

**Type:** `boolean`

**Required:** yes

#### useBackBuffer

if true will use the back buffer where required

**Type:** `boolean`

#### forceFallbackAdapter

Force the use of the fallback adapter

**Type:** `boolean`

**Required:** yes

#### gpu

Using shared device and adaptor from other engine

**Type:** `GPU`

#### resizeTo

Element to automatically resize the renderer to.

**Type:** `HTMLElement | Window`

#### autoStart

Controls whether the animation loop starts automatically after initialization.

> [!IMPORTANT]
> Setting this to `false` does NOT stop the shared ticker even if `sharedTicker` is `true`.
> You must stop the shared ticker manually if needed.

**Type:** `boolean`

#### sharedTicker

Controls whether to use the shared global ticker or create a new instance.

The shared ticker is useful when you have multiple instances that should sync their updates.
However, it has some limitations regarding update order control.

Update Order:

1. System ticker (always runs first)
2. Shared ticker (if enabled)
3. App ticker (if using own ticker)

**Type:** `boolean`

#### culler

Options for the culler behavior.

**Type:** `{ updateTransform?: boolean }`

## ResizePluginOptions

Application options for the ResizePlugin.
These options control how your application handles window and element resizing.

### Properties

#### resizeTo

Element to automatically resize the renderer to.

**Type:** `HTMLElement | Window`

## TickerPluginOptions

Application options for the TickerPlugin.
These options control the animation loop and update cycle of your PixiJS application.

The ticker is the heart of your application's animation system. It:

- Manages the render loop
- Provides accurate timing information
- Handles frame-based updates
- Supports priority-based execution order

### Properties

#### autoStart

Controls whether the animation loop starts automatically after initialization.

> [!IMPORTANT]
> Setting this to `false` does NOT stop the shared ticker even if `sharedTicker` is `true`.
> You must stop the shared ticker manually if needed.

**Type:** `boolean`

#### sharedTicker

Controls whether to use the shared global ticker or create a new instance.

The shared ticker is useful when you have multiple instances that should sync their updates.
However, it has some limitations regarding update order control.

Update Order:

1. System ticker (always runs first)
2. Shared ticker (if enabled)
3. App ticker (if using own ticker)

**Type:** `boolean`

## AssetInitOptions

Options for initializing the Assets class. These options configure how assets are loaded,
resolved, and managed in your PixiJS application.

### Properties

#### basePath

Base path prepended to all asset URLs. Useful for CDN hosting.

**Type:** `string`

#### defaultSearchParams

URL parameters to append to all asset URLs.
Useful for cache-busting or version control.

**Type:** `string | Record<string, any>`

#### manifest

A manifest defining all your application's assets.
Can be a URL to a JSON file or a manifest object.

**Type:** `string | AssetsManifest`

#### texturePreference

Configure texture loading preferences.
Useful for optimizing asset delivery based on device capabilities.

**Type:** `{ resolution?: number | number[]; format?: ArrayOr<string> }`

#### skipDetections

Skip browser format detection for faster initialization.
Only use if you know exactly what formats your target browsers support.

**Type:** `boolean`

#### bundleIdentifier

Override how bundle IDs are generated and resolved.

This allows you to customize how assets are grouped and accessed via bundles and allow for
multiple bundles to share the same asset keys.

**Type:** `BundleIdentifierOptions`

#### preferences

Optional preferences for asset loading behavior.

**Type:** `Partial<AssetsPreferences>`

#### loadOptions

Options for defining the loading behavior of assets.

**Type:** `Partial<LoadOptions>`

- `onProgress` callback receives values from 0.0 to 1.0
- `onError` callback is invoked for individual asset load failures
- `strategy` can be 'throw' (default), 'retry', or 'skip'
- `retryCount` sets how many times to retry failed assets (default 3)
- `retryDelay` sets the delay between retries in milliseconds (default 250ms)

## LoadOptions

Options for loading assets with the Loader

### Properties

#### onProgress

Callback for progress updates during loading

**Type:** `(progress: number) => void`

#### onError

Callback for handling errors during loading

**Type:** `(error: Error, url: string | ResolvedAsset<any>) => void`

#### strategy

Strategy to handle load failures

- 'throw': Immediately throw an error and stop loading (default)
- 'skip': Skip the failed asset and continue loading others
- 'retry': Retry loading the asset a specified number of times

**Type:** `"skip" | "throw" | "retry"`

#### retryCount

Number of retry attempts if strategy is 'retry'

**Type:** `number`

#### retryDelay

Delay in milliseconds between retry attempts

**Type:** `number`

## LoadTextureConfig

Configuration for the [loadTextures]loadTextures plugin.

### Properties

#### preferWorkers

When set to `true`, loading and decoding images will happen with Worker thread,
if available on the browser. This is much more performant as network requests
and decoding can be expensive on the CPU. However, not all environments support
Workers, in some cases it can be helpful to disable by setting to `false`.

**Type:** `boolean`

**Required:** yes

#### preferCreateImageBitmap

When set to `true`, loading and decoding images will happen with `createImageBitmap`,
otherwise it will use `new Image()`.

**Type:** `boolean`

**Required:** yes

#### crossOrigin

The crossOrigin value to use for images when `preferCreateImageBitmap` is `false`.

**Type:** `string`

**Required:** yes

## BundleIdentifierOptions

Options for how the resolver deals with generating bundle ids

### Properties

#### connector

The character that is used to connect the bundleId and the assetId when generating a bundle asset id key

**Type:** `string`

#### createBundleAssetId

A function that generates a bundle asset id key from a bundleId and an assetId

**Type:** `(bundleId: string, assetId: string) => string`

#### extractAssetIdFromBundle

A function that generates an assetId from a bundle asset id key. This is the reverse of generateBundleAssetId

**Type:** `(bundleId: string, assetBundleId: string) => string`

## CullerPluginOptions

Application options for the CullerPlugin.
These options control how your application handles culling of display objects.

### Properties

#### culler

Options for the culler behavior.

**Type:** `{ updateTransform?: boolean }`

## DOMContainerOptions

Options for configuring a DOMContainer.
Controls how DOM elements are integrated into the PixiJS scene graph.

### Properties

#### element

The DOM element to use for the container.
Can be any HTML element like div, input, textarea, etc.

If not provided, creates a new div element.

**Type:** `HTMLElement`

#### anchor

The anchor point of the container.

- Can be a single number to set both x and y
- Can be a point-like object with x,y coordinates
- (0,0) is top-left
- (1,1) is bottom-right
- (0.5,0.5) is center

**Type:** `number | PointData`

## ContextSettings

The context settings for creating a rendering context.

## EventSystemOptions

Options for configuring the PixiJS event system. These options control how the event system
handles different types of interactions and event propagation.

### Properties

<!-- truncated -->
