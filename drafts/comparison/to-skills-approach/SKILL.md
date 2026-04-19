---
name: pixi-js
description: "PixiJS — fast, lightweight 2D rendering library for the web.
Supports WebGL and WebGPU renderers with an intuitive scene graph API.
Use this package to build interactive graphics, games, and data visualizations
that run in any modern browser without plugins."
license: MIT
---

# pixi.js

PixiJS — fast, lightweight 2D rendering library for the web.
Supports WebGL and WebGPU renderers with an intuitive scene graph API.
Use this package to build interactive graphics, games, and data visualizations
that run in any modern browser without plugins.

## When to Use

- You need a quick, batteries-included entry point for a PixiJS scene — creates and wires up
- the renderer, stage, and ticker in one `await app.init()` call.
- You need to represent an image or image region that will be used to render Sprite
- or other display objects — Texture is the core GPU image handle in PixiJS.
- Grouping and transforming multiple display objects together — Container is the
- fundamental building block for scene hierarchies in PixiJS.
- Drawing dynamic, code-generated shapes, hit areas, or masks — Graphics provides a
- retained-mode vector drawing API that integrates with the PixiJS scene graph.
- Displaying a single texture or image in the scene graph — Sprite is the most
- GPU-efficient way to render a pre-loaded texture.
- You need a frame-rate-aware animation loop — Ticker handles `requestAnimationFrame`,
- capping, and scaling so your update callbacks receive a reliable `deltaTime` scalar.

**Avoid when:**

- You need multiple independent renderers or are embedding PixiJS into a framework that
- manages its own render loop — construct the Renderer and Ticker directly instead.
- You only need a raw image element; use the browser's `HTMLImageElement` directly and
- pass it to your own canvas 2D context without involving PixiJS rendering.
- You only need to position a single renderable object; using bare Containers solely
- as wrappers for one child adds scene-graph overhead without benefit.
- Rendering raster images; use Sprite instead for bitmap textures.
- Rendering hundreds of identical sprites; use ParticleContainer instead for
- large batches, or a SpritesheetData atlas to reduce draw calls.
- Running headless server-side logic that does not need rendering; `Ticker` depends on
- `requestAnimationFrame` and has no meaningful effect in non-browser environments.
- API surface: 48 functions, 222 classes, 235 types, 12 enums, 53 constants

## Pitfalls

- After calling `app.destroy()`, the `stage` and `renderer` are set to `null`; cache the
- canvas reference before destroying if you need to remove it from the DOM afterward.
- Destroying a texture while it is still referenced by a Sprite causes that Sprite to
- render a white/pink rectangle. Call `sprite.texture = Texture.EMPTY` before destroying the texture.
- `width` and `height` setters on Container rescale via `scale.x/y`, computed from the
- local bounding box. If the bounds are 0 (empty container), setting width/height has no effect.
- Modifying a shared GraphicsContext invalidates all Graphics that reference it,
- triggering a full re-upload. Clone the context with `context.clone()` before mutating if isolation
- is needed.
- Setting `anchor` does not move the sprite visually unless you account for it in position.
- `anchor: 0.5` centers the origin, so `x/y` now refer to the center of the sprite.
- Listeners added with `ticker.add()` are called every frame indefinitely. Always remove
- them with `ticker.remove()` or use `ticker.addOnce()` for one-shot updates to avoid memory leaks
- when destroying scenes.

## Configuration

119 configuration interfaces — see references/config.md for details.

- **AccessibilitySystemOptions** — Initialisation options for the accessibility system when used with an Application.
- **AccessibilityOptions** — The options for the accessibility system.
- **AccessibleOptions** — When `accessible` is enabled on any display object, these properties will affect its accessibility.
- **ApplicationOptions** — Application options supplied to the Application#init method.
  These options configure how your PixiJS application behaves.
- **ResizePluginOptions** — Application options for the ResizePlugin.
  These options control how your application handles window and element resizing.
- **TickerPluginOptions** — Application options for the TickerPlugin.
  These options control the animation loop and update cycle of your PixiJS application.
- **AssetInitOptions** — Options for initializing the Assets class. These options configure how assets are loaded,
  resolved, and managed in your PixiJS application.
- **LoadOptions** — Options for loading assets with the Loader
- **LoadTextureConfig** — Configuration for the [loadTextures]loadTextures plugin.
- **BundleIdentifierOptions** — Options for how the resolver deals with generating bundle ids
- **CullerPluginOptions** — Application options for the CullerPlugin.
  These options control how your application handles culling of display objects.
