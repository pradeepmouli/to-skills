# Classes

## maths

### `RoundedRectangle`

The `RoundedRectangle` object represents a rectangle with rounded corners.
Defined by position, dimensions and corner radius.
_implements `ShapePrimitive`_

```ts
constructor(x: number, y: number, width: number, height: number, radius: number): RoundedRectangle
```

**Properties:**

- `x: number` — The X coordinate of the upper-left corner of the rounded rectangle
- `y: number` — The Y coordinate of the upper-left corner of the rounded rectangle
- `width: number` — The overall width of this rounded rectangle
- `height: number` — The overall height of this rounded rectangle
- `radius: number` — Controls the radius of the rounded corners
- `type: SHAPE_PRIMITIVE` — The type of the object, mainly used to avoid `instanceof` checks
  **Methods:**
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the rounded rectangle as a Rectangle object
- `clone(): RoundedRectangle` — Creates a clone of this Rounded Rectangle.
- `copyFrom(rectangle: RoundedRectangle): this` — Copies another rectangle to this one.
- `copyTo(rectangle: RoundedRectangle): RoundedRectangle` — Copies this rectangle to another one.
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates given are contained within this Rounded Rectangle
- `strokeContains(pX: number, pY: number, strokeWidth: number, alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this rectangle including the stroke.
- `toString(): string` — Returns a string representation of an object.

```ts
// Basic rectangle creation
const rect = new RoundedRectangle(100, 100, 200, 150, 20);
// Use as container hit area
container.hitArea = new RoundedRectangle(0, 0, 100, 100, 10);
// Check point containment
const isInside = rect.contains(mouseX, mouseY);
// Get bounds
const bounds = rect.getBounds();
```
