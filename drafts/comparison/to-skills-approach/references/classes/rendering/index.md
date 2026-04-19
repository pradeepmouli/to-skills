# rendering

| Class                                                                                            | Description                                                                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [CanvasFilterSystem](canvasfiltersystem.md)                                                      | Canvas2D filter system that applies compatible filters using CSS filter strings.                           |
| Unsupported filters are skipped with a warn-once message.                                        |
| [FilterSystem](filtersystem.md)                                                                  | System that manages the filter pipeline                                                                    |
| [PrepareBase](preparebase.md)                                                                    | Part of the prepare system. Responsible for uploading all the items to the GPU.                            |
| This class provides the base functionality and handles processing the queue asynchronously.      |
| [PrepareQueue](preparequeue.md)                                                                  | Part of the prepare system. Responsible for uploading all the items to the GPU.                            |
| This class extends the base functionality and resolves given resource items ready for the queue. |
| [PrepareSystem](preparesystem.md)                                                                | The prepare system provides renderer-specific plugins for pre-rendering DisplayObjects. This is useful for |

asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.

Do not instantiate this plugin directly. It is available from the `renderer.prepare` property. |
| [PrepareUpload](prepareupload.md) | |
| [CanvasBatchAdaptor](canvasbatchadaptor.md) | A BatcherAdaptor that renders batches using Canvas2D. |
| [GlBatchAdaptor](glbatchadaptor.md) | A BatcherAdaptor that uses WebGL to render batches. |
| [GpuBatchAdaptor](gpubatchadaptor.md) | A BatcherAdaptor that uses the GPU to render batches. |
| [Batch](batch.md) | A batch pool is used to store batches when they are not currently in use. |
| [Batcher](batcher.md) | A batcher is used to batch together objects with the same texture.
It is an abstract class that must be extended. see DefaultBatcher for an example. |
| [BatcherPipe](batcherpipe.md) | A pipe that batches elements into batches and sends them to the renderer.

You can install new Batchers using ExtensionType.Batcher. Each render group will
have a default batcher and any required ones will be created on demand. |
| [BatchGeometry](batchgeometry.md) | This class represents a geometry used for batching in the rendering system.
It defines the structure of vertex attributes and index buffers for batched rendering. |
| [BatchTextureArray](batchtexturearray.md) | Used by the batcher to build texture batches. Holds list of textures and their respective locations. |
| [DefaultBatcher](defaultbatcher.md) | The default batcher is used to batch quads and meshes. This batcher will batch the following elements:

- tints
- roundPixels
- texture
- transform |
  | [DefaultShader](defaultshader.md) | DefaultShader is a specialized shader class designed for batch rendering.
  It extends the base Shader class and provides functionality for handling
  color, texture batching, and pixel rounding in both WebGL and WebGPU contexts.

It is used by the default batcher |
| [AlphaMask](alphamask.md) | AlphaMask is an effect that applies a mask to a container using a sprite texture.
By default, the red channel of the mask texture controls visibility. Set `channel` to `'alpha'`
to use the alpha channel instead, which is useful for masks defined by transparency.
The mask can be inverted, and non-sprite masks are rendered to a texture automatically. |
| [ColorMask](colormask.md) | The ColorMask effect allows you to apply a color mask to the rendering process.
This can be useful for selectively rendering certain colors or for creating
effects based on color values. |
| [MaskEffectManagerClass](maskeffectmanagerclass.md) | A class that manages the conversion of masks to mask effects. |
| [ScissorMask](scissormask.md) | ScissorMask is an effect that applies a scissor mask to a container.
It restricts rendering to the area defined by the mask.
The mask is a Container that defines the area to be rendered.
The mask must be a Container that is not renderable or measurable.
This effect is used to create clipping regions in the rendering process. |
| [StencilMask](stencilmask.md) | A mask that uses the stencil buffer to clip the rendering of a container.
This is useful for complex masks that cannot be achieved with simple shapes.
It is more performant than using a `Graphics` mask, but requires WebGL support.
It is also useful for masking with `Container` objects that have complex shapes. |
| [CanvasContextSystem](canvascontextsystem.md) | Canvas 2D context system for the CanvasRenderer. |
| [CanvasLimitsSystem](canvaslimitssystem.md) | Basic limits for CanvasRenderer. |
| [CanvasRenderer](canvasrenderer.md) | The Canvas PixiJS Renderer. This renderer allows you to use the HTML Canvas 2D context. |
| [CanvasRenderTargetAdaptor](canvasrendertargetadaptor.md) | Canvas adaptor for render targets. |
| [CanvasRenderTargetSystem](canvasrendertargetsystem.md) | The Canvas adaptor for the render target system. |
| [CanvasTextureSystem](canvastexturesystem.md) | Texture helper system for CanvasRenderer. |
| [GlBufferSystem](glbuffersystem.md) | System plugin to the renderer to manage buffers.

