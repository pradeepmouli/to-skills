# Classes

## scene

### `ShapePath`

The `ShapePath` class acts as a bridge between high-level drawing commands
and the lower-level `GraphicsContext` rendering engine.
It translates drawing commands, such as those for creating lines, arcs, ellipses, rectangles, and complex polygons, into a
format that can be efficiently processed by a `GraphicsContext`. This includes handling path starts,
ends, and transformations for shapes.

It is used internally by `GraphicsPath` to build up the path.

```ts
constructor(graphicsPath2D: GraphicsPath): ShapePath
```

**Properties:**

- `shapePrimitives: ShapePrimitiveWithHoles[]` — The list of shape primitives that make up the path.
- `signed: boolean`
  **Methods:**
- `moveTo(x: number, y: number): this` — Sets the starting point for a new sub-path. Any subsequent drawing commands are considered part of this path.
- `lineTo(x: number, y: number): this` — Connects the current point to a new point with a straight line. This method updates the current path.
- `arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this` — Adds an arc to the path. The arc is centered at (x, y)
  position with radius `radius` starting at `startAngle` and ending at `endAngle`.
- `arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this` — Adds an arc to the path with the arc tangent to the line joining two specified points.
  The arc radius is specified by `radius`.
- `arcToSvg(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this` — Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
- `bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number): this` — Adds a cubic Bezier curve to the path.
  It requires three points: the first two are control points and the third one is the end point.
  The starting point is the last point in the current path.
- `quadraticCurveTo(cp1x: number, cp1y: number, x: number, y: number, smoothing?: number): this` — Adds a quadratic curve to the path. It requires two points: the control point and the end point.
  The starting point is the last point in the current path.
- `closePath(): this` — Closes the current path by drawing a straight line back to the start.
  If the shape is already closed or there are no points in the path, this method does nothing.
- `addPath(path: GraphicsPath, transform?: Matrix): this` — Adds another path to the current path. This method allows for the combination of multiple paths into one.
- `finish(closePath: boolean): void` — Finalizes the drawing of the current path. Optionally, it can close the path.
- `rect(x: number, y: number, w: number, h: number, transform?: Matrix): this` — Draws a rectangle shape. This method adds a new rectangle path to the current drawing.
- `circle(x: number, y: number, radius: number, transform?: Matrix): this` — Draws a circle shape. This method adds a new circle path to the current drawing.
- `poly(points: number[] | PointData[], close?: boolean, transform?: Matrix): this` — Draws a polygon shape. This method allows for the creation of complex polygons by specifying a sequence of points.
- `regularPoly(x: number, y: number, radius: number, sides: number, rotation: number, transform?: Matrix): this` — Draws a regular polygon with a specified number of sides. All sides and angles are equal.
- `roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation: number, smoothness?: number): this` — Draws a polygon with rounded corners.
  Similar to `regularPoly` but with the ability to round the corners of the polygon.
- `roundShape(points: RoundedPoint[], radius: number, useQuadratic: boolean, smoothness?: number): this` — Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
  Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
- `filletRect(x: number, y: number, width: number, height: number, fillet: number): this` — Draw Rectangle with fillet corners. This is much like rounded rectangle
  however it support negative numbers as well for the corner radius.
- `chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this` — Draw Rectangle with chamfer corners. These are angled corners.
- `ellipse(x: number, y: number, radiusX: number, radiusY: number, transform?: Matrix): this` — Draws an ellipse at the specified location and with the given x and y radii.
  An optional transformation can be applied, allowing for rotation, scaling, and translation.
- `roundRect(x: number, y: number, w: number, h: number, radius?: number, transform?: Matrix): this` — Draws a rectangle with rounded corners.
  The corner radius can be specified to determine how rounded the corners should be.
  An optional transformation can be applied, which allows for rotation, scaling, and translation of the rectangle.
- `drawShape(shape: ShapePrimitive, matrix?: Matrix): this` — Draws a given shape on the canvas.
  This is a generic method that can draw any type of shape specified by the `ShapePrimitive` parameter.
  An optional transformation matrix can be applied to the shape, allowing for complex transformations.
- `startPoly(x: number, y: number): this` — Starts a new polygon path from the specified starting point.
  This method initializes a new polygon or ends the current one if it exists.
- `endPoly(closePath: boolean): this` — Ends the current polygon path. If `closePath` is set to true,
  the path is closed by connecting the last point to the first one.
  This method finalizes the current polygon and prepares it for drawing or adding to the shape primitives.
- `buildPath(): void` — Builds the path.
