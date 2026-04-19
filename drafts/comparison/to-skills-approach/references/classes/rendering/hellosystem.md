# Classes

## rendering

### `HelloSystem`

A simple system responsible for initiating the renderer.
_implements `System<HelloSystemOptions>`_

```ts
constructor(renderer: Renderer): HelloSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "hello"; priority: -2 }`
- `defaultOptions: HelloSystemOptions` — The default options for the system.
  **Methods:**
- `init(options: HelloSystemOptions): void` — It all starts here! This initiates every system, passing in the options for any system by name.
