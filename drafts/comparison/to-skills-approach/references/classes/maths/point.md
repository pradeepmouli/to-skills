# Classes

## maths

### `Point`

The Point object represents a location in a two-dimensional coordinate system, where `x` represents
the position on the horizontal axis and `y` represents the position on the vertical axis.

Many Pixi functions accept the `PointData` type as an alternative to `Point`,
which only requires `x` and `y` properties.
_implements `PointLike`_

```ts
constructor(x?: number, y?: number): Point
```

**Properties:**

- `x: number` — Position of the point on the x axis
- `y: number` — Position of the point on the y axis
  **Methods:**
- `clone(): Point` — Creates a clone of this point, which is a new instance with the same `x` and `y` values.
- `copyFrom(p: PointData): this` — Copies x and y from the given point into this point.
- `copyTo<T>(p: T): T` — Copies this point's x and y into the given point.
- `equals(p: PointData): boolean` — Checks if another point is equal to this point.

Compares x and y values using strict equality.

- `set(x: number, y: number): this` — Sets the point to a new x and y position.

If y is omitted, both x and y will be set to x.

- `toString(): string` — Returns a string representation of an object.
- `add<T>(other: PointData, outPoint?: T): T` — Adds `other` to `this` point and outputs into `outPoint` or a new Point.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `subtract<T>(other: PointData, outPoint?: T): T` — Subtracts `other` from `this` point and outputs into `outPoint` or a new Point.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `multiply<T>(other: PointData, outPoint?: T): T` — Multiplies component-wise `other` and `this` points and outputs into `outPoint` or a new Point.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `multiplyScalar<T>(scalar: number, outPoint?: T): T` — Multiplies each component of `this` point with the number `scalar` and outputs into `outPoint` or a new Point.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `dot(other: PointData): number` — Computes the dot product of `other` with `this` point.
  The dot product is the sum of the products of the corresponding components of two vectors.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `cross(other: PointData): number` — Computes the cross product of `other` with `this` point.
  Returns the z-component of the 3D cross product, assuming z=0 for both vectors.
  > [!IMPORTANT] Only available with **pixi.js/math-extras**.
- `normalize<T>(outPoint?: T): T` — Computes a normalized version of `this` point.

A normalized vector is a vector of magnitude (length) 1

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `magnitude(): number` — Computes the magnitude (length) of this point as Euclidean distance from origin.

Defined as the square root of the sum of the squares of each component.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `magnitudeSquared(): number` — Computes the squared magnitude of this point.
  More efficient than magnitude() for length comparisons.

Defined as the sum of the squares of each component.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `project<T>(onto: PointData, outPoint?: T): T` — Computes vector projection of `this` on `onto`.
  Projects one vector onto another, creating a parallel vector with the length of the projection.

Imagine a light source, parallel to `onto`, above `this`.
The light would cast rays perpendicular to `onto`.
`this.project(onto)` is the shadow cast by `this` on the line defined by `onto` .

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `reflect<T>(normal: PointData, outPoint?: T): T` — Reflects `this` vector off of a plane orthogonal to `normal`.

Like a light ray bouncing off a mirror surface.
`this` vector is the light and `normal` is a vector perpendicular to the mirror.
`this.reflect(normal)` is the reflection of `this` on that mirror.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

- `rotate<T>(radians: number, outPoint?: T): T` — Rotates `this` vector.

Like a light ray bouncing off a mirror surface.
`this` vector is the light and `normal` is a vector perpendicular to the mirror.
`this.reflect(normal)` is the reflection of `this` on that mirror.

> [!IMPORTANT] Only available with **pixi.js/math-extras**.

```ts
// Basic point creation
const point = new Point(100, 200);

// Using with transformations
const matrix = new Matrix();
matrix.translate(50, 50).apply(point);

// Point arithmetic
const start = new Point(0, 0);
const end = new Point(100, 100);
const middle = new Point((start.x + end.x) / 2, (start.y + end.y) / 2);
```
