# Classes

## rendering

### `Bounds`

A representation of an axis-aligned bounding box (AABB) used for efficient collision detection and culling.
Stores minimum and maximum coordinates to define a rectangular boundary.

```ts
constructor(minX: number, minY: number, maxX: number, maxY: number): Bounds
```

**Properties:**

- `minX: number` — The minimum X coordinate of the bounds.
  Represents the leftmost edge of the bounding box.
- `minY: number` — The minimum Y coordinate of the bounds.
  Represents the topmost edge of the bounding box.
- `maxX: number` — The maximum X coordinate of the bounds.
  Represents the rightmost edge of the bounding box.
- `maxY: number` — The maximum Y coordinate of the bounds.
  Represents the bottommost edge of the bounding box.
- `matrix: Matrix` — The transformation matrix applied to this bounds object.
  Used when calculating bounds with transforms.
  **Methods:**
- `isEmpty(): boolean` — Checks if bounds are empty, meaning either width or height is zero or negative.
  Empty bounds occur when min values exceed max values on either axis.
- `clear(): this` — Clears the bounds and resets all coordinates to their default values.
  Resets the transformation matrix back to identity.
- `set(x0: number, y0: number, x1: number, y1: number): void` — Sets the bounds directly using coordinate values.
  Provides a way to set all bounds values at once.
- `addFrame(x0: number, y0: number, x1: number, y1: number, matrix?: Matrix): void` — Adds a rectangular frame to the bounds, optionally transformed by a matrix.
  Updates the bounds to encompass the new frame coordinates.
- `addRect(rect: Rectangle, matrix?: Matrix): void` — Adds a rectangle to the bounds, optionally transformed by a matrix.
  Updates the bounds to encompass the given rectangle.
- `addBounds(bounds: BoundsData, matrix?: Matrix): void` — Adds another bounds object to this one, optionally transformed by a matrix.
  Expands the bounds to include the given bounds' area.
- `addBoundsMask(mask: Bounds): void` — Adds other Bounds as a mask, creating an intersection of the two bounds.
  Only keeps the overlapping region between current bounds and mask bounds.
- `applyMatrix(matrix: Matrix): void` — Applies a transformation matrix to the bounds, updating its coordinates.
  Transforms all corners of the bounds using the given matrix.
- `fit(rect: Rectangle): this` — Resizes the bounds object to fit within the given rectangle.
  Clips the bounds if they extend beyond the rectangle's edges.
- `fitBounds(left: number, right: number, top: number, bottom: number): this` — Resizes the bounds object to include the given bounds.
  Similar to fit() but works with raw coordinate values instead of a Rectangle.
- `pad(paddingX: number, paddingY: number): this` — Pads bounds object, making it grow in all directions.
  If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
- `ceil(): this` — Ceils the bounds by rounding up max values and rounding down min values.
  Useful for pixel-perfect calculations and avoiding fractional pixels.
- `clone(): Bounds` — Creates a new Bounds instance with the same values.
- `scale(x: number, y: number): this` — Scales the bounds by the given values, adjusting all edges proportionally.
- `addVertexData(vertexData: Float32Array, beginOffset: number, endOffset: number, matrix?: Matrix): void` — Adds vertices from a Float32Array to the bounds, optionally transformed by a matrix.
  Used for efficiently updating bounds from raw vertex data.
- `containsPoint(x: number, y: number): boolean` — Checks if a point is contained within the bounds.
  Returns true if the point's coordinates fall within the bounds' area.
- `toString(): string` — Returns a string representation of the bounds.
  Useful for debugging and logging bounds information.
- `copyFrom(bounds: Bounds): this` — Copies the bounds from another bounds object.
  Useful for reusing bounds objects and avoiding allocations.

```ts
// Create bounds
const bounds = new Bounds();

// Add a rectangular frame
bounds.addFrame(0, 0, 100, 100);
console.log(bounds.width, bounds.height); // 100, 100

// Transform bounds
const matrix = new Matrix().translate(50, 50).rotate(Math.PI / 4);
bounds.applyMatrix(matrix);

// Check point intersection
if (bounds.containsPoint(75, 75)) {
  console.log('Point is inside bounds!');
}
```
