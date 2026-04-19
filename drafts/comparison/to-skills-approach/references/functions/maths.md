# Functions

## maths

### `floatEqual`

The idea of a relative epsilon comparison is to find the difference between the two numbers,
and see if it is less than a given epsilon.
A good epsilon would be the N% of the largest of the two values or `Math.EPSILON`.

_Note: Only available with **pixi.js/math-extras**._

Use a custom epsilon when comparing numbers that have accumulated floating-point rounding errors
across several arithmetic operations — `Number.EPSILON` may be too tight in those cases.

```ts
floatEqual(a: number, b: number, epsilon: number): boolean
```

**Parameters:**

- `a: number` — First floating number to compare.
- `b: number` — Second floating number to compare.
- `epsilon: number` — default: `Number.EPSILON` — The epsilon to compare to.
  The larger the epsilon, the easier for the numbers to be considered equals.
  **Returns:** `boolean` — Returns `true` if the difference between the values is less than the given epsilon;
  otherwise `false`.

```ts
floatEqual(0.1 + 0.2, 0.3); // true (within Number.EPSILON)
floatEqual(1.0, 1.001, 0.01); // true (within custom epsilon)
floatEqual(1.0, 2.0); // false
```

### `lineIntersection`

Computes the point where non-coincident and non-parallel Lines intersect.
Coincident or parallel lines return a `NaN` point `{x: NaN, y: NaN}`.
The intersection point may land outside the extents of the lines.

_Note: Only available with **pixi.js/math-extras**._

Unlike `segmentIntersection`, this function extends lines infinitely in both directions,
so the intersection point may lie well outside the two defining point pairs.
Check for `NaN` in the result to detect parallel/coincident lines.

```ts
lineIntersection<T>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint?: T): T
```

**Parameters:**

- `aStart: PointData` — First point of the first line.
- `aEnd: PointData` — Second point of the first line.
- `bStart: PointData` — First point of the second line.
- `bEnd: PointData` — Second point of the second line.
- `outPoint: T` (optional) — A Point-like object in which to store the value,
  optional (otherwise will create a new Point).
  **Returns:** `T` — The point where the lines intersect or a `NaN` Point.

```ts
const p = lineIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
// p.x === 5, p.y === 5
```

### `segmentIntersection`

Computes the point where non-coincident and non-parallel segments intersect.
Coincident, parallel or non-intersecting segments return a `NaN` point `{x: NaN, y: NaN}`.
The intersection point must land inside the extents of the segments or return a `NaN` Point.

_Note: Only available with **pixi.js/math-extras**._

Returns `NaN` if the intersection falls outside either segment's extent — this is the key difference
from `lineIntersection`, which extends lines infinitely. Always check `isNaN(p.x)` before using
the returned point.

```ts
segmentIntersection<T>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint?: T): T
```

**Parameters:**

- `aStart: PointData` — Starting point of the first segment.
- `aEnd: PointData` — Ending point of the first segment.
- `bStart: PointData` — Starting point of the second segment.
- `bEnd: PointData` — Ending point of the second segment.
- `outPoint: T` (optional) — A Point-like object in which to store the value,
  optional (otherwise will create a new Point).
  **Returns:** `T` — The point where the segments intersect or a `NaN` Point.

```ts
const p = segmentIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
// p.x === 5, p.y === 5
```

### `nextPow2`

Rounds to next power of two.

```ts
nextPow2(v: number): number
```

**Parameters:**

- `v: number` — input value
  **Returns:** `number` — - next rounded power of two

```ts
nextPow2(3); // 4
nextPow2(5); // 8
nextPow2(16); // 16
```

### `isPow2`

Checks if a number is a power of two.

```ts
isPow2(v: number): boolean
```

**Parameters:**

- `v: number` — input value
  **Returns:** `boolean` — `true` if value is power of two

```ts
isPow2(4); // true
isPow2(5); // false
isPow2(0); // false
```

### `log2`

Computes ceil of log base 2

```ts
log2(v: number): number
```

**Parameters:**

- `v: number` — input value
  **Returns:** `number` — logarithm base 2

```ts
log2(1); // 0
log2(2); // 1
log2(256); // 8
```
