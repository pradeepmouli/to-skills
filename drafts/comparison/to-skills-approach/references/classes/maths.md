# Classes

## maths

### `Matrix`

A fast matrix for 2D transformations.
Represents a 3x3 transformation matrix:

```js
| a  c  tx |
| b  d  ty |
| 0  0  1  |
```

```ts
constructor(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix
```

**Properties:**

- `a: number` — Scale on the x axis.
- `b: number` — Shear on the y axis.
- `c: number` — Shear on the x axis.
- `d: number` — Scale on the y axis.
- `tx: number` — Translation on the x axis.
- `ty: number` — Translation on the y axis.
- `array: Float32Array<ArrayBufferLike>` — Array representation of the matrix.
  Only populated when `toArray()` is called.
  **Methods:**
- `fromArray(array: number[]): void` — Creates a Matrix object based on the given array.
  Populates matrix components from a flat array in column-major order.

> [!NOTE] Array mapping order:
>
> ```
> array[0] = a  (x scale)
> array[1] = b  (y skew)
> array[2] = tx (x translation)
> array[3] = c  (x skew)
> array[4] = d  (y scale)
> array[5] = ty (y translation)
> ```

- `set(a: number, b: number, c: number, d: number, tx: number, ty: number): this` — Sets the matrix properties directly.
  All matrix components can be set in one call.
- `toArray(transpose?: boolean, out?: Float32Array): Float32Array` — Creates an array from the current Matrix object.

> [!NOTE] The array format is:
>
> ```
> Non-transposed:
> [a, c, tx,
> b, d, ty,
> 0, 0, 1]
>
> Transposed:
> [a, b, 0,
> c, d, 0,
> tx,ty,1]
> ```

- `apply<P>(pos: PointData, newPos?: P): P` — Get a new position with the current transformation applied.

Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)

- `applyInverse<P>(pos: PointData, newPos?: P): P` — Get a new position with the inverse of the current transformation applied.

Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)

- `translate(x: number, y: number): this` — Translates the matrix on the x and y axes.
  Adds to the position values while preserving scale, rotation and skew.
- `scale(x: number, y: number): this` — Applies a scale transformation to the matrix.
  Multiplies the scale values with existing matrix components.
- `rotate(angle: number): this` — Applies a rotation transformation to the matrix.

Rotates around the origin (0,0) by the given angle in radians.

- `append(matrix: Matrix): this` — Appends the given Matrix to this Matrix.
  Combines two matrices by multiplying them together: this = this \* matrix
- `appendFrom(a: Matrix, b: Matrix): this` — Appends two matrices and sets the result to this matrix.
  Performs matrix multiplication: this = A \* B
- `setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number): this` — Sets the matrix based on all the available properties.
  Combines position, scale, rotation, skew and pivot in a single operation.
- `prepend(matrix: Matrix): this` — Prepends the given Matrix to this Matrix.
  Combines two matrices by multiplying them together: this = matrix \* this
- `decompose(transform: TransformableObject): TransformableObject` — Decomposes the matrix into its individual transform components.
  Extracts position, scale, rotation and skew values from the matrix.
- `invert(): this` — Inverts this matrix.
  Creates the matrix that when multiplied with this matrix results in an identity matrix.
- `isIdentity(): boolean` — Checks if this matrix is an identity matrix.

An identity matrix has no transformations applied (default state).

- `identity(): this` — Resets this Matrix to an identity (default) matrix.
  Sets all components to their default values: scale=1, no skew, no translation.
- `clone(): Matrix` — Creates a new Matrix object with the same values as this one.
- `copyTo(matrix: Matrix): Matrix` — Creates a new Matrix object with the same values as this one.
- `copyFrom(matrix: Matrix): this` — Changes the values of the matrix to be the same as the ones in given matrix.
- `equals(matrix: Matrix): boolean` — Checks if this matrix equals another matrix.
  Compares all components for exact equality.
- `toString(): string`

```ts
// Create identity matrix
const matrix = new Matrix();

// Create matrix with custom values
const transform = new Matrix(2, 0, 0, 2, 100, 100); // Scale 2x, translate 100,100

// Transform a point
const point = { x: 10, y: 20 };
const transformed = transform.apply(point);

// Chain transformations
matrix
  .translate(100, 50)
  .rotate(Math.PI / 4)
  .scale(2, 2);
```

### `ObservablePoint`

The ObservablePoint object represents a location in a two-dimensional coordinate system.
Triggers a callback when its position changes.

The x and y properties represent the position on the horizontal and vertical axes, respectively.
_extends `ObservablePoint`_
_implements `PointLike`_

```ts
constructor(observer: Observer<ObservablePoint>, x?: number, y?: number): ObservablePoint
```

**Properties:**

- `_x: number`
- `_y: number`
  **Methods:**
- `clone(observer?: Observer<ObservablePoint>): ObservablePoint` — Creates a clone of this point.
- `set(x: number, y: number): this` — Sets the point to a new x and y position.

If y is omitted, both x and y will be set to x.

- `copyFrom(p: PointData): this` — Copies x and y from the given point into this point.
- `copyTo<T>(p: T): T` — Copies this point's x and y into the given point.
- `equals(p: PointData): boolean` — Checks if another point is equal to this point.

Compares x and y values using strict equality.

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
// Basic observable point usage
const point = new ObservablePoint(
  { _onUpdate: (p) => console.log(`Updated to (${p.x}, ${p.y})`) },
  100,
  100
);

// Update triggers callback
point.x = 200; // Logs: Updated to (200, 100)
point.y = 300; // Logs: Updated to (200, 300)

// Set both coordinates
point.set(50, 50); // Logs: Updated to (50, 50)
```

### `Point`

The Point object represents a location in a two-dimensional coordinate system, where `x` represents
the position on the horizontal axis and `y` represents the position on the vertical axis.

Many Pixi functions accept the `PointData` type as an alternative to `Point`,
which only requires `x` and `y` properties.
_extends `Point`_
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

<!-- truncated -->