WebGL uses Buffers as a way to store objects to the GPU.
This system makes working with them a lot easier.

Buffers are used in three main places in WebGL

- geometry information
- Uniform information (via uniform buffer objects - a WebGL 2 only feature)
- Transform feedback information. (WebGL 2 only feature)

This system will handle the binding of buffers to the GPU as well as uploading
them. With this system, you never need to work directly with GPU buffers, but instead work with
the Buffer class. |
| [GlContextSystem](glcontextsystem.md) | System plugin to the renderer to manage the context |
| [GlGeometrySystem](glgeometrysystem.md) | System plugin to the renderer to manage geometry. |
| [GlBackBufferSystem](glbackbuffersystem.md) | For blend modes you need to know what pixels you are actually drawing to. For this to be possible in WebGL
we need to render to a texture and then present that texture to the screen. This system manages that process.

As the main scene is rendered to a texture, it means we can sample it and copy its pixels,
something not possible on the main canvas.

If antialiasing is set to to true and useBackBuffer is set to true, then the back buffer will be antialiased.
and the main gl context will not.

You only need to activate this back buffer if you are using a blend mode that requires it.

to activate is simple, you pass `useBackBuffer:true` to your render options |
| [GlColorMaskSystem](glcolormasksystem.md) | The system that handles color masking for the WebGL. |
| [GlEncoderSystem](glencodersystem.md) | The system that handles encoding commands for the WebGL. |
| [GlLimitsSystem](gllimitssystem.md) | The GpuLimitsSystem provides information about the capabilities and limitations of the underlying GPU.
These limits, such as the maximum number of textures that can be used in a shader
(`maxTextures`) or the maximum number of textures that can be batched together (`maxBatchableTextures`),
are determined by the specific graphics hardware and driver.

The values for these limits are not available immediately upon instantiation of the class.
They are populated when the GL rendering context is successfully initialized and ready,
which occurs after the `renderer.init()` method has completed.
Attempting to access these properties before the context is ready will result in undefined or default values.

This system allows the renderer to adapt its behavior and resource allocation strategies
to stay within the supported boundaries of the GPU, ensuring optimal performance and stability. |
| [GlRenderTarget](glrendertarget.md) | Represents a render target. |
| [GlStencilSystem](glstencilsystem.md) | This manages the stencil buffer. Used primarily for masking |
| [GlUboSystem](glubosystem.md) | System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor. |
| [GlRenderTargetAdaptor](glrendertargetadaptor.md) | The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGL renderer |
| [GlRenderTargetSystem](glrendertargetsystem.md) | The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer |
| [GlProgram](glprogram.md) | A wrapper for a WebGL Program. You can create one and then pass it to a shader.
This will manage the WebGL program that is compiled and uploaded to the GPU.

To get the most out of this class, you should be familiar with glsl shaders and how they work. |
| [GlShaderSystem](glshadersystem.md) | System plugin to the renderer to manage the shaders for WebGL. |
| [GlUniformGroupSystem](gluniformgroupsystem.md) | System plugin to the renderer to manage shaders. |
| [GlStateSystem](glstatesystem.md) | System plugin to the renderer to manage WebGL state machines |
| [GlTexture](gltexture.md) | Internal texture for WebGL context |
| [GlTextureSystem](gltexturesystem.md) | The system for managing textures in WebGL. |
| [WebGLRenderer](webglrenderer.md) | The WebGL PixiJS Renderer. This renderer allows you to use the most common graphics API, WebGL (and WebGL2).

