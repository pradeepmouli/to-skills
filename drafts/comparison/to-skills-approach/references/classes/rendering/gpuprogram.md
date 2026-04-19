# Classes

## rendering

### `GpuProgram`

A wrapper for a WebGPU Program, specifically designed for the WebGPU renderer.
This class facilitates the creation and management of shader code that integrates with the WebGPU pipeline.

To leverage the full capabilities of this class, familiarity with WGSL shaders is recommended.

```ts
constructor(options: GpuProgramOptions): GpuProgram
```

**Properties:**

- `fragment: ProgramSource` (optional) — The fragment glsl shader source.
- `vertex: ProgramSource` (optional) — The vertex glsl shader source
- `layout: ProgramLayout` — Mapping of uniform names to group indexes for organizing shader program uniforms.
  Automatically generated from shader sources if not provided.
- `gpuLayout: ProgramPipelineLayoutDescription` — Configuration for the WebGPU bind group layouts, detailing resource organization for the shader.
  Generated from shader sources if not explicitly provided.
- `structsAndGroups: StructsAndGroups` — the structs and groups extracted from the shader sources
- `name: string` — the name of the program, this is added to the label of the GPU Program created under the hood.
  Makes it much easier to debug!
- `autoAssignGlobalUniforms: boolean` — if true, the program will automatically assign global uniforms to group[0]
- `autoAssignLocalUniforms: boolean` — if true, the program will automatically assign local uniforms to group[1]
  **Methods:**
- `from(options: GpuProgramOptions): GpuProgram` — Helper function that creates a program for a given source.
  It will check the program cache if the program has already been created.
  If it has that one will be returned, if not a new one will be created and cached.
- `destroy(): void` — destroys the program

```ts
// Create a new program
const program = new GpuProgram({
  vertex: {
   source: '...',
   entryPoint: 'main',
  },
  fragment:{
   source: '...',
   entryPoint: 'main',
  },
});


Note: Both fragment and vertex shader sources can coexist within a single WGSL source file
this can make things a bit simpler.

For optimal usage and best performance, it help to reuse programs whenever possible.
The {@link GpuProgram.from} helper function is designed for this purpose, utilizing an
internal cache to efficiently manage and retrieve program instances.
By leveraging this function, you can significantly reduce overhead and enhance the performance of your rendering pipeline.

An important distinction between WebGL and WebGPU regarding program data retrieval:
While WebGL allows extraction of program information directly from its compiled state,
WebGPU does not offer such a capability. Therefore, in the context of WebGPU, we're required
to manually extract the program layout information from the source code itself.
```
