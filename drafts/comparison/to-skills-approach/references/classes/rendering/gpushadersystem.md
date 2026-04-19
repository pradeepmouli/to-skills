# Classes

## rendering

### `GpuShaderSystem`

A system that manages the rendering of GpuPrograms.

```ts
constructor(): GpuShaderSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "shader" }`
  **Methods:**
- `getProgramData(program: GpuProgram): GPUProgramData`
- `destroy(): void`
