# Classes

## rendering

### `BatchGeometry`

This class represents a geometry used for batching in the rendering system.
It defines the structure of vertex attributes and index buffers for batched rendering.
_extends `Geometry`_

```ts
constructor(): BatchGeometry
```

**Properties:**

- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `topology: Topology` — The topology of the geometry.
- `uid: number` — The unique id of the geometry.
- `attributes: Record<string, Attribute>` — A record of the attributes of the geometry.
- `buffers: Buffer[]` — The buffers that the attributes use
- `indexBuffer: Buffer` — The index buffer of the geometry
- `instanceCount: number` — the instance count of the geometry to draw
  **Methods:**
- `getAttribute(id: string): Attribute` — Returns the requested attribute.
- `getIndex(): Buffer` — Returns the index buffer
- `getBuffer(id: string): Buffer` — Returns the requested buffer.
- `getSize(): number` — Used to figure out how many vertices there are in this geometry
- `addAttribute(name: string, attributeOption: AttributeOption): void` — Adds an attribute to the geometry.
- `addIndex(indexBuffer: number[] | Buffer | TypedArray): void` — Adds an index buffer to the geometry.
- `unload(): void` — Unloads the geometry from the GPU.
- `destroy(destroyBuffers: boolean): void` — destroys the geometry.