- **DOMContainerOptions** — Options for configuring a DOMContainer.
  Controls how DOM elements are integrated into the PixiJS scene graph.
- **ContextSettings** — The context settings for creating a rendering context.
- **EventSystemOptions** — Options for configuring the PixiJS event system. These options control how the event system
  handles different types of interactions and event propagation.
- **FederatedOptions** — The properties available for any interactive object. This interface defines the core interaction
  properties and event handlers that can be set on any Container in PixiJS.
- **AddListenerOptions** — The options for the `addEventListener` method.
- **RemoveListenerOptions** — The options for the `removeEventListener` method.
- **AlphaFilterOptions** — Options for AlphaFilter
- **BlurFilterOptions** — Configuration options for the BlurFilter.
  Controls how the Gaussian blur effect is applied.
- **DisplacementFilterOptions** — Configuration options for the DisplacementFilter.

A displacement filter uses a sprite's texture as a displacement map,
moving pixels of the target based on the color values of corresponding
pixels in the displacement sprite.

- **NoiseFilterOptions** — Configuration options for the NoiseFilter.

The NoiseFilter adds random noise to the rendered content. The noise effect can be
controlled through the noise intensity and an optional seed value for reproducible results.

- **FilterOptions** — The options to use when creating a new filter.
- **BatcherOptions** — The options for the batcher.
- **AutoDetectOptions** — Options for autoDetectRenderer.
- **CanvasOptions** — Options for CanvasRenderer.
- **ContextSystemOptions** — Options for the context system.
- **GlBackBufferOptions** — The options for the back buffer system.
- **GlProgramOptions** — The options for the gl program
- **GpuContextOptions** — Options for the WebGPU context.
- **GpuProgramOptions** — The options for the gpu program
- **BackgroundSystemOptions** — Options for the background system.
- **BufferOptions** — Options for creating a buffer

This interface defines the options that can be passed to the Buffer constructor.
It includes the data to initialize the buffer with, the size of the buffer,
the usage of the buffer, a label for debugging, and whether the buffer should shrink to fit
when the data becomes smaller.

- **ImageOptions** — Options for creating an image from a renderer.
  Controls the output format and quality of extracted images.
- **BaseExtractOptions** — Options for extracting content from a renderer.
  These options control how content is extracted and processed from the renderer.
- **ExtractImageOptions** — Options for extracting an HTMLImage from the renderer.
  Combines base extraction options with image-specific settings.
- **ExtractDownloadOptions** — Options for extracting and downloading content from a renderer.
  Combines base extraction options with download-specific settings.
- **ExtractOptions** — Options for extracting content from a renderer. Represents a union of all possible extraction option types.
  Used by various extraction methods to support different output formats and configurations.
- **GenerateTextureSourceOptions** — Options for generating a texture source.
- **GenerateTextureOptions** — Options for generating a texture from a container.
  Used to create reusable textures from display objects, which can improve performance
  when the same content needs to be rendered multiple times.
- **GCSystemOptions** — Options for the GCSystem.
- **AttributeOptions** — The attribute options used by the constructor for adding geometries attributes
  extends Attribute but allows for the buffer to be a typed or number array
- **GlobalUniformOptions** — Options for the global uniforms system.
  This includes size, projection matrix, world transform matrix, world color, and offset.
- **RenderTargetOptions** — Options for creating a render target.
- **UniformGroupOptions** — Uniform group options
- **HelloSystemOptions** — Options for the startup system.
- **RendererConfig** — The configuration for the renderer.
  This is used to define the systems and render pipes that will be used by the renderer.
- **RenderOptions** — The options for rendering a view.
- **ClearOptions** — The options for clearing the render target.
- **RendererDestroyOptions** — Options for destroying the renderer.
  This can be a boolean or an object.
