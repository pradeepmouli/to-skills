# Classes

## scene

### `MeshRope`

A specialized mesh that renders a texture along a path defined by points. Perfect for
creating snake-like animations, chains, ropes, and other flowing objects.
_extends `Mesh`_

```ts
constructor(options: MeshRopeOptions): MeshRope
```

**Properties:**

- `defaultOptions: Partial<MeshRopeOptions>` — Default options for creating a MeshRope instance. These values are used when specific
  options aren't provided in the constructor.
- `autoUpdate: boolean` — Controls whether the rope's vertices are automatically recalculated each frame based on
  its points. When true, the rope will update to follow point movements. When false,
  manual updates are required.
- `state: State`
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
- `destroy(options?: DestroyOptions): void` — Destroys this sprite renderable and optionally its texture.
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
- `toLocal<P>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P` — Calculates the local position of the container relative to another point.
  Converts coordinates from any coordinate space to this container's local coordinate space.
- `getLocalBounds(): Bounds` — Retrieves the local bounds of the container as a Bounds object.
  Uses cached values when possible for better performance.
- `getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds` — Calculates and returns the (world) bounds of the display object as a Rectangle.
  Takes into account transforms and child bounds.
- `_setWidth(width: number, localWidth: number): void`
- `_setHeight(height: number, localHeight: number): void`
- `_markStructureAsChanged(): void`
- `addEffect(effect: Effect): void` — todo Needs docs.
- `removeEffect(effect: Effect): void` — todo Needs docs.
- `setMask(options: Partial<MaskOptionsAndMask>): void` — Used to set mask and control mask options on a display object.
  Allows for more detailed control over masking behavior compared to the mask property.
- `getChildByName(label: string | RegExp, deep?: boolean): Container<ContainerChild>`
- `getChildByLabel(label: string | RegExp, deep?: boolean): Container<ContainerChild>` — Returns the first child in the container with the specified label.
  Recursive searches are done in a pre-order traversal.
- `getChildrenByLabel(label: string | RegExp, deep?: boolean, out?: Container<ContainerChild>[]): Container<ContainerChild>[]` — Returns all children in the container with the specified label.
  Recursive searches are done in a pre-order traversal.
- `getGlobalAlpha(skipUpdate?: boolean): number` — Returns the global (compound) alpha of the container within the scene.
- `getGlobalTransform(matrix?: Matrix, skipUpdate?: boolean): Matrix` — Returns the global transform matrix of the container within the scene.
- `getGlobalTint(skipUpdate?: boolean): number` — Returns the global (compound) tint color of the container within the scene.
- `getFastGlobalBounds(factorRenderLayers?: boolean, bounds?: Bounds): Bounds` — Computes an approximate global bounding box for the container and its children.
  This method is optimized for speed by using axis-aligned bounding boxes (AABBs),
  and uses the last render results from when it updated the transforms. This function does not update them.
  which may result in slightly larger bounds but never smaller than the actual bounds.

for accurate (but less performant) results use `container.getGlobalBounds`

- `_onTouch(now: number): void` — An optional callback for when an item is touched

```ts
// Create a snake with multiple segments
const points = [];
for (let i = 0; i < 20; i++) {
  points.push(new Point(i * 50, 0));
}

const snake = new MeshRope({
  texture: Texture.from('snake.png'),
  points,
  textureScale: 0.5
});

// Animate the snake
app.ticker.add((delta) => {
  const time = performance.now() / 1000;

  // Update points to create wave motion
  for (let i = 0; i < points.length; i++) {
    points[i].y = Math.sin(i * 0.5 + time) * 30;
    points[i].x = i * 50 + Math.cos(i * 0.3 + time) * 20;
  }
});

// Disable auto updates if manually updating
snake.autoUpdate = false;
```
