# Classes

## events

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
