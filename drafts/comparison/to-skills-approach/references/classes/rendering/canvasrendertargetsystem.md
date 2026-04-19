# Classes

## rendering

### `CanvasRenderTargetSystem`

The Canvas adaptor for the render target system.
_extends `RenderTargetSystem<CanvasRenderTarget>`_

```ts
constructor(renderer: CanvasRenderer): CanvasRenderTargetSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "renderTarget" }`
- `adaptor: CanvasRenderTargetAdaptor` — a reference to the adaptor that interfaces with WebGL / WebGP
- `rootRenderTarget: RenderTarget` — When rendering of a scene begins, this is where the root render surface is stored
- `rootViewPort: Rectangle` — This is the root viewport for the render pass
- `renderingToScreen: boolean` — A boolean that lets the dev know if the current render pass is rendering to the screen. Used by some plugins
- `renderTarget: RenderTarget` — the current active render target
- `renderSurface: RenderSurface` — the current active render surface that the render target is created from
- `viewport: Rectangle` — the current viewport that the gpu is using
- `mipLevel: number` — the current mip level being rendered to (for texture subresources)
- `layer: number` — the current array layer being rendered to (for array-backed targets)
- `onRenderTargetChange: SystemRunner` — a runner that lets systems know if the active render target has changed.
  Eg the Stencil System needs to know so it can manage the stencil buffer
- `projectionMatrix: Matrix` — the projection matrix that is used by the shaders based on the active render target and the viewport
- `defaultClearColor: RgbaArray` — the default clear color for render targets
  **Methods:**
- `finishRenderPass(): void` — called when dev wants to finish a render pass
- `renderStart(options: { target: RenderSurface; clear: CLEAR_OR_BOOL; clearColor: RgbaArray; frame?: Rectangle; mipLevel?: number; layer?: number }): void` — called when the renderer starts to render a scene.
- `postrender(): void`
- `bind(renderSurface: RenderSurface, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, frame?: Rectangle, mipLevel: number, layer: number): RenderTarget` — Binding a render surface! This is the main function of the render target system.
  It will take the RenderSurface (which can be a texture, canvas, or render target) and bind it to the renderer.
  Once bound all draw calls will be rendered to the render surface.

If a frame is not provided and the render surface is a Texture, the frame of the texture will be used.

IMPORTANT:

- `frame` is treated as **base mip (mip 0) pixel space**.
- When `mipLevel > 0`, the viewport derived from `frame` is scaled by \(2^{mipLevel}\) and clamped to the
  mip dimensions. This keeps "render the same region" semantics consistent across mip levels.
- When `renderSurface` is a Texture, `renderer.render({ container, target: texture, mipLevel })` will
  render into
  the underlying TextureSource (Pixi will create/use a RenderTarget for the source) using the
  texture's frame to define the region (in mip 0 space).
- `clear(target?: RenderSurface, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, mipLevel: number, layer: number): void`
- `push(renderSurface: RenderSurface, clear: boolean | CLEAR, clearColor?: RgbaArray, frame?: Rectangle, mipLevel: number, layer: number): RenderTarget` — Push a render surface to the renderer. This will bind the render surface to the renderer,
- `pop(): void` — Pops the current render target from the renderer and restores the previous render target.
- `getRenderTarget(renderSurface: RenderSurface): RenderTarget` — Gets the render target from the provide render surface. Eg if its a texture,
  it will return the render target for the texture.
  If its a render target, it will return the same render target.
- `copyToTexture(sourceRenderSurfaceTexture: RenderTarget, destinationTexture: Texture, originSrc: { x: number; y: number }, size: { width: number; height: number }, originDest: { x: number; y: number }): Texture<TextureSource<any>>` — Copies a render surface to another texture.

NOTE:
for sourceRenderSurfaceTexture, The render target must be something that is written too by the renderer

The following is not valid:

- `ensureDepthStencil(): void` — ensures that we have a depth stencil buffer available to render to
  This is used by the mask system to make sure we have a stencil buffer.
- `destroy(): void` — nukes the render target system
- `getGpuRenderTarget(renderTarget: RenderTarget): CanvasRenderTarget`
- `resetState(): void`
