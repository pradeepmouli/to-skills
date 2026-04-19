# Classes

## rendering

### `GpuTextureSystem`

The system that handles textures for the GPU.
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): GpuTextureSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "texture" }`
  **Methods:**
- `initSource(source: TextureSource): GPUTexture` — Initializes a texture source, if it has already been initialized nothing will happen.
- `getGpuSampler(sampler: TextureStyle): GPUSampler`
- `getGpuSource(source: TextureSource): GPUTexture`
- `getTextureBindGroup(texture: Texture): BindGroup` — this returns s bind group for a specific texture, the bind group contains
- the texture source
- the texture style
- the texture matrix
  This is cached so the bind group should only be created once per texture
- `getTextureView(texture: BindableTexture): GPUTextureView`
- `generateCanvas(texture: Texture): ICanvas`
- `getPixels(texture: Texture): GetPixelsOutput`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
