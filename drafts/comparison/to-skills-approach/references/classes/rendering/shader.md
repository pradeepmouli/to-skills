# Classes

## rendering

### `Shader`

The Shader class is an integral part of the PixiJS graphics pipeline.
Central to rendering in PixiJS are two key elements: A [shader] and a [geometry].
The shader incorporates a GlProgram for WebGL or a GpuProgram for WebGPU,
instructing the respective technology on how to render the geometry.

The primary goal of the Shader class is to offer a unified interface compatible with both WebGL and WebGPU.
When constructing a shader, you need to provide both a WebGL program and a WebGPU program due to the distinctions
between the two rendering engines. If only one is provided, the shader won't function with the omitted renderer.

Both WebGL and WebGPU utilize the same resource object when passed into the shader.
Post-creation, the shader's interface remains consistent across both WebGL and WebGPU.
The sole distinction lies in whether a glProgram or a gpuProgram is employed.

Modifying shader uniforms, which can encompass:

- TextureSampler TextureStyle
- TextureSource TextureSource
- UniformsGroups UniformGroup
  _extends `EventEmitter<{ destroy: Shader }>`_

```ts
constructor(options: ShaderWithResources): Shader
```

**Properties:**

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
- `from(options: ShaderFromGroups): Shader` — A short hand function to create a shader based of a vertex and fragment shader.
- `addResource(name: string, groupIndex: number, bindIndex: number): void` — Sometimes a resource group will be provided later (for example global uniforms)
  In such cases, this method can be used to let the shader know about the group.
- `destroy(destroyPrograms: boolean): void` — Use to destroy the shader when its not longer needed.
  It will destroy the resources and remove listeners.

```ts
const shader = new Shader({
  glProgram: glProgram,
  gpuProgram: gpuProgram,
  resources: {
    uTexture: texture.source,
    uSampler: texture.sampler,
    uColor: [1, 0, 0, 1]
  }
});

// update the uniforms
shader.resources.uColor[1] = 1;
shader.resources.uTexture = texture2.source;
```
