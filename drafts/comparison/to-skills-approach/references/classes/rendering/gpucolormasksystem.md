# Classes

## rendering

### `GpuColorMaskSystem`

The system that handles color masking for the GPU.
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): GpuColorMaskSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "colorMask" }`
  **Methods:**
- `setMask(colorMask: number): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
