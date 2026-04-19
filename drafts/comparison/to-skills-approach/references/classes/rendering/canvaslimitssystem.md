# Classes

## rendering

### `CanvasLimitsSystem`

Basic limits for CanvasRenderer.
_implements `System`_

```ts
constructor(): CanvasLimitsSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "limits" }`
- `maxTextures: number`
- `maxBatchableTextures: number`
- `maxUniformBindings: number`
  **Methods:**
- `init(): void`
