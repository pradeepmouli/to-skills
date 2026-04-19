# Classes

## scene

### `GraphicsPath`

The `GraphicsPath` class is designed to represent a graphical path consisting of multiple drawing instructions.
This class serves as a collection of drawing commands that can be executed to render shapes and paths on a canvas or
similar graphical context. It supports high-level drawing operations like lines, arcs, curves, and more, enabling
complex graphic constructions with relative ease.

```ts
constructor(instructions?: string | PathInstruction[], signed: boolean): GraphicsPath
```

**Properties:**

- `instructions: PathInstruction[]`
- `uid: number` — unique id for this graphics path
- `checkForHoles: boolean` — Controls whether shapes in this path should be checked for holes using the non-zero fill rule.
  When true, any closed shape that is fully contained within another shape will become
  a hole in that shape during filling operations.

This follows SVG's non-zero fill rule where:

1. Shapes are analyzed to find containment relationships
2. If Shape B is fully contained within Shape A, Shape B becomes a hole in Shape A
3. Multiple nested holes are supported

Mainly used internally by the SVG parser to correctly handle holes in complex paths.
When false, all shapes are filled independently without checking for holes.
**Methods:**

- `addPath(path: GraphicsPath, transform?: Matrix): this` — Adds another `GraphicsPath` to this path, optionally applying a transformation.
- `arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): this` — Adds an arc to the path. The arc is centered at (x, y)
  position with radius `radius` starting at `startAngle` and ending at `endAngle`.
- `arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this` — Adds an arc to the path with the arc tangent to the line joining two specified points.
  The arc radius is specified by `radius`.
- `arcToSvg(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this` — Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
- `bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number): this` — Adds a cubic Bezier curve to the path.
  It requires three points: the first two are control points and the third one is the end point.
  The starting point is the last point in the current path.
- `bezierCurveToShort(cp2x: number, cp2y: number, x: number, y: number, smoothness?: number): this` — Adds a cubic Bezier curve to the path.
  It requires two points: the second control point and the end point. The first control point is assumed to be
  The starting point is the last point in the current path.
- `closePath(): this` — Closes the current path by drawing a straight line back to the start.
  If the shape is already closed or there are no points in the path, this method does nothing.
- `ellipse(x: number, y: number, radiusX: number, radiusY: number, matrix?: Matrix): this` — Draws an ellipse at the specified location and with the given x and y radii.
  An optional transformation can be applied, allowing for rotation, scaling, and translation.
- `lineTo(x: number, y: number): this` — Connects the current point to a new point with a straight line. This method updates the current path.
- `moveTo(x: number, y: number): this` — Sets the starting point for a new sub-path. Any subsequent drawing commands are considered part of this path.
- `quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, smoothness?: number): this` — Adds a quadratic curve to the path. It requires two points: the control point and the end point.
  The starting point is the last point in the current path.
- `quadraticCurveToShort(x: number, y: number, smoothness?: number): this` — Adds a quadratic curve to the path. It uses the previous point as the control point.
- `rect(x: number, y: number, w: number, h: number, transform?: Matrix): this` — Draws a rectangle shape. This method adds a new rectangle path to the current drawing.
- `circle(x: number, y: number, radius: number, transform?: Matrix): this` — Draws a circle shape. This method adds a new circle path to the current drawing.
- `roundRect(x: number, y: number, w: number, h: number, radius?: number, transform?: Matrix): this` — Draws a rectangle with rounded corners.
  The corner radius can be specified to determine how rounded the corners should be.
  An optional transformation can be applied, which allows for rotation, scaling, and translation of the rectangle.
- `poly(points: number[] | PointData[], close?: boolean, transform?: Matrix): this` — Draws a polygon shape by specifying a sequence of points. This method allows for the creation of complex polygons,
  which can be both open and closed. An optional transformation can be applied, enabling the polygon to be scaled,
  rotated, or translated as needed.
- `regularPoly(x: number, y: number, radius: number, sides: number, rotation?: number, transform?: Matrix): this` — Draws a regular polygon with a specified number of sides. All sides and angles are equal.
- `roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation?: number): this` — Draws a polygon with rounded corners.
  Similar to `regularPoly` but with the ability to round the corners of the polygon.
- `roundShape(points: RoundedPoint[], radius: number, useQuadratic?: boolean, smoothness?: number): this` — Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
  Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
- `filletRect(x: number, y: number, width: number, height: number, fillet: number): this` — Draw Rectangle with fillet corners. This is much like rounded rectangle
  however it support negative numbers as well for the corner radius.
- `chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this` — Draw Rectangle with chamfer corners. These are angled corners.
- `star(x: number, y: number, points: number, radius: number, innerRadius?: number, rotation?: number, transform?: Matrix): this` — Draws a star shape centered at a specified location. This method allows for the creation
  of stars with a variable number of points, outer radius, optional inner radius, and rotation.
  The star is drawn as a closed polygon with alternating outer and inner vertices to create the star's points.
  An optional transformation can be applied to scale, rotate, or translate the star as needed.
- `clone(deep: boolean): GraphicsPath` — Creates a copy of the current `GraphicsPath` instance. This method supports both shallow and deep cloning.
  A shallow clone copies the reference of the instructions array, while a deep clone creates a new array and
  copies each instruction individually, ensuring that modifications to the instructions of the cloned `GraphicsPath`
  do not affect the original `GraphicsPath` and vice versa.
- `clear(): this`
- `transform(matrix: Matrix): this` — Applies a transformation matrix to all drawing instructions within the `GraphicsPath`.
  This method enables the modification of the path's geometry according to the provided
  transformation matrix, which can include translations, rotations, scaling, and skewing.

Each drawing instruction in the path is updated to reflect the transformation,
ensuring the visual representation of the path is consistent with the applied matrix.

Note: The transformation is applied directly to the coordinates and control points of the drawing instructions,
not to the path as a whole. This means the transformation's effects are baked into the individual instructions,
allowing for fine-grained control over the path's appearance.

- `getLastPoint(out: Point): Point` — Retrieves the last point from the current drawing instructions in the `GraphicsPath`.
  This method is useful for operations that depend on the path's current endpoint,
  such as connecting subsequent shapes or paths. It supports various drawing instructions,
  ensuring the last point's position is accurately determined regardless of the path's complexity.

If the last instruction is a `closePath`, the method iterates backward through the instructions
until it finds an actionable instruction that defines a point (e.g., `moveTo`, `lineTo`,
`quadraticCurveTo`, etc.). For compound paths added via `addPath`, it recursively retrieves
the last point from the nested path.
