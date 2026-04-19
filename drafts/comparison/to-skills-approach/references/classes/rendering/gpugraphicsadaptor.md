# Classes

## rendering

### `GpuGraphicsAdaptor`

A GraphicsAdaptor that uses the GPU to render graphics.

```ts
constructor(): GpuGraphicsAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGPUPipesAdaptor]; name: "graphics" }`
- `shader: Shader`
  **Methods:**
- `contextChange(renderer: Renderer): void`
- `execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void`
- `destroy(): void`
