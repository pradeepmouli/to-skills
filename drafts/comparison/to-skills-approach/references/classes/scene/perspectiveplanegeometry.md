# Classes

## scene

### `PerspectivePlaneGeometry`

A PerspectivePlaneGeometry allows you to draw a 2d plane with perspective. Where ever you move the corners
the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.

IMPORTANT: This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it :)

```js
const perspectivePlaneGeometry = new PerspectivePlaneGeometry({
  width: 100,
  height: 100,
  verticesX: 10,
  verticesY: 10
});
```

_extends `PlaneGeometry`_

```ts
constructor(options: PerspectivePlaneGeometryOptions): PerspectivePlaneGeometry
```

**Properties:**

- `defaultOptions: PlaneGeometryOptions & MeshGeometryOptions`
- `corners: [number, number, number, number, number, number, number, number]` — The corner points of the quad you can modify these directly, if you do make sure to call `updateProjection`
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
- `setCorners(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void` — Will set the corners of the quad to the given coordinates
  Calculating the perspective so it looks correct!
- `updateProjection(): void` — Update the projection matrix based on the corners
- `build(options: PlaneGeometryOptions): void` — Refreshes plane coordinates
- `getAttribute(id: string): Attribute` — Returns the requested attribute.
- `getIndex(): Buffer` — Returns the index buffer
- `getBuffer(id: string): Buffer` — Returns the requested buffer.
- `getSize(): number` — Used to figure out how many vertices there are in this geometry
- `addAttribute(name: string, attributeOption: AttributeOption): void` — Adds an attribute to the geometry.
- `addIndex(indexBuffer: number[] | Buffer | TypedArray): void` — Adds an index buffer to the geometry.
- `unload(): void` — Unloads the geometry from the GPU.
- `destroy(destroyBuffers: boolean): void` — destroys the geometry.
