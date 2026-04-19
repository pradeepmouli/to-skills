# Classes

## rendering

### `TextureGCSystem`

System plugin to the renderer to manage texture garbage collection on the GPU,
ensuring that it does not get clogged up with textures that are no longer being used.
_implements `System<TextureGCSystemOptions>`_

```ts
constructor(renderer: Renderer): TextureGCSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "textureGC" }`
- `defaultOptions: TextureGCSystemOptions` — Default options for the TextureGCSystem
  **Methods:**
- `init(options: TextureGCSystemOptions): void`
- `run(): void` — Checks to see when the last time a texture was used.
  If the texture has not been used for a specified amount of time, it will be removed from the GPU.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