```ts
// Create a new renderer
const renderer = new WebGLRenderer();
await renderer.init();

// Add the renderer to the stage
document.body.appendChild(renderer.canvas);

// Create a new stage
const stage = new Container();

// Render the stage
renderer.render(stage);
```

You can use autoDetectRenderer to create a renderer that will automatically detect the best
renderer for the environment.

```ts
// Create a new renderer
const renderer = await rendering.autoDetectRenderer({
  preference: 'webgl'
});
```

The renderer is composed of systems that manage specific tasks. The following systems are added by default
whenever you create a WebGL renderer:

| WebGL Core Systems   | Systems that are specific to the WebGL renderer                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| GlUboSystem          | This manages WebGL2 uniform buffer objects feature for shaders                                                   |
| GlBackBufferSystem   | manages the back buffer, used so that we can pixi can pixels from the screen                                     |
| GlContextSystem      | This manages the WebGL context and its extensions                                                                |
| GlBufferSystem       | This manages buffers and their GPU resources, keeps everything in sync                                           |
| GlTextureSystem      | This manages textures and their GPU resources, keeps everything in sync                                          |
| GlRenderTargetSystem | This manages what we render too. For example the screen, or another texture                                      |
| GlGeometrySystem     | This manages geometry, used for drawing meshes via the GPU                                                       |
| GlUniformGroupSystem | This manages uniform groups. Syncing shader properties with the GPU                                              |
| GlShaderSystem       | This manages shaders, programs that run on the GPU to output lovely pixels                                       |
| GlEncoderSystem      | This manages encoders, a WebGPU Paradigm, use it to draw a mesh + shader                                         |
| GlStateSystem        | This manages the state of the WebGL context. eg the various flags that can be set blend modes / depthTesting etc |
| GlStencilSystem      | This manages the stencil buffer. Used primarily for masking                                                      |
| GlColorMaskSystem    | This manages the color mask. Used for color masking                                                              |

The breadth of the API surface provided by the renderer is contained within these systems. |
| [BindGroupSystem](bindgroupsystem.md) | This manages the WebGPU bind groups. this is how data is bound to a shader when rendering |
| [GpuBufferSystem](gpubuffersystem.md) | System plugin to the renderer to manage buffers. |
| [GpuColorMaskSystem](gpucolormasksystem.md) | The system that handles color masking for the GPU. |
| [GpuDeviceSystem](gpudevicesystem.md) | System plugin to the renderer to manage the context. |
| [GpuEncoderSystem](gpuencodersystem.md) | The system that handles encoding commands for the GPU. |
| [GpuLimitsSystem](gpulimitssystem.md) | The GpuLimitsSystem provides information about the capabilities and limitations of the underlying GPU.
These limits, such as the maximum number of textures that can be used in a shader
(`maxTextures`) or the maximum number of textures that can be batched together (`maxBatchableTextures`),
are determined by the specific graphics hardware and driver.

The values for these limits are not available immediately upon instantiation of the class.
They are populated when the WebGPU Device rendering context is successfully initialized and ready,
which occurs after the `renderer.init()` method has completed.
Attempting to access these properties before the context is ready will result in undefined or default values.

This system allows the renderer to adapt its behavior and resource allocation strategies
to stay within the supported boundaries of the GPU, ensuring optimal performance and stability. |
| [GpuStencilSystem](gpustencilsystem.md) | This manages the stencil buffer. Used primarily for masking |
| [GpuUboSystem](gpuubosystem.md) | System plugin to the renderer to manage uniform buffers. With a WGSL twist! |
| [PipelineSystem](pipelinesystem.md) | A system that creates and manages the GPU pipelines.

Caching Mechanism: At its core, the system employs a two-tiered caching strategy to minimize
the redundant creation of GPU pipelines (or "pipes"). This strategy is based on generating unique
keys that represent the state of the graphics settings and the specific requirements of the
item being rendered. By caching these pipelines, subsequent draw calls with identical configurations
can reuse existing pipelines instead of generating new ones.

