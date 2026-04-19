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
