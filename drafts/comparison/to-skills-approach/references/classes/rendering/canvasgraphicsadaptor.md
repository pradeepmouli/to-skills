# Classes

## rendering

### `CanvasGraphicsAdaptor`

A GraphicsAdaptor that uses Canvas2D to render graphics.

```ts
constructor(): CanvasGraphicsAdaptor
```

**Properties:**

- `extension: { type: readonly [CanvasPipesAdaptor]; name: "graphics" }`
- `shader: Shader`
  **Methods:**
- `contextChange(renderer: Renderer): void`
- `execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void`
- `destroy(): void`
