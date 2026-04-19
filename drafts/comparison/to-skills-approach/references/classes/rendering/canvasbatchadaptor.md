# Classes

## rendering

### `CanvasBatchAdaptor`

A BatcherAdaptor that renders batches using Canvas2D.

```ts
constructor(): CanvasBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [CanvasPipesAdaptor]; name: "batch" }`
  **Methods:**
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`
