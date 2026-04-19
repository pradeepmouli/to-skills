# Classes

## rendering

### `GlBatchAdaptor`

A BatcherAdaptor that uses WebGL to render batches.

```ts
constructor(): GlBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGLPipesAdaptor]; name: "batch" }`
  **Methods:**
- `init(batcherPipe: BatcherPipe): void`
- `contextChange(): void`
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`
