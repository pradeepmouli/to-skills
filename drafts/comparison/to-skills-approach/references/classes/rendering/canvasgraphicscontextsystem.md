# Classes

## rendering

### `CanvasGraphicsContextSystem`

A system that manages the rendering of GraphicsContexts for Canvas2D.
_implements `System<GraphicsContextSystemOptions>`_

```ts
constructor(renderer: Renderer): CanvasGraphicsContextSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "graphicsContext" }`
- `defaultOptions: GraphicsContextSystemOptions` — The default options for the GraphicsContextSystem.
  **Methods:**
- `init(options?: GraphicsContextSystemOptions): void` — Runner init called, update the default options
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
