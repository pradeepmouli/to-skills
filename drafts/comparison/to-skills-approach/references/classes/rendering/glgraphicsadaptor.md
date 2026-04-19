# Classes

## rendering

### `GlGraphicsAdaptor`

A GraphicsAdaptor that uses WebGL to render graphics.

```ts
constructor(): GlGraphicsAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGLPipesAdaptor]; name: "graphics" }`
- `shader: Shader`
  **Methods:**
- `contextChange(renderer: Renderer): void`
- `execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void`
- `destroy(): void`
