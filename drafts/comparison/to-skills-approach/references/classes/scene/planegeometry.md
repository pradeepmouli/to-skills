# Classes

## scene

### `PlaneGeometry`

The PlaneGeometry allows you to draw a 2d plane
_extends `MeshGeometry`_

```ts
constructor(options: PlaneGeometryOptions): PlaneGeometry
```

**Properties:**

- `defaultOptions: PlaneGeometryOptions & MeshGeometryOptions`
- `verticesX: number` — The number of vertices on x-axis
- `verticesY: number` — The number of vertices on y-axis
- `width: number` — The width of plane
- `height: number` — The height of plane
- `batchMode: BatchMode`
- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `topology: Topology` — The topology of the geometry.
- `uid: number` — The unique id of the geometry.
- `attributes: Record<string, Attribute>` — A record of the attributes of the geometry.
- `buffers: Buffer[]` — The buffers that the attributes use
- `indexBuffer: Buffer` — The index buffer of the geometry
- `instanceCount: number` — the instance count of the geometry to draw
  **Methods:**
- `build(options: PlaneGeometryOptions): void` — Refreshes plane coordinates
- `getAttribute(id: string): Attribute` — Returns the requested attribute.
- `getIndex(): Buffer` — Returns the index buffer
- `getBuffer(id: string): Buffer` — Returns the requested buffer.
- `getSize(): number` — Used to figure out how many vertices there are in this geometry
- `addAttribute(name: string, attributeOption: AttributeOption): void` — Adds an attribute to the geometry.
- `addIndex(indexBuffer: number[] | Buffer | TypedArray): void` — Adds an index buffer to the geometry.
- `unload(): void` — Unloads the geometry from the GPU.
- `destroy(destroyBuffers: boolean): void` — destroys the geometry.
