# Classes

## maths

### `Circle`

The Circle object represents a circle shape in a two-dimensional coordinate system.
Used for drawing graphics and specifying hit areas for containers.
_implements `ShapePrimitive`_

```ts
constructor(x: number, y: number, radius: number): Circle
```

**Properties:**

- `x: number` — The X coordinate of the center of this circle
- `y: number` — The Y coordinate of the center of this circle
- `radius: number` — The radius of the circle
- `type: SHAPE_PRIMITIVE` — The type of the object, mainly used to avoid `instanceof` checks.
  **Methods:**
- `clone(): Circle` — Creates a clone of this Circle instance.
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates given are contained within this circle.

Uses the distance formula to determine if a point is inside the circle's radius.

Commonly used for hit testing in PixiJS events and graphics.

- `strokeContains(x: number, y: number, width: number, alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this circle including the stroke.
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the circle as a Rectangle object.
- `copyFrom(circle: Circle): this` — Copies another circle to this one.
- `copyTo(circle: Circle): Circle` — Copies this circle to another one.
- `toString(): string` — Returns a string representation of an object.

```ts
// Basic circle creation
const circle = new Circle(100, 100, 50);

// Use as hit area
container.hitArea = new Circle(0, 0, 100);

// Check point containment
const isInside = circle.contains(mouseX, mouseY);

// Get bounding box
const bounds = circle.getBounds();
```
