# Classes

## rendering

### `GpuRenderTargetAdaptor`

The WebGPU adaptor for the render target system. Allows the Render Target System to
be used with the WebGPU renderer
_implements `RenderTargetAdaptor<GpuRenderTarget>`_

```ts
constructor(): GpuRenderTargetAdaptor
```

**Methods:**

- `init(renderer: WebGPURenderer, renderTargetSystem: RenderTargetSystem<GpuRenderTarget>): void` — Initializes the adaptor.
- `copyToTexture(sourceRenderSurfaceTexture: RenderTarget, destinationTexture: Texture, originSrc: { x: number; y: number }, size: { width: number; height: number }, originDest: { x: number; y: number }): Texture<TextureSource<any>>` — A function copies the contents of a render surface to a texture
- `startRenderPass(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, viewport?: Rectangle, mipLevel: number, layer: number): void` — starts a render pass on the render target
- `finishRenderPass(): void` — finishes the current render pass
- `getDescriptor(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearValue: RgbaArray, mipLevel: number, layer: number): GPURenderPassDescriptor`
- `clear(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray, viewport?: Rectangle, mipLevel: number, layer: number): void` — clears the current render target to the specified color
- `initGpuRenderTarget(renderTarget: RenderTarget): GpuRenderTarget` — initializes a gpu render target
- `destroyGpuRenderTarget(gpuRenderTarget: GpuRenderTarget): void` — destroys the gpu render target
- `ensureDepthStencilTexture(renderTarget: RenderTarget): void`
- `resizeGpuRenderTarget(renderTarget: RenderTarget): void` — resizes the gpu render target
