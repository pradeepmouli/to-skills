# Classes

## rendering

### `GlColorMaskSystem`

The system that handles color masking for the WebGL.
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlColorMaskSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "colorMask" }`
- `destroy: () => void` (optional) — Generic destroy methods to be overridden by the subclass
  **Methods:**
- `setMask(colorMask: number): void`
