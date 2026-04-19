# Classes

## rendering

### `DefaultShader`

DefaultShader is a specialized shader class designed for batch rendering.
It extends the base Shader class and provides functionality for handling
color, texture batching, and pixel rounding in both WebGL and WebGPU contexts.

It is used by the default batcher
_extends `Shader`_

```ts
constructor(maxTextures: number): DefaultShader
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
