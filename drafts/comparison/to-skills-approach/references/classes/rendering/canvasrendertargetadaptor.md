# Classes

## rendering

### `CanvasRenderTargetAdaptor`

Canvas adaptor for render targets.
_implements `RenderTargetAdaptor<CanvasRenderTarget>`_

```ts
constructor(): CanvasRenderTargetAdaptor
```

**Methods:**

- `init(renderer: CanvasRenderer, renderTargetSystem: RenderTargetSystem<CanvasRenderTarget>): void` — Initializes the adaptor.
- `initGpuRenderTarget(renderTarget: RenderTarget): CanvasRenderTarget` — Creates a GPU render target for canvas.
- `resizeGpuRenderTarget(renderTarget: RenderTarget): void` — Resizes the backing canvas for a render target.
- `startRenderPass(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: number[], viewport?: Rectangle): void` — Starts a render pass on the canvas target.
- `clear(renderTarget: RenderTarget, _clear: CLEAR_OR_BOOL, clearColor?: number[], viewport?: Rectangle): void` — Clears the render target.
- `finishRenderPass(): void` — Finishes the render pass (no-op for canvas).
- `copyToTexture(sourceRenderSurfaceTexture: RenderTarget, destinationTexture: Texture, originSrc: { x: number; y: number }, size: { width: number; height: number }, originDest?: { x: number; y: number }): Texture` — Copies a render target into a texture source.
- `destroyGpuRenderTarget(_gpuRenderTarget: CanvasRenderTarget): void` — Destroys a GPU render target (no-op for canvas).