State Management: The system differentiates between "global" state properties (like color masks
and stencil masks, which do not change frequently) and properties that may vary between draw calls
(such as geometry, shaders, and blend modes). Unique keys are generated for both these categories
using getStateKey for global state and getGraphicsStateKey for draw-specific settings. These keys are
then then used to caching the pipe. The next time we need a pipe we can check
the cache by first looking at the state cache and then the pipe cache. |
| [GpuRenderTarget](gpurendertarget.md) | A class which holds the canvas contexts and textures for a render target. |
| [GpuRenderTargetAdaptor](gpurendertargetadaptor.md) | The WebGPU adaptor for the render target system. Allows the Render Target System to
be used with the WebGPU renderer |
| [GpuRenderTargetSystem](gpurendertargetsystem.md) | The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer |
| [BindGroup](bindgroup.md) | A bind group is a collection of resources that are bound together for use by a shader.
They are essentially a wrapper for the WebGPU BindGroup class. But with the added bonus
that WebGL can also work with them. |
| [GpuProgram](gpuprogram.md) | A wrapper for a WebGPU Program, specifically designed for the WebGPU renderer.
This class facilitates the creation and management of shader code that integrates with the WebGPU pipeline.

To leverage the full capabilities of this class, familiarity with WGSL shaders is recommended. |
| [GpuShaderSystem](gpushadersystem.md) | A system that manages the rendering of GpuPrograms. |
| [GpuStateSystem](gpustatesystem.md) | System plugin to the renderer to manage WebGL state machines. |
| [GpuTextureSystem](gputexturesystem.md) | The system that handles textures for the GPU. |
| [GpuMipmapGenerator](gpumipmapgenerator.md) | A class which generates mipmaps for a GPUTexture.
Thanks to toji for the original implementation
https://github.com/toji/web-texture-tool/blob/main/src/webgpu-mipmap-generator.js |
| [WebGPURenderer](webgpurenderer.md) | The WebGPU PixiJS Renderer. This renderer allows you to use the next-generation graphics API, WebGPU.

```ts
// Create a new renderer
const renderer = new WebGPURenderer();
await renderer.init();

// Add the renderer to the stage
document.body.appendChild(renderer.canvas);

// Create a new stage
const stage = new Container();

// Render the stage
renderer.render(stage);
```

You can use autoDetectRenderer to create a renderer that will automatically detect the best
renderer for the environment.

```ts
import { autoDetectRenderer } from 'pixi.js';
// Create a new renderer
const renderer = await autoDetectRenderer();
```

The renderer is composed of systems that manage specific tasks. The following systems are added by default
whenever you create a WebGPU renderer:

| WebGPU Core Systems   | Systems that are specific to the WebGL renderer                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| GpuUboSystem          | This manages WebGPU uniform buffer objects feature for shaders                                                      |
| GpuEncoderSystem      | This manages the WebGPU command encoder                                                                             |
| GpuDeviceSystem       | This manages the WebGPU Device and its extensions                                                                   |
| GpuBufferSystem       | This manages buffers and their GPU resources, keeps everything in sync                                              |
| GpuTextureSystem      | This manages textures and their GPU resources, keeps everything in sync                                             |
| GpuRenderTargetSystem | This manages what we render too. For example the screen, or another texture                                         |
| GpuShaderSystem       | This manages shaders, programs that run on the GPU to output lovely pixels                                          |
| GpuStateSystem        | This manages the state of the WebGPU Pipelines. eg the various flags that can be set blend modes / depthTesting etc |
| PipelineSystem        | This manages the WebGPU pipelines, used for rendering                                                               |
| GpuColorMaskSystem    | This manages the color mask. Used for color masking                                                                 |
| GpuStencilSystem      | This manages the stencil buffer. Used primarily for masking                                                         |
| BindGroupSystem       | This manages the WebGPU bind groups. this is how data is bound to a shader when rendering                           |

The breadth of the API surface provided by the renderer is contained within these systems. |
| [BackgroundSystem](backgroundsystem.md) | The background system manages the background color and alpha of the main view. |
| [Buffer](buffer.md) | A wrapper for a WebGPU/WebGL Buffer.
In PixiJS, the Buffer class is used to manage the data that is sent to the GPU rendering pipeline.
It abstracts away the underlying GPU buffer and provides an interface for uploading typed arrays or other data to the GPU,
They are used in the following places:
<br><br>
.1. Geometry as attribute data or index data for geometry
<br>
.2. UniformGroup as an underlying buffer for uniform data
<br>
.3. BufferResource as an underlying part of a buffer used directly by the GPU program
<br>

