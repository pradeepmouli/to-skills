# Classes

## rendering

### `GpuBufferSystem`

System plugin to the renderer to manage buffers.
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): GpuBufferSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "buffer" }`
  **Methods:**
- `getGPUBuffer(buffer: Buffer): GPUBuffer`
- `updateBuffer(buffer: Buffer): GPUBuffer`
- `destroyAll(): void` — dispose all WebGL resources of all managed buffers
- `createGPUBuffer(buffer: Buffer): GPUBuffer`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
