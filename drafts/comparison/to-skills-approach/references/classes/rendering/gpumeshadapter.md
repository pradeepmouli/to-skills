# Classes

## rendering

### `GpuMeshAdapter`

The WebGL adaptor for the mesh system. Allows the Mesh System to be used with the WebGl renderer

```ts
constructor(): GpuMeshAdapter
```

**Properties:**

- `extension: { type: readonly [WebGPUPipesAdaptor]; name: "mesh" }`
  **Methods:**
- `init(): void`
- `execute(meshPipe: MeshPipe, mesh: Mesh): void`
- `destroy(): void`
