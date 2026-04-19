# Classes

## scene

### `Graphics`

The Graphics class is primarily used to render primitive shapes such as lines, circles and
rectangles to the display, and to color and fill them. It can also be used to create complex
masks and hit areas for interaction.
_extends `ViewContainer<GraphicsGpuData>`_
_implements `Instruction`_

```ts
constructor(options?: GraphicsContext | GraphicsOptions): Graphics
```

**Properties:**

- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `_updateFlags: number`
- `renderGroup: RenderGroup`
- `parentRenderGroup: RenderGroup`
- `parentRenderGroupIndex: number`
- `didChange: boolean`
- `didViewUpdate: boolean`
- `relativeRenderGroupDepth: number`
- `children: ContainerChild[]` — The array of children of this container. Each child must be a Container or extend from it.

The array is read-only, but its contents can be modified using Container methods.

- `parent: Container<ContainerChild>` — The display object container that contains this display object.
  This represents the parent-child relationship in the display tree.
- `includeInBuild: boolean`
- `measurable: boolean`
- `isSimple: boolean`
- `parentRenderLayer: RenderLayer` — The RenderLayer this container belongs to, if any.
  If it belongs to a RenderLayer, it will be rendered from the RenderLayer's position in the scene.
- `localTransform: Matrix` — Current transform of the object based on local factors: position, scale, other stuff.
  This matrix represents the local transformation without any parent influence.
- `relativeGroupTransform: Matrix` — The relative group transform is a transform relative to the render group it belongs too. It will include all parent
  transforms and up to the render group (think of it as kind of like a stage - but the stage can be nested).
  If this container is is self a render group matrix will be relative to its parent render group
- `groupTransform: Matrix` — The group transform is a transform relative to the render group it belongs too.
  If this container is render group then this will be an identity matrix. other wise it
  will be the same as the relativeGroupTransform.
  Use this value when actually rendering things to the screen
- `destroyed: boolean` — Whether this object has been destroyed. If true, the object should no longer be used.
  After an object is destroyed, all of its functionality is disabled and references are removed.
- `_origin: ObservablePoint` — The origin point around which the container rotates and scales.
  Unlike pivot, changing origin will not move the container's position.
- `boundsArea: Rectangle` — An optional bounds area for this container. Setting this rectangle will stop the renderer
  from recursively measuring the bounds of each children and instead use this single boundArea.

> [!IMPORTANT] This is great for optimisation! If for example you have a
> 1000 spinning particles and you know they all sit within a specific bounds,
> then setting it will mean the renderer will not need to measure the
> 1000 children to find the bounds. Instead it will just use the bounds you set.

- `_didContainerChangeTick: number` — A value that increments each time the containe is modified
  eg children added, removed etc
- `_didViewChangeTick: number` — A value that increments each time the container view is modified
  eg texture swap, geometry change etc
- `_accessibleActive: boolean` (optional)
- `_accessibleDiv: AccessibleHTMLElement` (optional)
- `_renderId: number` (optional)
- `accessible: boolean` (optional) — Flag for if the object is accessible. If true AccessibilityManager will overlay a
  shadow div with attributes set
- `accessibleTitle: string` (optional) — Sets the title attribute of the shadow div
  If accessibleTitle AND accessibleHint has not been this will default to 'container [tabIndex]'
- `accessibleHint: string` (optional) — Sets the aria-label attribute of the shadow div
- `tabIndex: number` (optional) — Sets the tabIndex of the shadow div. You can use this to set the order of the
  elements when using the tab key to navigate.
- `accessibleType: keyof HTMLElementTagNameMap` (optional) — Specify the type of div the accessible layer is. Screen readers treat the element differently
  depending on this type. Defaults to button.
- `accessiblePointerEvents: PointerEvents` (optional) — Specify the pointer-events the accessible div will use
  Defaults to auto.
- `accessibleText: string` (optional) — Sets the text content of the shadow
- `accessibleChildren: boolean` (optional) — Setting to false will prevent any children inside this container to
  be accessible. Defaults to true.
