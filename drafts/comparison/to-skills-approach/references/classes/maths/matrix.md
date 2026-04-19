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
