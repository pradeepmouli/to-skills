# Classes

## filters

### `Filter`

The Filter class is the base for all filter effects used in Pixi.js
As it extends a shader, it requires that a glProgram is parsed in to work with WebGL and a gpuProgram for WebGPU.
If you don't proved one, then the filter is skipped and just rendered as if it wasn't there for that renderer.

A filter can be applied to anything that extends Container in Pixi.js which also includes Sprites, Graphics etc.

Its worth noting Performance-wise filters can be pretty expensive if used too much in a single scene.
The following happens under the hood when a filter is applied:

.1. Break the current batch
<br>
.2. The target is measured using getGlobalBounds
(recursively go through all children and figure out how big the object is)
<br>
.3. Get the closest Po2 Textures from the texture pool
<br>
.4. Render the target to that texture
<br>
.5. Render that texture back to the main frame buffer as a quad using the filters program.
<br>
<br>
Some filters (such as blur) require multiple passes too which can result in an even bigger performance hit. So be careful!
Its not generally the complexity of the shader that is the bottle neck,
but all the framebuffer / shader switching that has to take place.
One filter applied to a container with many objects is MUCH faster than many filter applied to many objects.
_extends `Shader`_

```ts
constructor(options: FilterWithShader): Filter
```

**Properties:**

- `defaultOptions: FilterOptions` — The default filter settings
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
- `apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void` — Applies the filter
- `addResource(name: string, groupIndex: number, bindIndex: number): void` — Sometimes a resource group will be provided later (for example global uniforms)
  In such cases, this method can be used to let the shader know about the group.
- `destroy(destroyPrograms: boolean): void` — Use to destroy the shader when its not longer needed.
  It will destroy the resources and remove listeners.

```ts
import { Filter } from 'pixi.js';

const customFilter = new Filter({
  glProgram: new GlProgram({
    fragment,
    vertex
  }),
  resources: {
    timeUniforms: {
      uTime: { value: 0.0, type: 'f32' }
    }
  }
});

// Apply the filter
sprite.filters = [customFilter];

// Update uniform
app.ticker.add((ticker) => {
  filter.resources.timeUniforms.uniforms.uTime += 0.04 * ticker.deltaTime;
});
```