- **SharedRendererOptions** — Options for the shared systems of a renderer.
- **CubeTextureOptions** — The options that can be passed to a new CubeTexture.
- **RenderableGCSystemOptions** — Options for the RenderableGCSystem.
- **RenderTextureOptions** — The options that can be passed to a new RenderTexture
- **BufferSourceOptions** — Options for creating a BufferImageSource.
- **CanvasSourceOptions** — Options for creating a CanvasSource.
- **CubeTextureSourceOptions** — Options for creating a CubeTextureSource.
- **ExternalSourceOptions** — Options for creating an ExternalSource.
- **TextureSourceOptions** — options for creating a new TextureSource
- **VideoSourceOptions** — Options for video sources.
- **TextureOptions** — The options that can be passed to a new Texture
- **TextureGCSystemOptions** — Options for the TextureGCSystem.
- **TextureStyleOptions** — The options for the texture style.
- **TextureResourceOrOptions** — The type of resource or options that can be used to create a texture source.
  This includes ImageResource, TextureSourceOptions, BufferSourceOptions, and CanvasSourceOptions.
- **ViewSystemOptions** — Options passed to the ViewSystem
- **ViewSystemDestroyOptions** — Options for destroying the ViewSystem.
- **RendererOptions** — Options for the renderer.
- **MaskOptions** — Options for configuring mask behavior on a display object.
- **UpdateTransformOptions** — Options for updating the transform of a container.
- **ContainerOptions** — Constructor options used for `Container` instances.

```js
const container = new Container({
  position: new Point(100, 200),
  scale: new Point(2, 2),
  rotation: Math.PI / 2
});
```

- **BaseDestroyOptions** — Base options for destroying display objects.
  Controls how deep the destruction process should go through the display tree.
- **TextureDestroyOptions** — Options when destroying textures through `.destroy()` calls.
  Controls how thoroughly textures and their sources are cleaned up.
- **ContextDestroyOptions** — Options when destroying a graphics context.
  Controls the cleanup of graphics-specific resources.
- **TextDestroyOptions** — Options when destroying a text object. Controls whether associated text styles
  should be cleaned up along with the text object itself.

```ts
// Basic text cleanup
text.destroy({ style: false }); // Keep style for reuse
text.destroy({ style: true }); // Destroy style as well
```

- **DestroyOptions** — Options for destroying a container and its resources.
  Combines all destroy options into a single configuration object.
- **RenderContainerOptions** — Options for the RenderContainer constructor.
- **CacheAsTextureOptions** — Options for caching a container as a texture.
- **BaseGradientOptions** — Represents the style options for a linear gradient fill.
- **LinearGradientOptions** — Options specific to linear gradients.
  A linear gradient creates a smooth transition between colors along a straight line defined by start and end points.
- **RadialGradientOptions** — Options specific to radial gradients.
  A radial gradient creates a smooth transition between colors that radiates outward in a circular pattern.
  The gradient is defined by inner and outer circles, each with their own radius.
- **GradientOptions** — Options for creating a gradient fill.
- **GraphicsOptions** — Constructor options used for Graphics instances.
  Configures the initial state and behavior of a Graphics object.
- **GraphicsContextSystemOptions** — Options for the GraphicsContextSystem.
- **GeometryPathOptions** — Options for building geometry from a graphics path.
  Provides a possibility to specify a transformation Matrix for the texture's UVs and output mesh geometry.
- **RenderLayerOptions** — Options for configuring a RenderLayer. A RenderLayer allows control over rendering order
  independent of the scene graph hierarchy.
- **PerspectivePlaneOptions** — Constructor options used for `PerspectiveMesh` instances. Defines the geometry and appearance
  of a 2D mesh with perspective projection.
- **PerspectivePlaneGeometryOptions** — Constructor options used for `PerspectivePlaneGeometry` instances.
- **MeshPlaneOptions** — Constructor options used for `MeshPlane` instances. Defines how a texture is mapped
  onto a plane with configurable vertex density.
- **PlaneGeometryOptions** — Constructor options used for `PlaneGeometry` instances.

```js
const planeGeometry = new PlaneGeometry({
  width: 100,
  height: 100,
  verticesX: 10,
  verticesY: 10
});
```

- **MeshRopeOptions** — Constructor options used for `MeshRope` instances. Allows configuration of a rope-like mesh
  that follows a series of points with a texture applied.
- **SimpleMeshOptions** — Options for creating a SimpleMesh instance. Defines the texture, geometry data, and rendering topology
  for a basic mesh with direct vertex manipulation capabilities.
- **RopeGeometryOptions** — Constructor options used for `RopeGeometry` instances.

```js
const ropeGeometry = new RopeGeometry({
  points: [new Point(0, 0), new Point(100, 0)],
  width: 10,
  textureScale: 0
});
```

