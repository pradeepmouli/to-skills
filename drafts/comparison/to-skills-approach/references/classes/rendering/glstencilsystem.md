# Classes

## rendering

### `GlStencilSystem`

This manages the stencil buffer. Used primarily for masking
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlStencilSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "stencil" }`
- `destroy: () => void` (optional) — Generic destroy methods to be overridden by the subclass
  **Methods:**
- `resetState(): void`
- `setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number): void`
