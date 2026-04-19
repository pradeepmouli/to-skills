# Classes

## rendering

### `BindGroupSystem`

This manages the WebGPU bind groups. this is how data is bound to a shader when rendering
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): BindGroupSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "bindGroup" }`
  **Methods:**
- `getBindGroup(bindGroup: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