- **MeshOptions** — Options for creating a Mesh instance.
- **MeshGeometryOptions** — Options for the mesh geometry.
- **ParticleOptions** — Configuration options for creating a new particle. All properties except texture are optional
  and will use default values if not specified.
- **ParticleContainerOptions** — Options for configuring a ParticleContainer. Controls how particles are rendered, updated, and managed.
- **AnimatedSpriteOptions** — Constructor options used for `AnimatedSprite` instances. Allows configuration of animation
  playback, speed, and texture frames.
- **NineSliceGeometryOptions** — Options for the NineSliceGeometry.
- **NineSliceSpriteOptions** — Constructor options used for `NineSliceSprite` instances.
Defines how the sprite's texture is divided and scaled in nine sections.
<pre>
     A                          B
   +---+----------------------+---+
 C | 1 |          2           | 3 |
   +---+----------------------+---+
   |   |                      |   |
   | 4 |          5           | 6 |
   |   |                      |   |
   +---+----------------------+---+
 D | 7 |          8           | 9 |
   +---+----------------------+---+
 When changing this objects width and/or height:
    areas 1 3 7 and 9 will remain unscaled.
    areas 2 and 8 will be stretched horizontally
    areas 4 and 6 will be stretched vertically
    area 5 will be stretched both horizontally and vertically
</pre>
- **TilingSpriteOptions** — Constructor options used for creating a TilingSprite instance.
  Defines the texture, tiling behavior, and rendering properties of the sprite.
- **SpriteOptions** — Options for configuring a Sprite instance. Defines the texture, anchor point, and rendering behavior.
- **BitmapFontOptions** — Options for creating a BitmapFont. Used when loading or creating bitmap fonts from existing textures and data.
- **BitmapFontInstallOptions** — The options for installing a new BitmapFont. Once installed, the font will be available
  for use in BitmapText objects through the fontFamily property of TextStyle.
- **HTMLTextOptions** — Constructor options used for `HTMLText` instances. Extends the base text options
  with HTML-specific features and texture styling capabilities.
- **HTMLTextStyleOptions** — Options for HTML text style, extends standard text styling with HTML-specific capabilities.
  Omits certain base text properties that don't apply to HTML rendering.
- **AbstractSplitOptions** — Configuration options for text splitting.
- **AbstractSplitTextOptions** — Configuration options for SplitText, combining container properties with text splitting settings.
- **SplitBitmapOptions** — Configuration options for BitmapText splitting.
- **SplitBitmapTextOptions** — Configuration options for SplitBitmapText, combining container properties with text splitting settings.
- **SplitOptions** — Configuration options for Text splitting.
- **SplitTextOptions** — Configuration options for SplitText, combining container properties with text splitting settings.
- **AnyTextStyleOptions** — A union of all text style options, including HTML, Bitmap and Canvas text style options.
  This is used to allow for any text style options to be passed to a text object.
- **TextOptions** — Options for creating text objects in PixiJS. This interface defines the common properties
  used across different text rendering implementations (Canvas, HTML, and Bitmap).
- **CanvasTextOptions** — Constructor options used for `Text` instances. These options extend TextOptions with
  canvas-specific features like texture styling.
- **TextStyleOptions** — Constructor options used for `TextStyle` instances. Defines the visual appearance and layout of text.
- **ViewContainerOptions** — Options for the construction of a ViewContainer.
- **SpritesheetOptions** — Options for loading a spritesheet from an atlas.
- **TransformOptions** — Options for the Transform constructor.
- **GifBufferOptions** — Options when constructing from buffer
- **GifSpriteOptions** — Configuration options for creating a GifSprite instance.

These options control both the visual appearance and playback behavior
of animated GIFs.

## Quick Reference

