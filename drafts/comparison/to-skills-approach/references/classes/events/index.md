# events

| Class                             | Description                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [EventBoundary](eventboundary.md) | Event boundaries are "barriers" where events coming from an upstream scene are modified before downstream propagation. |

## Root event boundary

The EventSystem#rootBoundary rootBoundary handles events coming from the &lt;canvas /&gt;.
EventSystem handles the normalization from native https://dom.spec.whatwg.org/#event Events
into FederatedEvent FederatedEvents. The rootBoundary then does the hit-testing and event dispatch
for the upstream normalized event.

## Additional event boundaries

An additional event boundary may be desired within an application's scene graph. For example, if a portion of the scene is
is flat with many children at one level - a spatial hash maybe needed to accelerate hit testing. In this scenario, the
container can be detached from the scene and glued using a custom event boundary.

````ts
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
``` |
| [EventSystem](eventsystem.md) | The system for handling UI events in PixiJS applications. This class manages mouse, touch, and pointer events,
normalizing them into a consistent event model. |
| [FederatedEvent](federatedevent.md) | A DOM-compatible synthetic event implementation for PixiJS's event system.
This class implements the standard DOM Event interface while providing additional
functionality specific to PixiJS events.
> [!NOTE] You wont receive an instance of this class directly, but rather a subclass
> of this class, such as FederatedPointerEvent, FederatedMouseEvent, or
> FederatedWheelEvent. This class is the base for all federated events. |
| [FederatedMouseEvent](federatedmouseevent.md) | A specialized event class for mouse interactions in PixiJS applications.
Extends FederatedEvent to provide mouse-specific properties and methods
while maintaining compatibility with the DOM MouseEvent interface.

Key features:
- Tracks mouse button states
- Provides modifier key states
- Supports coordinate systems (client, screen, global)
- Enables precise position tracking |
| [FederatedPointerEvent](federatedpointerevent.md) | A specialized event class for pointer interactions in PixiJS applications.
Extends FederatedMouseEvent to provide advanced pointer-specific features
while maintaining compatibility with the DOM PointerEvent interface.

Key features:
- Supports multi-touch interactions
- Provides pressure sensitivity
- Handles stylus input
- Tracks pointer dimensions
- Supports tilt detection |
| [FederatedWheelEvent](federatedwheelevent.md) | A specialized event class for wheel/scroll interactions in PixiJS applications.
Extends FederatedMouseEvent to provide wheel-specific properties while
maintaining compatibility with the DOM WheelEvent interface.

Key features:
- Provides scroll delta information
- Supports different scroll modes (pixel, line, page)
- Inherits mouse event properties
- Normalizes cross-browser wheel events |
````
