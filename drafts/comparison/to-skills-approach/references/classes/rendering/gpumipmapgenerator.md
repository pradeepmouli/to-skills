# Classes

## rendering

### `GpuMipmapGenerator`

A class which generates mipmaps for a GPUTexture.
Thanks to toji for the original implementation
https://github.com/toji/web-texture-tool/blob/main/src/webgpu-mipmap-generator.js

```ts
constructor(device: GPUDevice): GpuMipmapGenerator
```

**Properties:**

- `device: GPUDevice`
- `sampler: GPUSampler`
- `pipelines: Record<string, GPURenderPipeline>`
- `mipmapShaderModule: any`
  **Methods:**
- `generateMipmap(texture: GPUTexture): GPUTexture` — Generates mipmaps for the given GPUTexture from the data in level 0.
