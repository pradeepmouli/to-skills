# Classes

## rendering

### `RenderableGCSystem`

The RenderableGCSystem is responsible for cleaning up GPU resources that are no longer being used.

When rendering objects like sprites, text, etc - GPU resources are created and managed by the renderer.
If these objects are no longer needed but not properly destroyed (via sprite.destroy()), their GPU resources
would normally leak. This system prevents that by automatically cleaning up unused GPU resources.

Key features:

- Runs every 30 seconds by default to check for unused resources
- Cleans up resources not rendered for over 1 minute
- Works independently of rendering - will clean up even when not actively rendering
- When cleaned up resources are needed again, new GPU objects are quickly assigned from a pool
- Can be disabled with renderableGCActive:false for manual control

Best practices:

- Always call destroy() explicitly when done with renderables (e.g. sprite.destroy())
- This system is a safety net, not a replacement for proper cleanup
- Adjust frequency and timeouts via options if needed
  _implements `System<RenderableGCSystemOptions>`_

```ts
constructor(renderer: Renderer): RenderableGCSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "renderableGC"; priority: 0 }` — Extension metadata for registering this system with the renderer.
- `defaultOptions: RenderableGCSystemOptions` — Default configuration options for the garbage collection system.
  These can be overridden when initializing the renderer.
- `maxUnusedTime: number` — Maximum time in ms a resource can be unused before being garbage collected
  **Methods:**
- `init(options: RenderableGCSystemOptions): void` — Initializes the garbage collection system with the provided options.
- `addManagedHash<T>(context: T, hash: string): void` — Adds a hash table to be managed by the garbage collector.
- `addManagedArray<T>(context: T, hash: string): void` — Adds an array to be managed by the garbage collector.
- `addRenderable(_renderable: Renderable): void` — Starts tracking a renderable for garbage collection.
- `run(): void` — Performs garbage collection by cleaning up unused renderables.
  Removes renderables that haven't been used for longer than maxUnusedTime.
- `destroy(): void` — Cleans up the garbage collection system. Disables GC and removes all tracked resources.

```js
// Sprite created but reference lost without destroy
let sprite = new Sprite(texture);

// internally the renderer will assign a resource to the sprite
renderer.render(sprite);

sprite = null; // Reference lost but GPU resources still exist

// After 1 minute of not being rendered:
// - RenderableGC will clean up the sprite's GPU resources
// - JS garbage collector can then clean up the sprite itself
```
