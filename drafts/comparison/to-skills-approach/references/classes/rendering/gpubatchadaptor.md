# Classes

## rendering

### `GpuBatchAdaptor`

A BatcherAdaptor that uses the GPU to render batches.

```ts
constructor(): GpuBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGPUPipesAdaptor]; name: "batch" }`
  **Methods:**
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`
