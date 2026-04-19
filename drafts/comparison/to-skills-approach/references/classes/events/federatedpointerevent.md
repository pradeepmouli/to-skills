# Classes

## events

### `FederatedPointerEvent`

A specialized event class for pointer interactions in PixiJS applications.
Extends FederatedMouseEvent to provide advanced pointer-specific features
while maintaining compatibility with the DOM PointerEvent interface.

Key features:

- Supports multi-touch interactions
- Provides pressure sensitivity
- Handles stylus input
- Tracks pointer dimensions
- Supports tilt detection
  _extends `FederatedMouseEvent`_
  _implements `PointerEvent`_

```ts
constructor(manager: EventBoundary): FederatedPointerEvent
```

**Properties:**

- `pointerId: number` — The unique identifier of the pointer.
- `width: number` — The width of the pointer's contact along the x-axis, measured in CSS pixels.
  radiusX of TouchEvents will be represented by this value.
- `altitudeAngle: number` — The angle in radians of a pointer or stylus measuring the vertical angle between
  the device's surface to the pointer or stylus.
  A stylus at 0 degrees would be directly parallel whereas at π/2 degrees it would be perpendicular.
- `azimuthAngle: number` — The angle in radians of a pointer or stylus measuring an arc from the X axis of the device to
  the pointer or stylus projected onto the screen's plane.
  A stylus at 0 degrees would be pointing to the "0 o'clock" whereas at π/2 degrees it would be pointing at "6 o'clock".
- `height: number` — The height of the pointer's contact along the y-axis, measured in CSS pixels.
  radiusY of TouchEvents will be represented by this value.
- `isPrimary: boolean` — Indicates whether or not the pointer device that created the event is the primary pointer.
- `pointerType: string` — The type of pointer that triggered the event.
- `pressure: number` — Pressure applied by the pointing device during the event.
  s
  A Touch's force property will be represented by this value.
- `tangentialPressure: number` — Barrel pressure on a stylus pointer.
- `tiltX: number` — The angle, in degrees, between the pointer device and the screen.
- `tiltY: number` — The angle, in degrees, between the pointer device and the screen.
- `twist: number` — Twist of a stylus pointer.
- `detail: number` — This is the number of clicks that occurs in 200ms/click of each other.
- `altKey: boolean` — Whether the "alt" key was pressed when this mouse event occurred.
- `button: number` — The specific button that was pressed in this mouse event.
- `buttons: number` — The button depressed when this event occurred.
- `ctrlKey: boolean` — Whether the "control" key was pressed when this mouse event occurred.
- `metaKey: boolean` — Whether the "meta" key was pressed when this mouse event occurred.
- `relatedTarget: EventTarget` — This is currently not implemented in the Federated Events API.
- `shiftKey: boolean` — Whether the "shift" key was pressed when this mouse event occurred.
- `client: Point` — The coordinates of the mouse event relative to the canvas.
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
- `getCoalescedEvents(): PointerEvent[]` — Only included for completeness for now
- `getPredictedEvents(): PointerEvent[]` — Only included for completeness for now
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
// Basic pointer event handling
sprite.on('pointerdown', (event: FederatedPointerEvent) => {
  // Access pointer information
  console.log('Pointer ID:', event.pointerId);
  console.log('Pointer Type:', event.pointerType);
  console.log('Is Primary:', event.isPrimary);

  // Get pressure and tilt data
  console.log('Pressure:', event.pressure);
  console.log('Tilt:', event.tiltX, event.tiltY);

  // Access contact geometry
  console.log('Size:', event.width, event.height);
});

// Handle stylus-specific features
sprite.on('pointermove', (event: FederatedPointerEvent) => {
  if (event.pointerType === 'pen') {
    // Handle stylus tilt
    const tiltAngle = Math.atan2(event.tiltY, event.tiltX);
    console.log('Tilt angle:', tiltAngle);

    // Use barrel button pressure
    console.log('Tangential pressure:', event.tangentialPressure);
  }
});
```
