# Classes

## events

### `EventBoundary`

Event boundaries are "barriers" where events coming from an upstream scene are modified before downstream propagation.

## Root event boundary

The EventSystem#rootBoundary rootBoundary handles events coming from the &lt;canvas /&gt;.
EventSystem handles the normalization from native https://dom.spec.whatwg.org/#event Events
into FederatedEvent FederatedEvents. The rootBoundary then does the hit-testing and event dispatch
for the upstream normalized event.

## Additional event boundaries

An additional event boundary may be desired within an application's scene graph. For example, if a portion of the scene is
is flat with many children at one level - a spatial hash maybe needed to accelerate hit testing. In this scenario, the
container can be detached from the scene and glued using a custom event boundary.

```ts
import { Container } from 'pixi.js';
import { EventBoundary } from 'pixi.js';
import { SpatialHash } from 'pixi-spatial-hash';

class HashedHitTestingEventBoundary
{
    private spatialHash: SpatialHash;

    constructor(scene: Container, spatialHash: SpatialHash)
    {
        super(scene);
        this.spatialHash = spatialHash;
    }

    hitTestRecursive(...)
    {
        // TODO: If target === this.rootTarget, then use spatial hash to get a
        // list of possible children that match the given (x,y) coordinates.
    }
}

class VastScene extends Container
{
    protected eventBoundary: EventBoundary;
    protected scene: Container;
    protected spatialHash: SpatialHash;

    constructor()
    {
        this.scene = new Container();
        this.spatialHash = new SpatialHash();
        this.eventBoundary = new HashedHitTestingEventBoundary(this.scene, this.spatialHash);

        // Populate this.scene with a ton of children, while updating this.spatialHash
    }
}
```

```ts
constructor(rootTarget?: Container): EventBoundary
```

**Properties:**

- `rootTarget: Container` — The root event-target residing below the event boundary.
  All events are dispatched trickling down and bubbling up to this `rootTarget`.
- `dispatch: EventEmitter` — Emits events after they were dispatched into the scene graph.

This can be used for global events listening, regardless of the scene graph being used. It should
not be used by interactive libraries for normal use.

Special events that do not bubble all the way to the root target are not emitted from here,
e.g. pointerenter, pointerleave, click.

- `cursor: string & {} | Cursor` — The cursor preferred by the event targets underneath this boundary.
- `moveOnAll: boolean` — This flag would emit `pointermove`, `touchmove`, and `mousemove` events on all Containers.

The `moveOnAll` semantics mirror those of earlier versions of PixiJS. This was disabled in favor of
the Pointer Event API's approach.

- `enableGlobalMoveEvents: boolean` — Enables the global move events. `globalpointermove`, `globaltouchmove`, and `globalmousemove`
  **Methods:**
- `addEventMapping(type: string, fn: (e: FederatedEvent) => void): void` — Adds an event mapping for the event `type` handled by `fn`.

Event mappings can be used to implement additional or custom events. They take an event
coming from the upstream scene (or directly from the EventSystem) and dispatch new downstream events
generally trickling down and bubbling up to EventBoundary.rootTarget this.rootTarget.

To modify the semantics of existing events, the built-in mapping methods of EventBoundary should be overridden
instead.

- `dispatchEvent(e: FederatedEvent, type?: string): void` — Dispatches the given event
- `mapEvent(e: FederatedEvent): void` — Maps the given upstream event through the event boundary and propagates it downstream.
- `hitTest(x: number, y: number): Container` — Finds the Container that is the target of a event at the given coordinates.

The passed (x,y) coordinates are in the world space above this event boundary.

- `propagate(e: FederatedEvent, type?: string): void` — Propagate the passed event from from EventBoundary.rootTarget this.rootTarget to its
  target `e.target`.
- `all(e: FederatedEvent, type?: string | string[], targets: Container<ContainerChild>[]): void` — Emits the event `e` to all interactive containers. The event is propagated in the bubbling phase always.

This is used in the `globalpointermove` event.

- `propagationPath(target: Container): Container<ContainerChild>[]` — Finds the propagation path from EventBoundary.rootTarget rootTarget to the passed
  `target`. The last element in the path is `target`.

