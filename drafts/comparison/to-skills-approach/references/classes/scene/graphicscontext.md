# Classes

## scene

### `GraphicsContext`

The GraphicsContext class allows for the creation of lightweight objects that contain instructions for drawing shapes and paths.
It is used internally by the Graphics class to draw shapes and paths, and can be used directly and shared between Graphics objects,

This sharing of a `GraphicsContext` means that the intensive task of converting graphics instructions into GPU-ready geometry is done once, and the results are reused,
much like sprites reusing textures.
_extends `EventEmitter<{ update: GraphicsContext; destroy: GraphicsContext; unload: GraphicsContext }>`_
_implements `GCable`_

```ts
constructor(): GraphicsContext
```

**Properties:**

- `defaultFillStyle: ConvertedFillStyle` — The default fill style to use when none is provided.
- `defaultStrokeStyle: ConvertedStrokeStyle` — The default stroke style to use when none is provided.
- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `batchMode: BatchMode` — The batch mode for this graphics context. It can be 'auto', 'batch', or 'no-batch'.
- `customShader: Shader` (optional) — Custom shader to apply to the graphics when rendering.
- `destroyed: boolean` — Whether the graphics context has been destroyed.
  **Methods:**
- `clone(): GraphicsContext` — Creates a new GraphicsContext object that is a clone of this instance, copying all properties,
  including the current drawing state, transformations, styles, and instructions.
- `setFillStyle(style: FillInput): this` — Sets the current fill style of the graphics context. The fill style can be a color, gradient,
  pattern, or a more complex style defined by a FillStyle object.
- `setStrokeStyle(style: StrokeInput): this` — Sets the current stroke style of the graphics context. Similar to fill styles, stroke styles can
  encompass colors, gradients, patterns, or more detailed configurations via a StrokeStyle object.
- `texture(texture: Texture): this` — Adds a texture to the graphics context. This method supports multiple overloads for specifying the texture.
  If only a texture is provided, it uses the texture's width and height for drawing.
- `beginPath(): this` — Resets the current path. Any previous path and its commands are discarded and a new path is
  started. This is typically called before beginning a new shape or series of drawing commands.
- `fill(style?: FillInput): this` — Fills the current or given path with the current fill style. This method can optionally take
  a color and alpha for a simple fill, or a more complex FillInput object for advanced fills.
- `stroke(style?: StrokeInput): this` — Strokes the current path with the current stroke style. This method can take an optional
  FillInput parameter to define the stroke's appearance, including its color, width, and other properties.
- `cut(): this` — Applies a cutout to the last drawn shape. This is used to create holes or complex shapes by
  subtracting a path from the previously drawn path. If a hole is not completely in a shape, it will
  fail to cut correctly!
- `arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): this` — Adds an arc to the current path, which is centered at (x, y) with the specified radius,
  starting and ending angles, and direction.
- `arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this` — Adds an arc to the current path with the given control points and radius, connected to the previous point
  by a straight line if necessary.
- `arcToSvg(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this` — Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
- `bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number): this` — Adds a cubic Bezier curve to the path.
  It requires three points: the first two are control points and the third one is the end point.
  The starting point is the last point in the current path.
- `closePath(): this` — Closes the current path by drawing a straight line back to the start.
  If the shape is already closed or there are no points in the path, this method does nothing.
- `ellipse(x: number, y: number, radiusX: number, radiusY: number): this` — Draws an ellipse at the specified location and with the given x and y radii.
  An optional transformation can be applied, allowing for rotation, scaling, and translation.
- `circle(x: number, y: number, radius: number): this` — Draws a circle shape. This method adds a new circle path to the current drawing.
- `path(path: GraphicsPath): this` — Adds another `GraphicsPath` to this path, optionally applying a transformation.
- `lineTo(x: number, y: number): this` — Connects the current point to a new point with a straight line. This method updates the current path.
- `moveTo(x: number, y: number): this` — Sets the starting point for a new sub-path. Any subsequent drawing commands are considered part of this path.
- `quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, smoothness?: number): this` — Adds a quadratic curve to the path. It requires two points: the control point and the end point.
  The starting point is the last point in the current path.
- `rect(x: number, y: number, w: number, h: number): this` — Draws a rectangle shape. This method adds a new rectangle path to the current drawing.
- `roundRect(x: number, y: number, w: number, h: number, radius?: number): this` — Draws a rectangle with rounded corners.
  The corner radius can be specified to determine how rounded the corners should be.
  An optional transformation can be applied, which allows for rotation, scaling, and translation of the rectangle.
- `poly(points: number[] | PointData[], close?: boolean): this` — Draws a polygon shape by specifying a sequence of points. This method allows for the creation of complex polygons,
  which can be both open and closed. An optional transformation can be applied, enabling the polygon to be scaled,
  rotated, or translated as needed.
- `regularPoly(x: number, y: number, radius: number, sides: number, rotation: number, transform?: Matrix): this` — Draws a regular polygon with a specified number of sides. All sides and angles are equal.
- `roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation?: number): this` — Draws a polygon with rounded corners.
  Similar to `regularPoly` but with the ability to round the corners of the polygon.
- `roundShape(points: RoundedPoint[], radius: number, useQuadratic?: boolean, smoothness?: number): this` — Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
  Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
- `filletRect(x: number, y: number, width: number, height: number, fillet: number): this` — Draw Rectangle with fillet corners. This is much like rounded rectangle
  however it support negative numbers as well for the corner radius.
- `chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this` — Draw Rectangle with chamfer corners. These are angled corners.
- `star(x: number, y: number, points: number, radius: number, innerRadius: number, rotation: number): this` — Draws a star shape centered at a specified location. This method allows for the creation
  of stars with a variable number of points, outer radius, optional inner radius, and rotation.
  The star is drawn as a closed polygon with alternating outer and inner vertices to create the star's points.
  An optional transformation can be applied to scale, rotate, or translate the star as needed.
- `svg(svg: string): this` — Parses and renders an SVG string into the graphics context. This allows for complex shapes and paths
  defined in SVG format to be drawn within the graphics context.
- `restore(): this` — Restores the most recently saved graphics state by popping the top of the graphics state stack.
  This includes transformations, fill styles, and stroke styles.
- `save(): this` — Saves the current graphics state, including transformations, fill styles, and stroke styles, onto a stack.
- `getTransform(): Matrix` — Returns the current transformation matrix of the graphics context.
- `resetTransform(): this` — Resets the current transformation matrix to the identity matrix, effectively removing any transformations (rotation, scaling, translation) previously applied.
- `rotate(angle: number): this` — Applies a rotation transformation to the graphics context around the current origin.
- `scale(x: number, y: number): this` — Applies a scaling transformation to the graphics context, scaling drawings by x horizontally and by y vertically.
- `setTransform(transform: Matrix): this` — Sets the current transformation matrix of the graphics context to the specified matrix or values.
  This replaces the current transformation matrix.
- `transform(transform: Matrix): this` — Applies the specified transformation matrix to the current graphics context by multiplying
  the current matrix with the specified matrix.
- `translate(x: number, y: number): this` — Applies a translation transformation to the graphics context, moving the origin by the specified amounts.
- `clear(): this` — Clears all drawing commands from the graphics context, effectively resetting it. This includes clearing the path,
  and optionally resetting transformations to the identity matrix.
- `containsPoint(point: PointData): boolean` — Check to see if a point is contained within this geometry.
- `unload(): void` — Unloads the GPU data from the graphics context.
- `destroy(options: TypeOrBool<TextureDestroyOptions>): void` — Destroys the GraphicsData object.