It is important to note that you must provide a usage type when creating a buffer. This is because
the underlying GPU buffer needs to know how it will be used. For example, if you are creating a buffer
to hold vertex data, you would use `BufferUsage.VERTEX`. This will tell the GPU that this buffer will be
used as a vertex buffer. This is important because it will affect how you can use the buffer.

Buffers are updated by calling the Buffer.update method. This immediately updates the buffer on the GPU.
Be mindful of calling this more often than you need to. It is recommended to update buffers only when needed.

In WebGPU, a GPU buffer cannot resized. This limitation is abstracted away, but know that resizing a buffer means
creating a brand new one and destroying the old, so it is best to limit this if possible. |
| [BufferResource](bufferresource.md) | A resource that can be bound to a bind group and used in a shader.
Whilst a buffer can be used as a resource, this class allows you to specify an offset and size of the buffer to use.
This is useful if you have a large buffer and only part of it is used in a shader.

This resource, will listen for changes on the underlying buffer and emit a itself if the buffer changes shape. |
| [ExtractSystem](extractsystem.md) | System for exporting content from a renderer. It provides methods to extract content as images,
canvases, or raw pixel data. Available through `renderer.extract`. |
| [GenerateTextureSystem](generatetexturesystem.md) | System that manages the generation of textures from display objects in the renderer.
This system is responsible for creating reusable textures from containers, sprites, and other display objects.
Available through `renderer.textureGenerator`. |
| [GCSystem](gcsystem.md) | A unified garbage collection system for managing GPU resources.
Resources register themselves with a cleanup callback and are automatically
cleaned up when they haven't been used for a specified amount of time. |
| [Geometry](geometry.md) | A Geometry is a low-level object that represents the structure of 2D shapes in terms of vertices and attributes.
It's a crucial component for rendering as it describes the shape and format of the data that will go through the shaders.
Essentially, a Geometry object holds the data you'd send to a GPU buffer.

A geometry is basically made of two components:
<br>
<b>Attributes</b>: These are essentially arrays that define properties of the vertices like position, color,
texture coordinates, etc. They map directly to attributes in your vertex shaders.
<br>
<b>Indices</b>: An optional array that describes how the vertices are connected.
If not provided, vertices will be interpreted in the sequence they're given. |
| [InstructionSet](instructionset.md) | A set of instructions that can be executed by the renderer.
Basically wraps an array, but with some extra properties that help the renderer
to keep things nice and optimised.

Note:
InstructionSet.instructions contains all the instructions, but does not resize (for performance).
So for the true length of the instructions you need to use InstructionSet.instructionSize |
| [GlobalUniformSystem](globaluniformsystem.md) | System plugin to the renderer to manage global uniforms for the renderer. |
| [RenderTarget](rendertarget.md) | A class that describes what the renderers are rendering to.
This can be as simple as a Texture, or as complex as a multi-texture, multi-sampled render target.
Support for stencil and depth buffers is also included.

If you need something more complex than a Texture to render to, you should use this class.
Under the hood, all textures you render to have a RenderTarget created on their behalf. |
| [RenderTargetSystem](rendertargetsystem.md) | A system that manages render targets. A render target is essentially a place where the shaders can color in the pixels.
The render target system is responsible for binding the render target to the renderer, and managing the viewport.
Render targets can be pushed and popped.

To make it easier, you can also bind textures and canvases too. This will automatically create a render target for you.
The render target itself is a lot more powerful than just a texture or canvas,
as it can have multiple textures attached to it.
It will also give ou fine grain control over the stencil buffer / depth texture. |
| [SchedulerSystem](schedulersystem.md) | The SchedulerSystem manages scheduled tasks with specific intervals. |
| [Shader](shader.md) | The Shader class is an integral part of the PixiJS graphics pipeline.
Central to rendering in PixiJS are two key elements: A [shader] and a [geometry].
The shader incorporates a GlProgram for WebGL or a GpuProgram for WebGPU,
instructing the respective technology on how to render the geometry.

The primary goal of the Shader class is to offer a unified interface compatible with both WebGL and WebGPU.
When constructing a shader, you need to provide both a WebGL program and a WebGPU program due to the distinctions
between the two rendering engines. If only one is provided, the shader won't function with the omitted renderer.

