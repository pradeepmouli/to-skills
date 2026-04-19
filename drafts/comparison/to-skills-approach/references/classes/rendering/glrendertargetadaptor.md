# Classes

## rendering

### `GlRenderTargetAdaptor`

The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGL renderer
_implements `RenderTargetAdaptor<GlRenderTarget>`_

```ts
constructor(): GlRenderTargetAdaptor
```

**Methods:**

- `init(renderer: WebGLRenderer, renderTargetSystem: RenderTargetSystem<GlRenderTarget>): void` — Initializes the adaptor.
- `contextChange(): void`
- `copyToTexture(sourceRenderSurfaceTexture: RenderTarget, destinationTexture: Texture, originSrc: { x: number; y: number }, size: { width: number; height: number }, originDest: { x: number; y: number }): Texture<TextureSource<any>>` — A function copies the contents of a render surface to a texture
- `startRenderPass(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, viewport?: Rectangle, mipLevel: number, layer: number): void` — starts a render pass on the render target
- `finishRenderPass(renderTarget?: RenderTarget): void` — finishes the current render pass
- `initGpuRenderTarget(renderTarget: RenderTarget): GlRenderTarget` — initializes a gpu render target
- `destroyGpuRenderTarget(gpuRenderTarget: GlRenderTarget): void` — destroys the gpu render target
- `clear(_renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, _viewport?: Rectangle, _mipLevel: number, layer: number): void` — clears the current render target to the specified color
- `resizeGpuRenderTarget(renderTarget: RenderTarget): void` — resizes the gpu render target
- `prerender(renderTarget: RenderTarget): void` — called before the render main pass is started
- `postrender(renderTarget: RenderTarget): void` — called after the render pass is finished
