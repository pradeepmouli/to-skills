# Classes

## rendering

### `GlobalUniformSystem`

System plugin to the renderer to manage global uniforms for the renderer.
_implements `System`_

```ts
constructor(renderer: GlobalUniformRenderer): GlobalUniformSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "globalUniforms" }`
  **Methods:**
- `reset(): void`
- `start(options: GlobalUniformOptions): void`
- `bind(__namedParameters: GlobalUniformOptions): void`
- `push(options: GlobalUniformOptions): void`
- `pop(): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