Both WebGL and WebGPU utilize the same resource object when passed into the shader.
Post-creation, the shader's interface remains consistent across both WebGL and WebGPU.
The sole distinction lies in whether a glProgram or a gpuProgram is employed.

Modifying shader uniforms, which can encompass:

- TextureSampler TextureStyle
- TextureSource TextureSource
- UniformsGroups UniformGroup |
  | [UboSystem](ubosystem.md) | System plugin to the renderer to manage uniform buffers. |
  | [UniformGroup](uniformgroup.md) | Uniform group holds uniform map and some ID's for work

`UniformGroup` has two modes:

1: Normal mode
Normal mode will upload the uniforms with individual function calls as required. This is the default mode
for WebGL rendering.

2: Uniform buffer mode
This mode will treat the uniforms as a uniform buffer. You can pass in either a buffer that you manually handle, or
or a generic object that PixiJS will automatically map to a buffer for you.
For maximum benefits, make Ubo UniformGroups static, and only update them each frame.
This is the only way uniforms can be used with WebGPU.

Rules of UBOs:

- UBOs only work with WebGL2, so make sure you have a fallback!
- Only floats are supported (including vec[2,3,4], mat[2,3,4])
- Samplers cannot be used in ubo's (a GPU limitation)
- You must ensure that the object you pass in exactly matches in the shader ubo structure.
  Otherwise, weirdness will ensue!
- The name of the ubo object added to the group must match exactly the name of the ubo in the shader.

When declaring your uniform options, you ust parse in the value and the type of the uniform.
The types correspond to the WebGPU types

Uniforms can be modified via the classes 'uniforms' property. It will contain all the uniforms declared in the constructor.

```ts
// UBO in shader:
uniform myCoolData { // Declaring a UBO...
    mat4 uCoolMatrix;
    float uFloatyMcFloatFace;
};
```

````js
// A new Uniform Buffer Object...
const myCoolData = new UniformGroup({
    uCoolMatrix: {value:new Matrix(), type: 'mat4<f32>'},
    uFloatyMcFloatFace: {value:23, type: 'f32'},
}}