### `EventSystem`

The system for handling UI events in PixiJS applications. This class manages mouse, touch, and pointer events,
normalizing them into a consistent event model.
_implements `System<EventSystemOptions>`_

```ts
constructor(renderer: Renderer): EventSystem
```

**Properties:**

- `extension: ExtensionMetadata`
- `defaultEventFeatures: EventSystemFeatures` — The event features that are enabled by the EventSystem
- `rootBoundary: EventBoundary` — The EventBoundary for the stage.

The EventBoundary#rootTarget rootTarget of this root boundary is automatically set to
the last rendered object before any event processing is initiated. This means the main scene
needs to be rendered atleast once before UI events will start propagating.

The root boundary should only be changed during initialization. Otherwise, any state held by the
event boundary may be lost (like hovered & pressed Containers).

- `supportsTouchEvents: boolean` — Indicates whether the current device supports touch events according to the W3C Touch Events spec.
  This is used to determine the appropriate event handling strategy.
- `supportsPointerEvents: boolean` — Indicates whether the current device supports pointer events according to the W3C Pointer Events spec.
  Used to optimize event handling and provide more consistent cross-device interaction.
- `autoPreventDefault: boolean` — Controls whether default browser actions are automatically prevented on pointer events.
  When true, prevents default browser actions from occurring on pointer events.
- `cursorStyles: Record<string, string | ((mode: string) => void) | CSSStyleDeclaration>` — Dictionary of custom cursor styles that can be used across the application.
  Used to define how different cursor modes are handled when interacting with display objects.
- `domElement: HTMLElement` — The DOM element to which the root event listeners are bound. This is automatically set to
  the renderer's Renderer#view view.
- `resolution: number` — The resolution used to convert between the DOM client space into world space.
- `renderer: Renderer` — The renderer managing this EventSystem.
- `features: EventSystemFeatures` — The event features that are enabled by the EventSystem
  **Methods:**
- `init(options: EventSystemOptions): void` — Runner init called, view is available at this point.
- `resolutionChange(resolution: number): void` — Handle changing resolution.
- `destroy(): void` — Destroys all event listeners and detaches the renderer.
- `setCursor(mode: string): void` — Sets the current cursor mode, handling any callbacks or CSS style changes.
  The cursor can be a CSS cursor string, a custom callback function, or a key from the cursorStyles dictionary.
- `setTargetElement(element: HTMLElement): void` — Sets the EventSystem#domElement domElement and binds event listeners.
  This method manages the DOM event bindings for the event system, allowing you to
  change or remove the target element that receives input events.
  > [!IMPORTANT] This will default to the canvas element of the renderer, so you
  > should not need to call this unless you are using a custom element.
- `mapPositionToPoint(point: PointData, x: number, y: number): void` — Maps coordinates from DOM/screen space into PixiJS normalized coordinates.
  This takes into account the current scale, position, and resolution of the DOM element.

```ts
// Access event system through renderer
const eventSystem = app.renderer.events;

// Configure event features
eventSystem.features.globalMove = false; // Disable global move events
eventSystem.features.click = true; // Enable click events

// Set custom cursor styles
eventSystem.cursorStyles.default = 'pointer';
eventSystem.cursorStyles.grab = 'grab';

// Get current pointer position
const pointer = eventSystem.pointer;
console.log(pointer.global.x, pointer.global.y);
```

Features:

- Normalizes browser events into consistent format
- Supports mouse, touch, and pointer events
- Handles event delegation and bubbling
- Provides cursor management
- Configurable event features

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

### `FederatedMouseEvent`

A specialized event class for mouse interactions in PixiJS applications.
Extends FederatedEvent to provide mouse-specific properties and methods
while maintaining compatibility with the DOM MouseEvent interface.

Key features:

- Tracks mouse button states
- Provides modifier key states
- Supports coordinate systems (client, screen, global)
- Enables precise position tracking
  _extends `FederatedEvent<MouseEvent | PointerEvent | PixiTouch>`_
  _implements `MouseEvent`_

```ts
constructor(manager: EventBoundary): FederatedMouseEvent
```

**Properties:**

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

<!-- truncated -->
