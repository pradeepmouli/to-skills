# Classes

## maths

### `Triangle`

A class to define a shape of a triangle via user defined coordinates.

Used for creating triangular shapes and hit areas with three points (x,y), (x2,y2), (x3,y3).
Points are stored in counter-clockwise order.
_implements `ShapePrimitive`_

```ts
constructor(x: number, y: number, x2: number, y2: number, x3: number, y3: number): Triangle
```

**Properties:**

- `type: SHAPE_PRIMITIVE` — The type of the object, mainly used to avoid `instanceof` checks
- `x: number` — The X coordinate of the first point of the triangle.
- `y: number` — The Y coordinate of the first point of the triangle.
- `x2: number` — The X coordinate of the second point of the triangle.
- `y2: number` — The Y coordinate of the second point of the triangle.
- `x3: number` — The X coordinate of the third point of the triangle.
- `y3: number` — The Y coordinate of the third point of the triangle.
  **Methods:**
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates given are contained within this triangle
- `strokeContains(pointX: number, pointY: number, strokeWidth: number, _alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this triangle including the stroke.
- `clone(): Triangle` — Creates a clone of this Triangle
- `copyFrom(triangle: Triangle): this` — Copies another triangle to this one.
- `copyTo(triangle: Triangle): Triangle` — Copies this triangle to another one.
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the triangle as a Rectangle object

```ts
// Basic triangle creation
const triangle = new Triangle(0, 0, 100, 0, 50, 50);
// Use as hit area
container.hitArea = new Triangle(0, 0, 100, 0, 50, 100);
// Check point containment
const isInside = triangle.contains(mouseX, mouseY);
// Get bounding box
const bounds = triangle.getBounds();
```