// modify the data
myCoolData.uniforms.uFloatyMcFloatFace = 42;
// Build a shader...
const shader = Shader.from(srcVert, srcFrag, {
    myCoolData // Name matches the UBO name in the shader. Will be processed accordingly.
})
``` |
| [HelloSystem](hellosystem.md) | A simple system responsible for initiating the renderer. |
| [State](state.md) | This is a WebGL state, and is is passed to GlStateSystem.

Each mesh rendered may require WebGL to be in a different state.
For example you may want different blend mode or to enable polygon offsets |
| [AbstractRenderer](abstractrenderer.md) | The base class for a PixiJS Renderer. It contains the shared logic for all renderers.

You should not use this class directly, but instead use WebGLRenderer
or WebGPURenderer.
Alternatively, you can also use autoDetectRenderer if you want us to
determine the best renderer for you.

The renderer is composed of systems that manage specific tasks. The following systems are added by default
whenever you create a renderer:


| Generic Systems                      | Systems that manage functionality that all renderer types share               |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| ViewSystem              | This manages the main view of the renderer usually a Canvas              |
| BackgroundSystem        | This manages the main views background color and alpha                   |
| EventSystem           | This manages UI events.                                                       |
| AccessibilitySystem | This manages accessibility features. Requires `import 'pixi.js/accessibility'`|

| Core Systems                   | Provide an optimised, easy to use API to work with WebGL/WebGPU               |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| GlobalUniformSystem | This manages shaders, programs that run on the GPU to calculate 'em pixels.   |
| TextureGCSystem     | This will automatically remove textures from the GPU if they are not used.    |

| PixiJS High-Level Systems            | Set of specific systems designed to work with PixiJS objects                  |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| HelloSystem               | Says hello, buy printing out the pixi version into the console log (along with the renderer type)       |
| GenerateTextureSystem | This adds the ability to generate textures from any Container       |
| FilterSystem          | This manages the filtering pipeline for post-processing effects.             |
| PrepareSystem               | This manages uploading assets to the GPU. Requires `import 'pixi.js/prepare'`|
| ExtractSystem               | This extracts image data from display objects.                               |

The breadth of the API surface provided by the renderer is contained within these systems. |
| [CubeTexture](cubetexture.md) | A cube texture that can be bound to shaders (samplerCube / texture_cube).

This is a lightweight wrapper around a CubeTextureSource. |
| [RenderableGCSystem](renderablegcsystem.md) | The RenderableGCSystem is responsible for cleaning up GPU resources that are no longer being used.

When rendering objects like sprites, text, etc - GPU resources are created and managed by the renderer.
If these objects are no longer needed but not properly destroyed (via sprite.destroy()), their GPU resources
would normally leak. This system prevents that by automatically cleaning up unused GPU resources.

Key features:
- Runs every 30 seconds by default to check for unused resources
- Cleans up resources not rendered for over 1 minute
- Works independently of rendering - will clean up even when not actively rendering
- When cleaned up resources are needed again, new GPU objects are quickly assigned from a pool
- Can be disabled with renderableGCActive:false for manual control

Best practices:
- Always call destroy() explicitly when done with renderables (e.g. sprite.destroy())
- This system is a safety net, not a replacement for proper cleanup
- Adjust frequency and timeouts via options if needed |
| [RenderTexture](rendertexture.md) | A render texture, extends `Texture`. |
| [BufferImageSource](bufferimagesource.md) | A texture source that uses a TypedArray or ArrayBuffer as its resource.
It automatically determines the format based on the type of TypedArray provided. |
| [CanvasSource](canvassource.md) | A texture source that uses a canvas as its resource.
It automatically resizes the canvas based on the width, height, and resolution.
It also provides a 2D rendering context for drawing. |
| [CompressedSource](compressedsource.md) | A texture source that uses a compressed resource, such as an array of Uint8Arrays.
It is used for compressed textures that can be uploaded to the GPU. |
| [CubeTextureSource](cubetexturesource.md) | A TextureSource that represents a cube texture (6 faces).

Internally, WebGPU uses a 2D texture with 6 array layers and a `cube` view.
WebGL uses `TEXTURE_CUBE_MAP`. |
| [ExternalSource](externalsource.md) | A texture source that uses a GPU texture from an external library (e.g., Three.js).

This allows sharing textures between PixiJS and other WebGL/WebGPU libraries without
re-uploading pixel data. The renderer is required so that ExternalSource can
pre-populate the GPU data and validate context ownership. |
| [ImageSource](imagesource.md) | A texture source that uses an image-like resource as its resource.
It can handle HTMLImageElement, ImageBitmap, VideoFrame, and HTMLVideoElement.
It is used for textures that can be uploaded to the GPU. |
| [TextureSource](texturesource.md) | A TextureSource stores the information that represents an image.
All textures have require TextureSource, which contains information about the source.
Therefore you can have many textures all using a single TextureSource (eg a sprite sheet)

This is an class is extended depending on the source of the texture.
Eg if you are using an an image as your resource, then an ImageSource is used. |
| [VideoSource](videosource.md) | A texture source that uses a video as its resource.
It automatically resizes the texture based on the video dimensions.
It also provides methods to control playback and handle video events.
This class supports automatic loading, playback, and frame updates.
It can also handle cross-origin videos and provides options for looping, muting, and inline playback. |
| [Texture](texture.md) | A texture stores the information that represents an image or part of an image.

A texture must have a loaded resource passed to it to work. It does not contain any
loading mechanisms.

The Assets class can be used to load a texture from a file. This is the recommended
way as it will handle the loading and caching for you.

```js

const texture = await Assets.load('assets/image.png');

// once Assets has loaded the image it will be available via the from method
const sameTexture = Texture.from('assets/image.png');
// another way to access the texture once loaded
const sameAgainTexture = Assets.get('assets/image.png');

const sprite1 = new Sprite(texture);

````

It cannot be added to the display list directly; instead use it as the texture for a Sprite.
If no frame is provided for a texture, then the whole image is used.

You can directly create a texture from an image and then reuse it multiple times like this :

```js
import { Sprite, Texture } from 'pixi.js';

const texture = await Assets.load('assets/image.png');
const sprite1 = new Sprite(texture);
const sprite2 = new Sprite(texture);
```

