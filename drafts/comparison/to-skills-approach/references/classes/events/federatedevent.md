# Classes

## events

### `FederatedEvent`

A DOM-compatible synthetic event implementation for PixiJS's event system.
This class implements the standard DOM Event interface while providing additional
functionality specific to PixiJS events.

> [!NOTE] You wont receive an instance of this class directly, but rather a subclass
> of this class, such as FederatedPointerEvent, FederatedMouseEvent, or
> FederatedWheelEvent. This class is the base for all federated events.
> _implements `UIEvent`_

```ts
constructor<N>(manager: EventBoundary): FederatedEvent<N>
```

**Properties:**

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
- `nativeEvent: N` — The native event that caused the foremost original event.
- `originalEvent: FederatedEvent<N>` — The original event that caused this event, if any.
- `propagationStopped: boolean` — Flags whether propagation was stopped.
- `propagationImmediatelyStopped: boolean` — Flags whether propagation was immediately stopped.
- `path: Container<ContainerChild>[]` — The composed path of the event's propagation. The `target` is at the end.
- `manager: EventBoundary` — The EventBoundary that manages this event. Null for root events.
- `detail: number` — Event-specific detail
- `view: Window` — The global Window object.
- `which: number` — Not supported.
- `layer: Point` — The coordinates of the event relative to the nearest DOM layer. This is a non-standard property.
- `page: Point` — The coordinates of the event relative to the DOM document. This is a non-standard property.
- `NONE: 0` — The event propagation phase NONE that indicates that the event is not in any phase.
- `CAPTURING_PHASE: 1` — The event propagation phase CAPTURING_PHASE that indicates that the event is in the capturing phase.
- `AT_TARGET: 2` — The event propagation phase AT_TARGET that indicates that the event is at the target.
- `BUBBLING_PHASE: 3` — The event propagation phase BUBBLING_PHASE that indicates that the event is in the bubbling phase.
  **Methods:**
- `composedPath(): Container<ContainerChild>[]` — The propagation path for this event. Alias for EventBoundary.propagationPath.
- `initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void` — Unimplemented method included for implementing the DOM interface `Event`. It will throw an `Error`.
- `initUIEvent(_typeArg: string, _bubblesArg?: boolean, _cancelableArg?: boolean, _viewArg?: Window, _detailArg?: number): void` — Unimplemented method included for implementing the DOM interface `UIEvent`. It will throw an `Error`.
- `preventDefault(): void` — Prevent default behavior of both PixiJS and the user agent.
- `stopImmediatePropagation(): void` — Stop this event from propagating to any additional listeners, including those
  on the current target and any following targets in the propagation path.
- `stopPropagation(): void` — Stop this event from propagating to the next target in the propagation path.
  The rest of the listeners on the current target will still be notified.

```ts
// Basic event handling
sprite.on('pointerdown', (event: FederatedEvent) => {
  // Access standard DOM event properties
  console.log('Target:', event.target);
  console.log('Phase:', event.eventPhase);
  console.log('Type:', event.type);

  // Control propagation
  event.stopPropagation();
});
```
