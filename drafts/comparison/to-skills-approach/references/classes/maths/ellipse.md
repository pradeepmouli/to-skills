# Classes

## maths

### `Ellipse`

The Ellipse object is used to help draw graphics and can also be used to specify a hit area for containers.
_implements `ShapePrimitive`_

```ts
constructor(x: number, y: number, halfWidth: number, halfHeight: number): Ellipse
```

**Properties:**

- `x: number` — The X coordinate of the center of this ellipse
- `y: number` — The Y coordinate of the center of this ellipse
- `halfWidth: number` — The half width of this ellipse
- `halfHeight: number` — The half height of this ellipse
- `type: "ellipse"` — The type of the object, mainly used to avoid `instanceof` checks
  **Methods:**
- `clone(): Ellipse` — Creates a clone of this Ellipse instance.
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates given are contained within this ellipse.
  Uses normalized coordinates and the ellipse equation to determine containment.
- `strokeContains(x: number, y: number, strokeWidth: number, alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this ellipse including stroke.
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the ellipse as a Rectangle object.
- `copyFrom(ellipse: Ellipse): this` — Copies another ellipse to this one.
- `copyTo(ellipse: Ellipse): Ellipse` — Copies this ellipse to another one.
- `toString(): string` — Returns a string representation of an object.

```ts
// Basic ellipse creation
const ellipse = new Ellipse(100, 100, 20, 10);

// Use as a hit area
container.hitArea = new Ellipse(0, 0, 50, 25);

// Check point containment
const isInside = ellipse.contains(mouseX, mouseY);

// Get bounding box
const bounds = ellipse.getBounds();
```
