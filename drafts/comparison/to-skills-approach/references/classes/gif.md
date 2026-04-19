# Classes

## gif

### `GifSource`

Resource provided to GifSprite instances. This is very similar to using a shared
Texture between Sprites. This source contains all the frames and animation needed
to support playback.

```ts
constructor(frames: GifFrame[]): GifSource
```

**Properties:**

- `width: number` — Width of the animation
- `height: number` — Height of the animation
- `duration: number` — The total time to play the animation in milliseconds
- `frames: GifFrame[]` — Animation frames
- `textures: Texture<CanvasSource>[]` — Textures
- `totalFrames: number` — Total number of frames in the animation
  **Methods:**
- `from(buffer: ArrayBuffer, options?: GifBufferOptions): GifSource` — Create an animated GIF animation from a GIF image's ArrayBuffer. The easiest way to get
  the buffer is to use Assets.
- `destroy(): void` — Destroy animation data and don't use after this

### `GifSprite`

Runtime object for playing animated GIFs with advanced playback control.

Features:

- Play, pause, and seek controls
- Adjustable animation speed
- Loop control
- Frame change callbacks
- Auto-updating via shared ticker

This class extends Sprite and provides similar functionality to AnimatedSprite,
but specifically optimized for GIF playback.
_extends `Sprite`_

```ts
constructor(source: GifSource): GifSprite
```

**Properties:**

- `defaultOptions: Omit<GifSpriteOptions, "source">` — Default configuration options for GifSprite instances.

These values are used when specific options are not provided to the constructor.
Each property can be overridden by passing it in the options object.

- `animationSpeed: number` — Animation playback speed multiplier.
  Higher values speed up the animation, lower values slow it down.
- `loop: boolean` — Whether to loop the animation.
  If `false`, the animation will stop after the last frame.
- `onComplete: () => void` (optional) — Callback when non-looping animation completes.
  This is only called if `loop` is set to `false`.
  If `loop` is `true`, use GifSprite.onLoop instead.
- `onFrameChange: (currentFrame: number) => void` (optional) — Callback when animation frame changes.
  This is called every time the current frame changes,
  allowing you to respond to frame changes in real-time.
- `onLoop: () => void` (optional) — Callback when looping animation completes a loop.
  If `loop` is `false`, this will not be called.
- `duration: number` — The total duration of animation in milliseconds.
  This represents the length of one complete animation cycle.
- `autoPlay: boolean` — Whether to start playing right away when created.
  If `false`, you must call GifSprite.play to start playback.
- `dirty: boolean` — Dirty means the image needs to be redrawn. Set to `true` to force redraw.
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

<!-- truncated -->
