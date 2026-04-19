# Classes

## events

### `FederatedWheelEvent`

A specialized event class for wheel/scroll interactions in PixiJS applications.
Extends FederatedMouseEvent to provide wheel-specific properties while
maintaining compatibility with the DOM WheelEvent interface.

Key features:

- Provides scroll delta information
- Supports different scroll modes (pixel, line, page)
- Inherits mouse event properties
- Normalizes cross-browser wheel events
  _extends `FederatedMouseEvent`_
  _implements `WheelEvent`_

```ts
constructor(manager: EventBoundary): FederatedWheelEvent
```

**Properties:**

- `DOM_DELTA_PIXEL: 0` — Units specified in pixels.
- `DOM_DELTA_LINE: 1` — Units specified in lines.
- `DOM_DELTA_PAGE: 2` — Units specified in pages.
- `deltaMode: number` — The units of `deltaX`, `deltaY`, and `deltaZ`. This is one of `DOM_DELTA_LINE`,
  `DOM_DELTA_PAGE`, `DOM_DELTA_PIXEL`.
- `deltaX: number` — Horizontal scroll amount
- `deltaY: number` — Vertical scroll amount
- `deltaZ: number` — z-axis scroll amount.
- `DOM_DELTA_PIXEL: 0` — Units specified in pixels.
- `DOM_DELTA_LINE: 1` — Units specified in lines.
- `DOM_DELTA_PAGE: 2` — Units specified in pages.
- `altKey: boolean` — Whether the "alt" key was pressed when this mouse event occurred.
- `button: number` — The specific button that was pressed in this mouse event.
- `buttons: number` — The button depressed when this event occurred.
- `ctrlKey: boolean` — Whether the "control" key was pressed when this mouse event occurred.
- `metaKey: boolean` — Whether the "meta" key was pressed when this mouse event occurred.
- `relatedTarget: EventTarget` — This is currently not implemented in the Federated Events API.
- `shiftKey: boolean` — Whether the "shift" key was pressed when this mouse event occurred.
- `client: Point` — The coordinates of the mouse event relative to the canvas.
- `detail: number` — This is the number of clicks that occurs in 200ms/click of each other.
- `movement: Point` — The movement in this pointer relative to the last `mousemove` event.
- `offset: Point` — The offset of the pointer coordinates w.r.t. target Container in world space. This is not supported at the moment.
- `global: Point` — The pointer coordinates in world space.
- `screen: Point` — The pointer coordinates in the renderer's AbstractRenderer.screen screen. This has slightly
  different semantics than native PointerEvent screenX/screenY.
- `bubbles: boolean` — Flags whether this event bubbles. This will take effect only if it is set before propagation.
- `cancelBubble: boolean`
- `cancelable: false` — Flags whether this event can be canceled using FederatedEvent.preventDefault. This is always
  false (for now).
- `composed: false` — Flag added for compatibility with DOM `Event`. It is not used in the Federated Events
  API.
- `currentTarget: Container` — The listeners of the event target that are being notified.
- `defaultPrevented: boolean` — Flags whether the default response of the user agent was prevent through this event.
- `eventPhase: number` — The propagation phase.
- `isTrusted: boolean` — Flags whether this is a user-trusted event
- `returnValue: boolean`
- `srcElement: EventTarget`
- `target: Container` — The event target that this will be dispatched to.
- `timeStamp: number` — The timestamp of when the event was created.
- `type: string` — The type of event, e.g. `"mouseup"`.
- `nativeEvent: MouseEvent | PointerEvent | PixiTouch` — The native event that caused the foremost original event.
- `originalEvent: FederatedEvent<MouseEvent | PointerEvent | PixiTouch>` — The original event that caused this event, if any.
- `propagationStopped: boolean` — Flags whether propagation was stopped.
- `propagationImmediatelyStopped: boolean` — Flags whether propagation was immediately stopped.
- `path: Container<ContainerChild>[]` — The composed path of the event's propagation. The `target` is at the end.
- `manager: EventBoundary` — The EventBoundary that manages this event. Null for root events.
- `view: Window` — The global Window object.
- `which: number` — Not supported.
- `layer: Point` — The coordinates of the event relative to the nearest DOM layer. This is a non-standard property.
- `page: Point` — The coordinates of the event relative to the DOM document. This is a non-standard property.
- `NONE: 0` — The event propagation phase NONE that indicates that the event is not in any phase.
- `CAPTURING_PHASE: 1` — The event propagation phase CAPTURING_PHASE that indicates that the event is in the capturing phase.
- `AT_TARGET: 2` — The event propagation phase AT_TARGET that indicates that the event is at the target.
- `BUBBLING_PHASE: 3` — The event propagation phase BUBBLING_PHASE that indicates that the event is in the bubbling phase.
  **Methods:**
- `getLocalPosition<P>(container: Container, point?: P, globalPos?: PointData): P` — Converts global coordinates into container-local coordinates.

This method transforms coordinates from world space to a container's local space,
useful for precise positioning and hit testing.

- `getModifierState(key: string): boolean` — Whether the modifier key was pressed when this event natively occurred.
- `initMouseEvent(_typeArg: string, _canBubbleArg: boolean, _cancelableArg: boolean, _viewArg: Window, _detailArg: number, _screenXArg: number, _screenYArg: number, _clientXArg: number, _clientYArg: number, _ctrlKeyArg: boolean, _altKeyArg: boolean, _shiftKeyArg: boolean, _metaKeyArg: boolean, _buttonArg: number, _relatedTargetArg: EventTarget): void` — Not supported.
- `composedPath(): Container<ContainerChild>[]` — The propagation path for this event. Alias for EventBoundary.propagationPath.
- `initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void` — Unimplemented method included for implementing the DOM interface `Event`. It will throw an `Error`.
- `initUIEvent(_typeArg: string, _bubblesArg?: boolean, _cancelableArg?: boolean, _viewArg?: Window, _detailArg?: number): void` — Unimplemented method included for implementing the DOM interface `UIEvent`. It will throw an `Error`.
- `preventDefault(): void` — Prevent default behavior of both PixiJS and the user agent.
- `stopImmediatePropagation(): void` — Stop this event from propagating to any additional listeners, including those
  on the current target and any following targets in the propagation path.
- `stopPropagation(): void` — Stop this event from propagating to the next target in the propagation path.
  The rest of the listeners on the current target will still be notified.

```ts
// Basic wheel event handling
sprite.on('wheel', (event: FederatedWheelEvent) => {
  // Get scroll amount
  console.log('Vertical scroll:', event.deltaY);
  console.log('Horizontal scroll:', event.deltaX);

  // Check scroll mode
  if (event.deltaMode === FederatedWheelEvent.DOM_DELTA_LINE) {
    console.log('Scrolling by lines');
  } else if (event.deltaMode === FederatedWheelEvent.DOM_DELTA_PAGE) {
    console.log('Scrolling by pages');
  } else {
    console.log('Scrolling by pixels');
  }

  // Get scroll position
  console.log('Scroll at:', event.global.x, event.global.y);
});

// Common use case: Zoom control
container.on('wheel', (event: FederatedWheelEvent) => {
  // Prevent page scrolling
  event.preventDefault();

  // Zoom in/out based on scroll direction
  const zoomFactor = 1 + event.deltaY / 1000;
  container.scale.set(container.scale.x * zoomFactor);
});
```
