# Classes

## rendering

### `Geometry`

A Geometry is a low-level object that represents the structure of 2D shapes in terms of vertices and attributes.
It's a crucial component for rendering as it describes the shape and format of the data that will go through the shaders.
Essentially, a Geometry object holds the data you'd send to a GPU buffer.

A geometry is basically made of two components:
<br>
<b>Attributes</b>: These are essentially arrays that define properties of the vertices like position, color,
texture coordinates, etc. They map directly to attributes in your vertex shaders.
<br>
<b>Indices</b>: An optional array that describes how the vertices are connected.
If not provided, vertices will be interpreted in the sequence they're given.
_extends `EventEmitter<{ update: Geometry; destroy: Geometry; unload: Geometry }>`_
_implements `GPUDataOwner`, `GCable`_

```ts
constructor(options: GeometryDescriptor): Geometry
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

```ts
const geometry = new Geometry({
  attributes: {
    aPosition: [
      // add some positions
      0, 0, 0, 100, 100, 100, 100, 0
    ],
    aUv: [
      // add some uvs
      0, 0, 0, 1, 1, 1, 1, 0
    ]
  }
});
```
