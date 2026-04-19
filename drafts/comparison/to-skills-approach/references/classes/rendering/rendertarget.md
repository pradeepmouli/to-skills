# Classes

## rendering

### `RenderTarget`

A class that describes what the renderers are rendering to.
This can be as simple as a Texture, or as complex as a multi-texture, multi-sampled render target.
Support for stencil and depth buffers is also included.

If you need something more complex than a Texture to render to, you should use this class.
Under the hood, all textures you render to have a RenderTarget created on their behalf.

```ts
constructor(descriptor?: RenderTargetOptions): RenderTarget
```

**Properties:**

- `defaultOptions: RenderTargetOptions` — The default options for a render target
- `uid: number` — unique id for this render target
- `colorTextures: TextureSource<any>[]` — An array of textures that can be written to by the GPU - mostly this has one texture in Pixi, but you could
  write to multiple if required! (eg deferred lighting)
- `depthStencilTexture: TextureSource` — the stencil and depth buffer will right to this texture in WebGPU
- `stencil: boolean` — if true, will ensure a stencil buffer is added. For WebGPU, this will automatically create a depthStencilTexture
- `depth: boolean` — if true, will ensure a depth buffer is added. For WebGPU, this will automatically create a depthStencilTexture
- `dirtyId: number`
- `isRoot: boolean`
  **Methods:**
- `resize(width: number, height: number, resolution: number, skipColorTexture: boolean): void`
- `destroy(): void`
