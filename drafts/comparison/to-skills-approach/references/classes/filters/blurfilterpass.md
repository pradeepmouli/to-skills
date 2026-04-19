# Classes

## filters

### `BlurFilterPass`

The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
_extends `Filter`_

```ts
constructor(options: BlurFilterPassOptions): BlurFilterPass
```

**Properties:**

- `defaultOptions: Partial<BlurFilterPassOptions>` — Default blur filter pass options
- `horizontal: boolean` — Do pass along the x-axis (`true`) or y-axis (`false`).
- `passes: number` — The number of passes to run the filter.
- `strength: number` — The strength of the blur filter.
- `legacy: boolean` — Whether to use legacy blur pass behavior.
- `padding: number` — The padding of the filter. Some filters require extra space to breath such as a blur.
  Increasing this will add extra width and height to the bounds of the object that the
  filter is applied to.
- `antialias: FilterAntialias` — should the filter use antialiasing?
- `enabled: boolean` — If enabled is true the filter is applied, if false it will not.
- `resolution: number | "inherit"` — The resolution of the filter. Setting this to be lower will lower the quality but
  increase the performance of the filter.
- `blendRequired: boolean` — Whether or not this filter requires the previous render texture for blending.
- `clipToViewport: boolean` — Clip texture into viewport or not
- `uid: number` — A unique identifier for the shader
- `gpuProgram: GpuProgram` — An instance of the GPU program used by the WebGPU renderer
- `glProgram: GlProgram` — An instance of the GL program used by the WebGL renderer
- `compatibleRenderers: number` — A number that uses two bits on whether the shader is compatible with the WebGL renderer and/or the WebGPU renderer.
  0b00 - not compatible with either
  0b01 - compatible with WebGL
  0b10 - compatible with WebGPU
  This is automatically set based on if a GlProgram or GpuProgram is provided.
- `groups: Record<number, BindGroup>`
- `resources: Record<string, any>` — A record of the resources used by the shader.
  **Methods:**
- `from(options: FilterOptions & ShaderFromResources): Filter` — A short hand function to create a filter based of a vertex and fragment shader src.
- `apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void` — Applies the filter.
- `addResource(name: string, groupIndex: number, bindIndex: number): void` — Sometimes a resource group will be provided later (for example global uniforms)
  In such cases, this method can be used to let the shader know about the group.
- `destroy(destroyPrograms: boolean): void` — Use to destroy the shader when its not longer needed.
  It will destroy the resources and remove listeners.

```ts
import { BlurFilterPass } from 'pixi.js';

const filter = new BlurFilterPass({ horizontal: true, strength: 8 });
sprite.filters = filter;

// update blur
filter.blur = 16;
```
