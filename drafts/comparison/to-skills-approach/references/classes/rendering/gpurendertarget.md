# Classes

## rendering

### `GpuRenderTarget`

A class which holds the canvas contexts and textures for a render target.

```ts
constructor(): GpuRenderTarget
```

**Properties:**

- `contexts: GPUCanvasContext[]`
- `msaaTextures: TextureSource<any>[]`
- `msaa: boolean`
- `msaaSamples: number`
- `colorTargetCount: number`
- `width: number`
- `height: number`
- `descriptor: GPURenderPassDescriptor`