- `cullArea: Rectangle` (optional) — Custom shape used for culling calculations instead of object bounds.
  Defined in local space coordinates relative to the object.
  > [!NOTE]
  > Setting this to a custom Rectangle allows you to define a specific area for culling,
  > which can improve performance by avoiding expensive bounds calculations.
- `cullable: boolean` (optional) — Controls whether this object should be culled when out of view.
  When true, the object will not be rendered if its bounds are outside the visible area.
- `cullableChildren: boolean` (optional) — Controls whether children of this container can be culled.
  When false, skips recursive culling checks for better performance.
- `_internalEventMode: EventMode`
- `isInteractive: () => boolean` — Determines if the container is interactive or not
- `cursor: string & {} | Cursor` (optional) — The cursor style to display when the mouse pointer is hovering over the object.
  Accepts any valid CSS cursor value or custom cursor URL.
- `eventMode: EventMode` (optional) — Enable interaction events for the Container. Touch, pointer and mouse events are supported.
- `interactive: boolean` (optional) — Whether this object should fire UI events. This is an alias for `eventMode` set to `'static'` or `'passive'`.
  Setting this to true will enable interaction events like `pointerdown`, `click`, etc.
  Setting it to false will disable all interaction events on this object.
- `interactiveChildren: boolean` (optional) — Controls whether children of this container can receive pointer events.

Setting this to false allows PixiJS to skip hit testing on all children,
improving performance for containers with many non-interactive children.

- `hitArea: IHitArea` (optional) — Defines a custom hit area for pointer interaction testing. When set, this shape will be used
  for hit testing instead of the container's standard bounds.
- `onclick: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `click` event.
  Fired when a pointer device (mouse, touch, etc.) completes a click action.
- `onmousedown: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mousedown` event.
  Fired when a mouse button is pressed while the pointer is over the object.
- `onmouseenter: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseenter` event.
  Fired when the mouse pointer enters the bounds of the object. Does not bubble.
- `onmouseleave: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseleave` event.
  Fired when the pointer leaves the bounds of the display object. Does not bubble.
- `onmousemove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mousemove` event.
  Fired when the pointer moves while over the display object.
- `onglobalmousemove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `globalmousemove` event.

Fired when the mouse moves anywhere, regardless of whether the pointer is over this object.
The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.

- `onmouseout: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseout` event.
  Fired when the pointer moves out of the bounds of the display object.
- `onmouseover: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseover` event.
  Fired when the pointer moves onto the bounds of the display object.
- `onmouseup: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseup` event.
  Fired when a mouse button is released over the display object.
- `onmouseupoutside: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `mouseupoutside` event.
  Fired when a mouse button is released outside the display object that initially
  registered a mousedown.
- `onpointercancel: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointercancel` event.
  Fired when a pointer device interaction is canceled or lost.
- `onpointerdown: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerdown` event.
  Fired when a pointer device button (mouse, touch, pen, etc.) is pressed.
- `onpointerenter: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerenter` event.
  Fired when a pointer device enters the bounds of the display object. Does not bubble.
- `onpointerleave: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerleave` event.
  Fired when a pointer device leaves the bounds of the display object. Does not bubble.
- `onpointermove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointermove` event.
  Fired when a pointer device moves while over the display object.
- `onglobalpointermove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `globalpointermove` event.

Fired when the pointer moves anywhere, regardless of whether the pointer is over this object.
The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.

- `onpointerout: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerout` event.
  Fired when the pointer moves out of the bounds of the display object.
- `onpointerover: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerover` event.
  Fired when the pointer moves over the bounds of the display object.
- `onpointertap: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointertap` event.
  Fired when a pointer device completes a tap action (e.g., touch or mouse click).
- `onpointerup: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerup` event.
  Fired when a pointer device button (mouse, touch, pen, etc.) is released.
- `onpointerupoutside: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `pointerupoutside` event.
  Fired when a pointer device button is released outside the bounds of the display object
  that initially registered a pointerdown.
- `onrightclick: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `rightclick` event.
  Fired when a right-click (context menu) action is performed on the object.
- `onrightdown: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `rightdown` event.
  Fired when a right mouse button is pressed down over the display object.
- `onrightup: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `rightup` event.
  Fired when a right mouse button is released over the display object.
