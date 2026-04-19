# Classes

## rendering

### `GCSystem`

A unified garbage collection system for managing GPU resources.
Resources register themselves with a cleanup callback and are automatically
cleaned up when they haven't been used for a specified amount of time.
_implements `System<GCSystemOptions>`_

```ts
constructor(renderer: Renderer): GCSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "gc"; priority: 0 }`
- `defaultOptions: GCSystemOptions` — Default options for the GCSystem
- `maxUnusedTime: number` — Maximum time in ms a resource can be unused before being garbage collected
- `now: number` — Current timestamp used for age calculations
  **Methods:**
- `init(options: GCSystemOptions): void` — Initializes the garbage collection system with the provided options.
- `addCollection(context: any, collection: string, type: "array" | "hash"): void` — Registers a collection for garbage collection tracking.
- `addResource(resource: GCableEventEmitter, type: "resource" | "renderable"): void` — Registers a resource for garbage collection tracking.
- `removeResource(resource: GCable): void` — Removes a resource from garbage collection tracking.
  Call this when manually destroying a resource.
- `addResourceHash(context: any, hash: string, type: "resource" | "renderable", priority: number): void` — Registers a hash-based resource collection for garbage collection tracking.
  Resources in the hash will be automatically tracked and cleaned up when unused.
- `run(): void` — Performs garbage collection by cleaning up unused resources.
  Removes resources that haven't been used for longer than maxUnusedTime.
- `destroy(): void` — Cleans up the garbage collection system. Disables GC and removes all tracked resources.

```ts
// Register a resource for GC
gc.addResource(myResource, () => {
  // cleanup logic here
  myResource.unload();
});

// Touch the resource when used (resets idle timer)
gc.touch(myResource);

// Remove from GC tracking (e.g., on manual destroy)
gc.removeResource(myResource);
```
