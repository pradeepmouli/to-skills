# Classes

## rendering

### `GraphicsContextSystem`

A system that manages the rendering of GraphicsContexts.
_implements `System<GraphicsContextSystemOptions>`_

```ts
constructor(renderer: Renderer): GraphicsContextSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "graphicsContext" }`
- `defaultOptions: GraphicsContextSystemOptions` — The default options for the GraphicsContextSystem.
  **Methods:**
- `init(options?: GraphicsContextSystemOptions): void` — Runner init called, update the default options
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
