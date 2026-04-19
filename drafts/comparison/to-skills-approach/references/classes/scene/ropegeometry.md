# Classes

## scene

### `RopeGeometry`

RopeGeometry allows you to draw a geometry across several points and then manipulate these points.
_extends `MeshGeometry`_

```ts
constructor(options: RopeGeometryOptions): RopeGeometry
```

**Properties:**

- `defaultOptions: RopeGeometryOptions & MeshGeometryOptions` — Default options for RopeGeometry constructor.
- `points: PointData[]` — An array of points that determine the rope.
- `textureScale: number` — Rope texture scale, if zero then the rope texture is stretched.
- `batchMode: BatchMode`
- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `topology: Topology` — The topology of the geometry.
- `uid: number` — The unique id of the geometry.
- `attributes: Record<string, Attribute>` — A record of the attributes of the geometry.
- `buffers: Buffer[]` — The buffers that the attributes use
- `indexBuffer: Buffer` — The index buffer of the geometry
- `instanceCount: number` — the instance count of the geometry to draw
  **Methods:**
- `updateVertices(): void` — refreshes vertices of Rope mesh
- `update(): void` — Refreshes Rope indices and uvs
- `getAttribute(id: string): Attribute` — Returns the requested attribute.
- `getIndex(): Buffer` — Returns the index buffer
- `getBuffer(id: string): Buffer` — Returns the requested buffer.
- `getSize(): number` — Used to figure out how many vertices there are in this geometry
- `addAttribute(name: string, attributeOption: AttributeOption): void` — Adds an attribute to the geometry.
- `addIndex(indexBuffer: number[] | Buffer | TypedArray): void` — Adds an index buffer to the geometry.
- `unload(): void` — Unloads the geometry from the GPU.
- `destroy(destroyBuffers: boolean): void` — destroys the geometry.

```ts
import { Point, RopeGeometry } from 'pixi.js';

for (let i = 0; i < 20; i++) {
  points.push(new Point(i * 50, 0));
}
const rope = new RopeGeometry(100, points);
```