`loadImageBitmap`, `createTexture`, `getMaxTexturesPerBatch`, `compileShader`, `defaultValue`, `extractAttributesFromGlProgram`, `generateProgram`, `getTestContext`, `getUboData`, `getUniformData`, `logProgramError`, `mapSize`, `ensurePrecision`, `mapFormatToGlFormat`, `mapFormatToGlInternalFormat`, `mapFormatToGlType`, `getDefaultUniformValue`, `roundedShapeArc`, `roundedShapeQuadraticCurve`, `toFillStyle`, `toStrokeStyle`, `compute2DProjection`, `resolveCharacters`, `unsafeEvalSupported`, `logDebugTexture`, `IGLUniformData`, `GlProgramData`, `BatchableGraphics`, `BatchableMesh`, `TickerListener`, `AccessibleTarget`, `EmitterListeners`, `CacheAsTextureMixinConstructor`, `EffectsMixinConstructor`, `FindMixinConstructor`, `MeasureMixinConstructor`, `SortMixinConstructor`, `BitmapFontRawData`, `DXGI_FORMAT`, `D3D10_RESOURCE_DIMENSION`, `FOURCC_TO_TEXTURE_FORMAT`, `DXGI_TO_TEXTURE_FORMAT`, `buildPolygon`, `buildRectangle`, `buildTriangle`, `blendTemplateFrag`, `blendTemplateVert`, `blendTemplateWgsl`, `fragmentGlTemplate`, `fragmentGPUTemplate`, `vertexGlTemplate`, `vertexGPUTemplate`
**assets:** `crossOrigin`, `determineCrossOrigin`, `setBasisTranscoderPath`, `setKTXTranscoderPath`, `BackgroundLoader`, `Loader`, `Resolver`, `Spritesheet`, `ProgressCallback`, `AssetsPreferences`, `CacheParser`, `FormatDetectionParser`, `LoaderParserAdvanced`, `LoaderParser`, `LoadFontData`, `LoadSVGConfig`, `PromiseAndParser`, `PreferOrder`, `ResolveURLParser`, `LoadParserName`, `AssetParser`, `ResolvedAsset`, `ResolvedSrc`, `AssetSrc`, `UnresolvedAsset`, `AssetsBundle`, `AssetsManifest`, `SpritesheetFrameData`, `SpritesheetData`, `SpriteSheetJson`, `AssetExtension`, `AssetExtensionAdvanced`, `LoaderParserPriority`, `Assets`, `Cache`, `loadJson`, `loadTxt`, `loadWebFont`, `loadSvg`, `loadTextures`, `loadVideoTextures`, `loadBasis`, `basisTranscoderUrls`, `loadDDS`, `loadKTX`, `loadKTX2`, `ktxTranscoderUrls`, `loadBitmapFont`, `spritesheetAsset`, `WorkerManager`
**environment:** `loadEnvironmentExtensions`, `autoDetectEnvironment`, `Adapter`, `ContextIds`, `PredefinedColorSpace`, `RenderingContext`, `ICanvasRenderingContext2DSettings`, `ICanvasParentNode`, `ICanvasStyle`, `ICanvasRect`, `WebGLContextEventMap`, `ICanvas`, `ICanvasRenderingContext2D`, `ImageLike`, `DOMAdapter`, `BrowserAdapter`, `WebWorkerAdapter`
**extensions:** `normalizeExtensionPriority`, `ExtensionFormat`, `ExtensionFormatLoose`, `ExtensionHandler`, `ExtensionMetadata`, `ExtensionMetadataDetails`, `ExtensionType`, `extensions`
**maths:** `floatEqual`, `lineIntersection`, `segmentIntersection`, `nextPow2`, `isPow2`, `log2`, `Matrix`, `ObservablePoint`, `Point`, `Circle`, `Ellipse`, `Polygon`, `Rectangle`, `RoundedRectangle`, `Triangle`, `TransformableObject`, `SHAPE_PRIMITIVE`, `Size`, `Observer`, `PointData`, `PointLike`, `ShapePrimitive`, `groupD8`, `PI_2`, `RAD_TO_DEG`, `DEG_TO_RAD`
**utils:** `formatShader`, `definedProps`, `isWebGLSupported`, `isWebGPUSupported`, `warn`, `sayHello`, `ViewableBuffer`, `Transform`, `Pool`, `PoolGroupClass`, `ArrayOr`, `RectangleLike`, `TypeOrBool`, `isMobileResult`, `Path`, `PoolItem`, `PoolItemConstructor`, `PoolConstructor`, `ArrayFixed`, `Dict`, `isMobile`, `DATA_URI`, `deprecation`, `path`, `earcut`
**rendering:** `autoDetectRenderer`, `fastCopy`, `CanvasFilterSystem`, `FilterSystem`, `PrepareBase`, `PrepareQueue`, `PrepareSystem`, `PrepareUpload`, `CanvasBatchAdaptor`, `GlBatchAdaptor`, `GpuBatchAdaptor`, `Batch`, `Batcher`, `BatcherPipe`, `BatchGeometry`, `BatchTextureArray`, `DefaultBatcher`, `DefaultShader`, `AlphaMask`, `ColorMask`, `MaskEffectManagerClass`, `ScissorMask`, `StencilMask`, `CanvasContextSystem`, `CanvasLimitsSystem`, `CanvasRenderer`, `CanvasRenderTargetAdaptor`, `CanvasRenderTargetSystem`, `CanvasTextureSystem`, `GlBufferSystem`, `GlContextSystem`, `GlGeometrySystem`, `GlBackBufferSystem`, `GlColorMaskSystem`, `GlEncoderSystem`, `GlLimitsSystem`, `GlRenderTarget`, `GlStencilSystem`, `GlUboSystem`, `GlRenderTargetAdaptor`, `GlRenderTargetSystem`, `GlProgram`, `GlShaderSystem`, `GlUniformGroupSystem`, `GlStateSystem`, `GlTexture`, `GlTextureSystem`, `WebGLRenderer`, `BindGroupSystem`, `GpuBufferSystem`, `GpuColorMaskSystem`, `GpuDeviceSystem`, `GpuEncoderSystem`, `GpuLimitsSystem`, `GpuStencilSystem`, `GpuUboSystem`, `PipelineSystem`, `GpuRenderTarget`, `GpuRenderTargetAdaptor`, `GpuRenderTargetSystem`, `BindGroup`, `GpuProgram`, `GpuShaderSystem`, `GpuStateSystem`, `GpuTextureSystem`, `GpuMipmapGenerator`, `WebGPURenderer`, `BackgroundSystem`, `Buffer`, `BufferResource`, `ExtractSystem`, `GenerateTextureSystem`, `GCSystem`, `Geometry`, `InstructionSet`, `GlobalUniformSystem`, `RenderTarget`, `RenderTargetSystem`, `SchedulerSystem`, `Shader`, `UboSystem`, `UniformGroup`, `HelloSystem`, `State`, `AbstractRenderer`, `CubeTexture`, `RenderableGCSystem`, `RenderTexture`, `BufferImageSource`, `CanvasSource`, `CompressedSource`, `CubeTextureSource`, `ExternalSource`, `ImageSource`, `TextureSource`, `VideoSource`, `Texture`, `TextureGCSystem`, `TextureMatrix`, `TexturePoolClass`, `TextureStyle`, `TextureUvs`, `ViewSystem`, `Bounds`, `RenderGroup`, `CanvasGraphicsAdaptor`, `CanvasGraphicsContextSystem`, `GlGraphicsAdaptor`, `GpuGraphicsAdaptor`, `GpuGraphicsContext`, `GraphicsContextRenderData`, `GraphicsContextSystem`, `GlMeshAdaptor`, `GpuMeshAdapter`, `HTMLTextSystem`, `CanvasRendererTextSystem`, `AbstractTextSystem`, `CanvasTextSystem`, `MaskChannel`, `PrepareSourceItem`, `PrepareQueueItem`, `BatchAction`, `BatchableElement`, `BatchableQuadElement`, `BatchableMeshElement`, `DefaultBatchElements`, `DefaultBatchableQuadElement`, `DefaultBatchableMeshElement`, `MaskEffect`, `RendererPreference`, `CanvasSystems`, `CLEAR_OR_BOOL`, `GlRenderingContext`, `WEBGL_compressed_texture_pvrtc`, `WEBGL_compressed_texture_etc`, `WEBGL_compressed_texture_etc1`, `WEBGL_compressed_texture_atc`, `EXT_texture_compression_bptc`, `EXT_texture_compression_rgtc`, `WebGLExtensions`, `PRECISION`, `ExtractedAttributeData`, `WebGLSystems`, `WebGLOptions`, `GPU`, `BindResource`, `ProgramPipelineLayoutDescription`, `ProgramLayout`, `ProgramSource`, `GPUProgramData`, `StructsAndGroups`, `StencilState`, `WebGPUSystems`, `WebGPUOptions`, `TypedArray`, `GCData`, `GCable`, `Topology`, `VertexFormat`, `IndexBufferArray`, `Attribute`, `AttributeOption`, `GeometryDescriptor`, `Instruction`, `InstructionPipe`, `RenderPipe`, `BatchPipe`, `PipeConstructor`, `GlobalUniformGroup`, `GlobalUniformData`, `RenderSurface`, `RenderTargetAdaptor`, `ShaderGroups`, `GlShaderWith`, `GpuShaderWith`, `ShaderWithGroupsDescriptor`, `ShaderWith`, `ShaderWithGroups`, `ShaderWithResources`, `IShaderWithResources`, `ShaderDescriptor`, `ShaderFromGroups`, `ShaderFromResources`, `ShaderSystem`, `UniformData`, `CULL_MODES`, `System`, `SystemConstructor`, `ALPHA_MODES`, `TEXTURE_FORMATS`, `TEXTURE_DIMENSIONS`, `TEXTURE_VIEW_DIMENSIONS`, `WRAP_MODE`, `SCALE_MODE`, `COMPARE_FUNCTION`, `GetPixelsOutput`, `CubeTextureFaces`, `ImageResource`, `VideoResource`, `TextureBorders`, `UVs`, `BindableTexture`, `TextureSourceLike`, `Renderer`, `RenderPipes`, `GpuPowerPreference`, `GPUDataOwner`, `BoundsData`, `Effect`, `EffectConstructor`, `BUFFER_TYPE`, `CLEAR`, `GL_FORMATS`, `GL_TARGETS`, `GL_WRAP_MODES`, `BufferUsage`, `STENCIL_MODES`, `MaskEffectManager`, `DRAW_MODES`, `BLEND_TO_NPM`, `WRAP_MODES`, `SCALE_MODES`, `TexturePool`
**scene:** `graphicsContextToSvg`, `buildGeometryFromPath`, `Culler`, `DOMContainer`, `Container`, `RenderContainer`, `FillGradient`, `FillPattern`, `Graphics`, `GraphicsContext`, `GraphicsPath`, `ShapePath`, `RenderLayer`, `PerspectiveMesh`, `PerspectivePlaneGeometry`, `MeshPlane`, `PlaneGeometry`, `MeshRope`, `MeshSimple`, `RopeGeometry`, `Mesh`, `MeshGeometry`, `Particle`, `ParticleContainer`, `AnimatedSprite`, `NineSliceGeometry`, `NineSliceSprite`, `NineSlicePlane`, `TilingSprite`, `Sprite`, `ViewContainer`, `CullingMixinConstructor`, `View`, `CacheAsTextureMixin`, `ChildrenHelperMixin`, `Mask`, `MaskOptionsAndMask`, `EffectsMixin`, `FindMixin`, `GetFastGlobalBoundsMixin`, `GetGlobalMixin`, `MeasureMixin`, `OnRenderMixin`, `SortMixin`, `ToLocalGlobalMixin`, `ContainerChild`, `ContainerEvents`, `RenderFunction`, `LineCap`, `LineJoin`, `GradientType`, `PatternRepetition`, `TextureSpace`, `FillStyle`, `StrokeAttributes`, `StrokeStyle`, `FillInput`, `StrokeInput`, `ConvertedFillStyle`, `ConvertedStrokeStyle`, `FillStyleInputs`, `BatchMode`, `PathInstruction`, `RoundedPoint`, `ShapePrimitiveWithHoles`, `TextureShader`, `IParticle`, `ParticleProperties`, `AnimatedSpriteFrames`, `FrameObject`, `styleAttributes`, `shapeBuilders`
**accessibility:** `AccessibilitySystem`, `PointerEvents`
**filters:** `ColorBlend`, `ColorBurnBlend`, `ColorDodgeBlend`, `DarkenBlend`, `DifferenceBlend`, `DivideBlend`, `ExclusionBlend`, `HardLightBlend`, `HardMixBlend`, `LightenBlend`, `LinearBurnBlend`, `LinearDodgeBlend`, `LinearLightBlend`, `LuminosityBlend`, `NegationBlend`, `OverlayBlend`, `PinLightBlend`, `SaturationBlend`, `SoftLightBlend`, `SubtractBlend`, `VividLightBlend`, `AlphaFilter`, `BlurFilter`, `BlurFilterPass`, `ColorMatrixFilter`, `DisplacementFilter`, `NoiseFilter`, `Filter`, `CanvasFilterCapable`, `ColorMatrix`, `FilterWithShader`, `FilterAntialias`, `BLEND_MODES`
**app:** `Application`, `ResizePlugin`, `TickerPlugin`, `CullerPlugin`, `ApplicationPlugin`
**color:** `Color`, `RgbaArray`, `ColorSource`
**events:** `EventBoundary`, `EventSystem`, `FederatedEvent`, `FederatedMouseEvent`, `FederatedPointerEvent`, `FederatedWheelEvent`, `EventSystemFeatures`, `PixiTouch`, `FederatedEventMap`, `GlobalFederatedEventMap`, `AllFederatedEventMap`, `FederatedEventEmitterTypes`, `Cursor`, `IHitArea`, `FederatedEventHandler`, `EventMode`, `IFederatedContainer`, `EventsTicker`
**text:** `AbstractBitmapFont`, `BitmapFont`, `BitmapText`, `HTMLText`, `HTMLTextStyle`, `AbstractSplitText`, `SplitBitmapText`, `SplitText`, `AbstractText`, `CanvasTextMetrics`, `Text`, `TextStyle`, `CharData`, `RawCharData`, `BitmapFontData`, `TextSplitOutput`, `TextString`, `AnyTextStyle`, `FontMetrics`, `TextStyleAlign`, `TextStyleFill`, `TextStyleFontStyle`, `TextStyleFontVariant`, `TextStyleFontWeight`, `TextStyleLineJoin`, `TextStyleTextBaseline`, `TextStyleWhiteSpace`, `TextDropShadow`, `BitmapFontManager`
**ticker:** `Ticker`, `TickerCallback`, `UPDATE_PRIORITY`
**gif:** `GifSource`, `GifSprite`, `GifFrame`, `GifAsset`

