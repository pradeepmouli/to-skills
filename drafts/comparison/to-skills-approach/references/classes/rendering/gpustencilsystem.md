# Classes

## rendering

### `GpuStencilSystem`

This manages the stencil buffer. Used primarily for masking
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): GpuStencilSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "stencil" }`
  **Methods:**
- `setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