If you didn't pass the texture frame to constructor, it enables `noFrame` mode:
it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture. |
| [TextureGCSystem](texturegcsystem.md) | System plugin to the renderer to manage texture garbage collection on the GPU,
ensuring that it does not get clogged up with textures that are no longer being used. |
| [TextureMatrix](texturematrix.md) | Class controls uv mapping from Texture normal space to BaseTexture normal space.

Takes `trim` and `rotate` into account. May contain clamp settings for Meshes and TilingSprite.

Can be used in Texture `uvMatrix` field, or separately, you can use different clamp settings on the same texture.
If you want to add support for texture region of certain feature or filter, that's what you're looking for.

Takes track of Texture changes through `_lastTextureID` private field.
Use `update()` method call to track it from outside. |
| [TexturePoolClass](texturepoolclass.md) | Texture pool, used by FilterSystem and plugins.

Stores collection of temporary pow2 or screen-sized renderTextures

If you use custom RenderTexturePool for your filters, you can use methods
`getFilterTexture` and `returnFilterTexture` same as in default pool |
| [TextureStyle](texturestyle.md) | A texture style describes how a texture should be sampled by a shader. |
| [TextureUvs](textureuvs.md) | Stores a texture's frame in UV coordinates, in
which everything lies in the rectangle `[(0,0), (1,0),
(1,1), (0,1)]`.

| Corner                                                                                                | Coordinates                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --- |
| Top-Left                                                                                              | `(x0,y0)`                                                                                                       |
| Top-Right                                                                                             | `(x1,y1)`                                                                                                       |
| Bottom-Right                                                                                          | `(x2,y2)`                                                                                                       |
| Bottom-Left                                                                                           | `(x3,y3)`                                                                                                       |     |
| [ViewSystem](viewsystem.md)                                                                           | The view system manages the main canvas that is attached to the DOM.                                            |
| This main role is to deal with how the holding the view reference and dealing with how it is resized. |
| [Bounds](bounds.md)                                                                                   | A representation of an axis-aligned bounding box (AABB) used for efficient collision detection and culling.     |
| Stores minimum and maximum coordinates to define a rectangular boundary.                              |
| [RenderGroup](rendergroup.md)                                                                         | A RenderGroup is a class that is responsible for I generating a set of instructions that are used to render the |

root container and its children. It also watches for any changes in that container or its children,
these changes are analysed and either the instruction set is rebuild or the instructions data is updated. |
| [CanvasGraphicsAdaptor](canvasgraphicsadaptor.md) | A GraphicsAdaptor that uses Canvas2D to render graphics. |
| [CanvasGraphicsContextSystem](canvasgraphicscontextsystem.md) | A system that manages the rendering of GraphicsContexts for Canvas2D. |
| [GlGraphicsAdaptor](glgraphicsadaptor.md) | A GraphicsAdaptor that uses WebGL to render graphics. |
| [GpuGraphicsAdaptor](gpugraphicsadaptor.md) | A GraphicsAdaptor that uses the GPU to render graphics. |
| [GpuGraphicsContext](gpugraphicscontext.md) | A class that holds batchable graphics data for a GraphicsContext. |
| [GraphicsContextRenderData](graphicscontextrenderdata.md) | A class that holds the render data for a GraphicsContext. |
| [GraphicsContextSystem](graphicscontextsystem.md) | A system that manages the rendering of GraphicsContexts. |
| [GlMeshAdaptor](glmeshadaptor.md) | A MeshAdaptor that uses the WebGL to render meshes. |
| [GpuMeshAdapter](gpumeshadapter.md) | The WebGL adaptor for the mesh system. Allows the Mesh System to be used with the WebGl renderer |
| [HTMLTextSystem](htmltextsystem.md) | System plugin to the renderer to manage HTMLText |
| [CanvasRendererTextSystem](canvasrenderertextsystem.md) | System plugin to the renderer to manage canvas text for Canvas2D. |
| [AbstractTextSystem](abstracttextsystem.md) | Base system plugin to the renderer to manage canvas text. |
| [CanvasTextSystem](canvastextsystem.md) | System plugin to the renderer to manage canvas text for GPU renderers. |
