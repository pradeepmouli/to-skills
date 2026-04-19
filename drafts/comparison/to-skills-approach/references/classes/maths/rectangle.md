# Classes

## maths

### `Rectangle`

The `Rectangle` object represents a rectangular area defined by its position and dimensions.
Used for hit testing, bounds calculation, and general geometric operations.
_implements `ShapePrimitive`_

```ts
constructor(x: string | number, y: string | number, width: string | number, height: string | number): Rectangle
```

**Properties:**

- `type: SHAPE_PRIMITIVE` — The type of the object, mainly used to avoid `instanceof` checks
- `x: number` — The X coordinate of the upper-left corner of the rectangle
- `y: number` — The Y coordinate of the upper-left corner of the rectangle
- `width: number` — The overall width of this rectangle
- `height: number` — The overall height of this rectangle
  **Methods:**
- `isEmpty(): boolean` — Determines whether the Rectangle is empty (has no area).
- `clone(): Rectangle` — Creates a clone of this Rectangle
- `copyFromBounds(bounds: Bounds): this` — Converts a Bounds object to a Rectangle object.
- `copyFrom(rectangle: Rectangle): Rectangle` — Copies another rectangle to this one.
- `copyTo(rectangle: Rectangle): Rectangle` — Copies this rectangle to another one.
- `contains(x: number, y: number): boolean` — Checks whether the x and y coordinates given are contained within this Rectangle
- `strokeContains(x: number, y: number, strokeWidth: number, alignment: number): boolean` — Checks whether the x and y coordinates given are contained within this rectangle including the stroke.
- `intersects(other: Rectangle, transform?: Matrix): boolean` — Determines whether the `other` Rectangle transformed by `transform` intersects with `this` Rectangle object.

Returns true only if the area of the intersection is greater than 0.
This means that rectangles sharing only a side are not considered intersecting.

- `pad(paddingX: number, paddingY: number): this` — Pads the rectangle making it grow in all directions.

If paddingY is omitted, both paddingX and paddingY will be set to paddingX.

- `fit(rectangle: Rectangle): this` — Fits this rectangle around the passed one.
- `ceil(resolution: number, eps: number): this` — Enlarges rectangle so that its corners lie on a grid defined by resolution.
- `scale(x: number, y: number): this` — Scales the rectangle's dimensions and position by the specified factors.
- `enlarge(rectangle: Rectangle): this` — Enlarges this rectangle to include the passed rectangle.
- `getBounds(out?: Rectangle): Rectangle` — Returns the framing rectangle of the rectangle as a Rectangle object
- `containsRect(other: Rectangle): boolean` — Determines whether another Rectangle is fully contained within this Rectangle.

Rectangles that occupy the same space are considered to be containing each other.

Rectangles without area (width or height equal to zero) can't contain anything,
not even other arealess rectangles.

- `set(x: number, y: number, width: number, height: number): this` — Sets the position and dimensions of the rectangle.
- `toString(): string` — Returns a string representation of an object.
- `equals(other: Rectangle): boolean` — Accepts `other` Rectangle and returns true if the given Rectangle is equal to `this` Rectangle.
  > [!IMPORTANT] Only available with **pixi.js/math-extras**.
- `intersection<T>(other: Rectangle, outRect?: T): T` — If the area of the intersection between the Rectangles `other` and `this` is not zero,
  returns the area of intersection as a Rectangle object. Otherwise, return an empty Rectangle
  with its properties set to zero.

Rectangles without area (width or height equal to zero) can't intersect or be intersected
and will always return an empty rectangle with its properties set to zero.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `union<T>(other: Rectangle, outRect?: T): T` — Adds `this` and `other` Rectangles together to create a new Rectangle object filling
  the horizontal and vertical space between the two rectangles.
  > [!IMPORTANT] Only available with **pixi.js/math-extras**.

```ts
// Basic rectangle creation
const rect = new Rectangle(100, 100, 200, 150);

// Use as container bounds
container.hitArea = new Rectangle(0, 0, 100, 100);

// Check point containment
const isInside = rect.contains(mouseX, mouseY);

// Manipulate dimensions
rect.width *= 2;
rect.height += 50;
```
