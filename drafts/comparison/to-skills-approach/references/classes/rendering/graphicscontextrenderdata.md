# Classes

## rendering

### `GraphicsContextRenderData`

A class that holds the render data for a GraphicsContext.

```ts
constructor(): GraphicsContextRenderData
```

**Properties:**

- `batcher: DefaultBatcher`
- `instructions: InstructionSet`
  **Methods:**
- `init(options: BatcherOptions): void`
- `destroy(): void`
