# Classes

## rendering

### `GlMeshAdaptor`

A MeshAdaptor that uses the WebGL to render meshes.

```ts
constructor(): GlMeshAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGLPipesAdaptor]; name: "mesh" }`
  **Methods:**
- `init(): void`
- `execute(meshPipe: MeshPipe, mesh: Mesh): void`
- `destroy(): void`