## Documentation

- **Architecture** — # Architecture

PixiJS is composed of several major components that work together to render 2D content to the screen.

- **Scene Graph** — # Scene Graph

The scene graph is the tree of objects that PixiJS draws every frame.

- **Render Loop** — # Render Loop

At the core of PixiJS lies its **render loop**, a repeating cycle that updates and redraws your scene every frame.

- **Render Groups** — # Render Groups

A RenderGroup is a Container that PixiJS treats as a self-contained rendering unit.

- **Render Layers** — # Render Layers

RenderLayers let you control **draw order** independently of the **scene graph hierarchy**.

- **Environments** — # Using PixiJS in Different Environments

PixiJS runs in browsers by default with zero configuration.

- **Garbage Collection** — # Managing Garbage Collection in PixiJS

PixiJS objects like textures and meshes consume GPU memory that JavaScript's garbage collector can't reclaim automatically.

- **Performance Tips** — # Performance Tips

This page collects practical advice for improving frame rate and reducing memory usage in PixiJS applications.

- **Overview** — # Accessibility

Canvas elements are invisible to screen readers by default.

- **Overview** — # Application

The Application class is the starting point for most PixiJS projects.

- **Overview** — # Assets

The Assets singleton is how you load images, spritesheets, fonts, and other resources in PixiJS.

