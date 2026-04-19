# Classes

## maths

### `Polygon`

A class to define a shape via user defined coordinates.
Used for creating complex shapes and hit areas with custom points.
_implements `ShapePrimitive`_

```ts
constructor(points: number[] | PointData[]): Polygon
```

**Properties:**

- `points: number[]` — An array of the points of this polygon stored as a flat array of numbers.
- `closePath: boolean` — Indicates if the polygon path is closed.
- `type: SHAPE_PRIMITIVE` — The type of the object, mainly used to avoid `instanceof` checks
  **Methods:**
- `isClockwise(): boolean` — Determines whether the polygon's points are arranged in a clockwise direction.
  Uses the shoelace formula (surveyor's formula) to calculate the signed area.

A positive area indicates clockwise winding, while negative indicates counter-clockwise.

The formula sums up the cross products of adjacent vertices:
For each pair of adjacent points (x1,y1) and (x2,y2), we calculate (x1*y2 - x2*y1)
The final sum divided by 2 gives the signed area - positive for clockwise.

- `containsPolygon(polygon: Polygon): boolean` — Checks if this polygon completely contains another polygon.
  Used for detecting holes in shapes, like when parsing SVG paths.
- `clone(): Polygon` — Creates a clone of this polygon.
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates passed to this function are contained within this polygon.
  Uses raycasting algorithm for point-in-polygon testing.
- `strokeContains(x: number, y: number, strokeWidth: number, alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this polygon including the stroke.
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the polygon as a Rectangle object.
- `copyFrom(polygon: Polygon): this` — Copies another polygon to this one.
- `copyTo(polygon: Polygon): Polygon` — Copies this polygon to another one.
- `toString(): string` — Returns a string representation of an object.

```ts
// Create polygon from array of points
const polygon1 = new Polygon([new Point(0, 0), new Point(0, 100), new Point(100, 100)]);

// Create from array of coordinates
const polygon2 = new Polygon([0, 0, 0, 100, 100, 100]);

// Create from sequence of points
const polygon3 = new Polygon(new Point(0, 0), new Point(0, 100), new Point(100, 100));

// Create from sequence of coordinates
const polygon4 = new Polygon(0, 0, 0, 100, 100, 100);

// Use as container hit area
container.hitArea = new Polygon([0, 0, 100, 0, 50, 100]);
```
