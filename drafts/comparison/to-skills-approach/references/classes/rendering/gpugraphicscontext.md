# Classes

## rendering

### `GpuGraphicsContext`

A class that holds batchable graphics data for a GraphicsContext.

```ts
constructor(): GpuGraphicsContext
```

**Properties:**

- `isBatchable: boolean`
- `context: GraphicsContext`
- `batches: BatchableGraphics[]`
- `geometryData: GeometryData`
- `graphicsData: GraphicsContextRenderData`
  **Methods:**
- `reset(): void`
- `destroy(): void`