- `onrightupoutside: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `rightupoutside` event.
  Fired when a right mouse button is released outside the bounds of the display object
  that initially registered a rightdown.
- `ontap: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `tap` event.
  Fired when a tap action (touch) is completed on the object.
- `ontouchcancel: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `touchcancel` event.
  Fired when a touch interaction is canceled, such as when the touch is interrupted.
- `ontouchend: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `touchend` event.
  Fired when a touch interaction ends, such as when the finger is lifted from the screen.
- `ontouchendoutside: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `touchendoutside` event.
  Fired when a touch interaction ends outside the bounds of the display object
  that initially registered a touchstart.
- `ontouchmove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `touchmove` event.
  Fired when a touch interaction moves while over the display object.
- `onglobaltouchmove: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `globaltouchmove` event.

Fired when a touch interaction moves anywhere, regardless of whether the pointer is over this object.
The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.

- `ontouchstart: FederatedEventHandler<FederatedPointerEvent>` (optional) — Property-based event handler for the `touchstart` event.
  Fired when a touch interaction starts, such as when a finger touches the screen.
- `onwheel: FederatedEventHandler<FederatedWheelEvent>` (optional) — Property-based event handler for the `wheel` event.
  Fired when the mouse wheel is scrolled while over the display object.
- `_onRender: (renderer: Renderer) => void`
- `onRender: (renderer: Renderer) => void` — This callback is used when the container is rendered. It runs every frame during the render process,
  making it ideal for per-frame updates and animations.

> [!NOTE] In v7 many users used `updateTransform` for this, however the way v8 renders objects is different
> and "updateTransform" is no longer called every frame

- `_localBoundsCacheData: LocalBoundsCacheData`
- `_localBoundsCacheId: number`
- `_maskEffect: MaskEffect` (optional)
- `_maskOptions: MaskOptions` (optional)
- `_filterEffect: FilterEffect` (optional)
- `filterArea: Rectangle` (optional) — The area the filter is applied to. This is used as an optimization to define a specific region
  for filter effects instead of calculating the display object bounds each frame.

> [!NOTE]
> Setting this to a custom Rectangle allows you to define a specific area for filter effects,
> which can improve performance by avoiding expensive bounds calculations.

- `effects: Effect[]` (optional) — todo Needs docs
- `mask: Mask` — Sets a mask for the displayObject. A mask is an object that limits the visibility of an
  object to the shape of the mask applied to it.

> [!IMPORTANT] In PixiJS a regular mask must be a Graphics or a Sprite object.
> This allows for much faster masking in canvas as it uses shape clipping.
> A mask of an object must be in the subtree of its parent.
> Otherwise, `getLocalBounds` may calculate incorrect bounds, which makes the container's width and height wrong.

Sprite masks read the red channel by default. Use Container#setMask with `channel: 'alpha'`
to read the alpha channel instead. See MaskOptions#channel for details.

- `name: string` — The instance name of the object.
- `label: string` — The instance label of the object.
- `sortChildren: () => void` — Sorts children by zIndex value. Only sorts if container is marked as dirty.
- `zIndex: number` — The zIndex of the container.

Controls the rendering order of children within their parent container.

A higher value will mean it will be moved towards the front of the rendering order.

- `sortableChildren: boolean` — If set to true, the container will sort its children by `zIndex` value
  when the next render is called, or manually if `sortChildren()` is called.

This actually changes the order of elements in the array of children,
so it will affect the rendering order.

> [!NOTE] Also be aware of that this may not work nicely with the `addChildAt()` function,
> as the `zIndex` sorting may cause the child to automatically sorted to another position.

- `cacheAsTexture: (val: boolean | CacheAsTextureOptions) => void` — Caches this container as a texture. This allows the container to be rendered as a single texture,
  which can improve performance for complex static containers.
- `updateCacheTexture: () => void` — Updates the cached texture of this container. This will flag the container's cached texture
  to be redrawn on the next render.
- `cacheAsBitmap: boolean` — Legacy property for backwards compatibility with PixiJS v7 and below.
  Use `cacheAsTexture` instead.
- `isCachedAsTexture: boolean` — Whether this container is currently cached as a texture.
  **Methods:**
- `mixin(source: Dict<any>): void` — Mixes all enumerable properties and methods from a source object to Container.
- `containsPoint(point: PointData): boolean` — Checks if the object contains the given point.
  Returns true if the point lies within the Graphics object's rendered area.
- `destroy(options?: DestroyOptions): void` — Destroys this graphics renderable and optionally its context.
- `setFillStyle(args: [style: FillInput]): this` — Sets the current fill style of the graphics context.
  The fill style can be a color, gradient, pattern, or a complex style object.
- `setStrokeStyle(args: [style: StrokeInput]): this` — Sets the current stroke style of the graphics context.
  Similar to fill styles, stroke styles can encompass colors, gradients, patterns, or more detailed configurations.
- `fill(style?: FillInput): this` — Fills the current or given path with the current fill style or specified style.
- `stroke(args: [style?: StrokeInput]): this` — Strokes the current path with the current stroke style or specified style.
  Outlines the shape using the stroke settings.
- `texture(texture: Texture): this` — Adds a texture to the graphics context. This method supports multiple ways to draw textures
  including basic textures, tinted textures, and textures with custom dimensions.
- `beginPath(): this` — Resets the current path. Any previous path and its commands are discarded and a new path is
  started. This is typically called before beginning a new shape or series of drawing commands.
- `cut(): this` — Applies a cutout to the last drawn shape. This is used to create holes or complex shapes by
  subtracting a path from the previously drawn path.

If a hole is not completely in a shape, it will fail to cut correctly.

- `arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): this` — Adds an arc to the current path, which is centered at (x, y) with the specified radius,
  starting and ending angles, and direction.
- `arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this` — Adds an arc to the current path that connects two points using a radius.
  The arc is drawn between the current point and the specified end point,
  using the given control point to determine the curve of the arc.
- `arcToSvg(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this` — Adds an SVG-style arc to the path, allowing for elliptical arcs based on the SVG spec.
  This is particularly useful when converting SVG paths to Graphics or creating complex curved shapes.
- `bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, smoothness?: number): this` — Adds a cubic Bézier curve to the path, from the current point to the specified end point.
  The curve is influenced by two control points that define its shape and curvature.
- `closePath(): this` — Closes the current path by drawing a straight line back to the start point.

This is useful for completing shapes and ensuring they are properly closed for fills.

- `ellipse(x: number, y: number, radiusX: number, radiusY: number): this` — Draws an ellipse at the specified location and with the given x and y radii.
  An optional transformation can be applied, allowing for rotation, scaling, and translation.
- `circle(x: number, y: number, radius: number): this` — Draws a circle shape at the specified location with the given radius.
- `path(path: GraphicsPath): this` — Adds another `GraphicsPath` to this path, optionally applying a transformation.
  This allows for reuse of complex paths and shapes across different graphics instances.
- `lineTo(x: number, y: number): this` — Connects the current point to a new point with a straight line.
  Any subsequent drawing commands will start from this new point.
- `moveTo(x: number, y: number): this` — Sets the starting point for a new sub-path.

Moves the "pen" to a new location without drawing a line.
Any subsequent drawing commands will start from this point.

- `quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, smoothness?: number): this` — Adds a quadratic curve to the path. It requires two points: the control point and the end point.
  The starting point is the last point in the current path.
- `rect(x: number, y: number, w: number, h: number): this` — Draws a rectangle shape.

This method adds a new rectangle path to the current drawing.

- `roundRect(x: number, y: number, w: number, h: number, radius?: number): this` — Draws a rectangle with rounded corners. The corner radius can be specified to
  determine how rounded the corners should be.
- `poly(points: number[] | PointData[], close?: boolean): this` — Draws a polygon shape by specifying a sequence of points. This method allows for the creation of complex polygons,
  which can be both open and closed.

An optional transformation can be applied, enabling the polygon to be scaled,
rotated, or translated as needed.

- `regularPoly(x: number, y: number, radius: number, sides: number, rotation?: number, transform?: Matrix): this` — Draws a regular polygon with a specified number of sides. All sides and angles are equal,
  making shapes like triangles, squares, pentagons, etc.
- `roundPoly(x: number, y: number, radius: number, sides: number, corner: number, rotation?: number): this` — Draws a polygon with rounded corners.

Similar to `regularPoly` but with the ability to round the corners of the polygon.

- `roundShape(points: RoundedPoint[], radius: number, useQuadratic?: boolean, smoothness?: number): this` — Draws a shape with rounded corners. This function supports custom radius for each corner of the shape.
  Optionally, corners can be rounded using a quadratic curve instead of an arc, providing a different aesthetic.
- `filletRect(x: number, y: number, width: number, height: number, fillet: number): this` — Draws a rectangle with fillet corners. Unlike rounded rectangles, this supports negative corner
  radii which create external rounded corners rather than internal ones.
- `chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this` — Draws a rectangle with chamfered (angled) corners. Each corner is cut off at
  a 45-degree angle based on the chamfer size.
- `star(x: number, y: number, points: number, radius: number, innerRadius?: number, rotation?: number): this` — Draws a star shape centered at a specified location. This method allows for the creation
  of stars with a variable number of points, outer radius, optional inner radius, and rotation.

The star is drawn as a closed polygon with alternating outer and inner vertices to create the star's points.
An optional transformation can be applied to scale, rotate, or translate the star as needed.

- `svg(svg: string): this` — Parses and renders an SVG string into the graphics context. This allows for complex shapes
  and paths defined in SVG format to be drawn within the graphics context.
- `restore(): this` — Restores the most recently saved graphics state by popping the top of the graphics state stack.
  This includes transformations, fill styles, and stroke styles.
- `save(): this` — Saves the current graphics state onto a stack. The state includes:
- Current transformation matrix
- Current fill style
- Current stroke style
- `getTransform(): Matrix` — Returns the current transformation matrix of the graphics context.
  This matrix represents all accumulated transformations including translate, scale, and rotate.
- `resetTransform(): this` — Resets the current transformation matrix to the identity matrix, effectively removing
  any transformations (rotation, scaling, translation) previously applied.
- `rotateTransform(angle: number): this` — Applies a rotation transformation to the graphics context around the current origin.
  Positive angles rotate clockwise, while negative angles rotate counterclockwise.
- `scaleTransform(x: number, y?: number): this` — Applies a scaling transformation to the graphics context, scaling drawings by x horizontally
  and by y vertically relative to the current origin.
- `setTransform(transform: Matrix): this` — Sets the current transformation matrix of the graphics context.

This method can either
take a Matrix object or individual transform values to create a new transformation matrix.

- `transform(transform: Matrix): this` — Applies a transformation matrix to the current graphics context by multiplying
  the current matrix with the specified matrix. This allows for complex transformations
  combining multiple operations.
- `translateTransform(x: number, y?: number): this` — Applies a translation transformation to the graphics context, moving the origin by the specified amounts.
  This affects all subsequent drawing operations.
- `clear(): this` — Clears all drawing commands from the graphics context, effectively resetting it.
  This includes clearing the current path, fill style, stroke style, and transformations.

> [!NOTE] Graphics objects are not designed to be continuously cleared and redrawn.
> Instead, they are intended to be used for static or semi-static graphics that
> can be redrawn as needed. Frequent clearing and redrawing may lead to performance issues.

- `clone(deep: boolean): Graphics` — Creates a new Graphics object that copies the current graphics content.
  The clone can either share the same context (shallow clone) or have its own independent
  context (deep clone).
- `lineStyle(width?: number, color?: ColorSource, alpha?: number): this`
- `beginFill(color: ColorSource, alpha?: number): Graphics`
- `endFill(): Graphics`
- `drawCircle(args: [x: number, y: number, radius: number]): this`
- `drawEllipse(args: [x: number, y: number, radiusX: number, radiusY: number]): this`
- `drawPolygon(args: [points: number[] | PointData[], close?: boolean]): this`
- `drawRect(args: [x: number, y: number, w: number, h: number]): this`
- `drawRoundedRect(args: [x: number, y: number, w: number, h: number, radius?: number]): this`
- `drawStar(args: [x: number, y: number, points: number, radius: number, innerRadius: number, rotation: number]): this`
- `unload(): void` — Unloads the GPU data from the view.
- `addChild<U>(children: U): U[0]` — Adds one or more children to the container.
  The children will be rendered as part of this container's display list.
- `removeChild<U>(children: U): U[0]` — Removes one or more children from the container.
  When removing multiple children, events will be triggered for each child in sequence.
- `_onUpdate(point?: ObservablePoint): void`
- `enableRenderGroup(): void` — Calling this enables a render group for this container.
  This means it will be rendered as a separate set of instructions.
  The transform of the container will also be handled on the GPU rather than the CPU.
- `disableRenderGroup(): void` — This will disable the render group for this container.
- `_updateIsSimple(): void`
- `getSize(out?: Size): Size` — Retrieves the size of the container as a [Size]Size object.

This is faster than get the width and height separately.

- `setSize(value: number | Optional<Size, "height">, height?: number): void` — Sets the size of the container to the specified width and height.
  This is more efficient than setting width and height separately as it only recalculates bounds once.
- `updateTransform(opts: Partial<UpdateTransformOptions>): this` — Updates the transform properties of the container.
  Allows partial updates of transform properties for optimized manipulation.
- `setFromMatrix(matrix: Matrix): void` — Updates the local transform properties by decomposing the given matrix.
  Extracts position, scale, rotation, and skew from a transformation matrix.
- `updateLocalTransform(): void` — Updates the local transform.
- `addEventListener<K>(type: K, listener: (e: AllFederatedEventMap[K]) => any, options?: AddListenerOptions): void` — Unlike `on` or `addListener` which are methods from EventEmitter, `addEventListener`
  seeks to be compatible with the DOM's `addEventListener` with support for options.
- `removeEventListener<K>(type: K, listener: (e: AllFederatedEventMap[K]) => any, options?: RemoveListenerOptions): void` — Unlike `off` or `removeListener` which are methods from EventEmitter, `removeEventListener`
  seeks to be compatible with the DOM's `removeEventListener` with support for options.
- `dispatchEvent(e: FederatedEvent): boolean` — Dispatch the event on this Container using the event's EventBoundary.

The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.

- `removeChildren(beginIndex?: number, endIndex?: number): ContainerChild[]` — Removes all children from this container that are within the begin and end indexes.
- `removeChildAt<U>(index: number): U` — Removes a child from the specified index position.
- `getChildAt<U>(index: number): U` — Returns the child at the specified index.
- `setChildIndex(child: ContainerChild, index: number): void` — Changes the position of an existing child in the container.
- `getChildIndex(child: ContainerChild): number` — Returns the index position of a child Container instance.
- `addChildAt<U>(child: U, index: number): U` — Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown.
  If the child is already in this container, it will be moved to the specified index.

When moving a child within the **same** container, `childAdded` and `added` events are
**not** emitted because the parent-child relationship hasn't changed. Events only fire when
a child is added from a different parent (or from no parent).

- `swapChildren<U>(child: U, child2: U): void` — Swaps the position of 2 Containers within this container.
- `removeFromParent(): void` — Remove the Container from its parent Container. If the Container has no parent, do nothing.
- `reparentChild<U>(child: U): U[0]` — Reparent a child or multiple children to this container while preserving their world transform.
  This ensures that the visual position and rotation of the children remain the same even when changing parents.
- `reparentChildAt<U>(child: U, index: number): U` — Reparent the child to this container at the specified index while preserving its world transform.
  This ensures that the visual position and rotation of the child remain the same even when changing parents.
- `replaceChild<U, T>(oldChild: U, newChild: T): void` — Replace a child in the container with a new child. Copying the local transform from the old child to the new one.
- `getGlobalPosition(point?: Point, skipUpdate?: boolean): Point` — Returns the global position of the container, taking into account the container hierarchy.
- `toGlobal<P>(position: PointData, point?: P, skipUpdate?: boolean): P` — Calculates the global position of a point relative to this container.
  Takes into account the container hierarchy and transforms.

<!-- truncated -->