- **Overview** — # Color

The `Color` class provides a unified way to work with colors in PixiJS.

- **Overview** — # Environment

Most PixiJS users run in a browser and can ignore this page.

- **Overview** — # Events

PixiJS provides a DOM-like federated event model for mouse, touch, and pointer input.

- **Overview** — # Extensions

PixiJS is built as a set of swappable parts called **extensions**.

- **Overview** — # Filters

Filters apply post-processing effects to any display object and its children.

- **Overview** — # Math

PixiJS provides math utilities for 2D transformations, geometry, and shapes.

- **Overview** — # Rendering

PixiJS renderers draw your scene to a canvas using **WebGL/WebGL2**, **WebGPU**, or the **Canvas 2D** API.

- **Overview** — # Scene objects

Everything visible in a PixiJS application is a scene object arranged in a **scene graph**: a tree of containers, sprites, text, graphics, and other display objects.

- **Overview** — # GIF

The GIF module adds animated GIF support to PixiJS.

- **Overview** — # Ticker

The Ticker class executes callbacks on every animation frame.

- **Overview** — # Utils

PixiJS ships helper functions for browser detection, device checks, data manipulation, and path handling.

- **v8 Migration Guide** — # v8 Migration Guide

Welcome to the PixiJS v8 Migration Guide!

- **v7 Migration Guide** — # v7 Migration Guide

First and foremost, PixiJS v7 is a modernization release that reflects changes in the ecosystem since PixiJS was first published over six years ago.

- **v6 Migration Guide** — # v6 Migration Guide

[PixiJS 6](https://github.

- **v5 Migration Guide** — # v5 Migration Guide

This document is useful for developers who are attempting to **upgrading from v4 to v5**.

## Links

- [Repository](https://github.com/pixijs/pixijs)
- Author: PixiJS Team
