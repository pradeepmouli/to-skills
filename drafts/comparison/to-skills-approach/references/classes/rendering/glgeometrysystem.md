# Classes

## rendering

### `GlGeometrySystem`

System plugin to the renderer to manage geometry.
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlGeometrySystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "geometry" }`
- `hasVao: boolean` — `true` if we has `*_vertex_array_object` extension.
- `hasInstance: boolean` — `true` if has `ANGLE_instanced_arrays` extension.
  **Methods:**
- `bind(geometry?: Geometry, program?: GlProgram): void` — Binds geometry so that is can be drawn. Creating a Vao if required
- `resetState(): void` — Reset and unbind any active VAO and geometry.
- `updateBuffers(): void` — Update buffers of the currently bound geometry.
- `destroyAll(contextLost?: boolean): void` — Dispose all WebGL resources of all managed geometries.
- `draw(topology?: Topology, size?: number, start?: number, instanceCount?: number): this` — Draws the currently bound geometry.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
