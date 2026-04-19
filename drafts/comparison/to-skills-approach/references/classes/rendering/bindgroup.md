# Classes

## rendering

### `BindGroup`

A bind group is a collection of resources that are bound together for use by a shader.
They are essentially a wrapper for the WebGPU BindGroup class. But with the added bonus
that WebGL can also work with them.

```ts
constructor(resources?: Record<string, BindResource>): BindGroup
```

**Properties:**

- `resources: Record<string, BindResource>` — The resources that are bound together for use by a shader.
  **Methods:**
- `setResource(resource: BindResource, index: number): void` — Set a resource at a given index. this function will
  ensure that listeners will be removed from the current resource
  and added to the new resource.
- `getResource(index: number): BindResource` — Returns the resource at the current specified index.
- `destroy(): void` — Destroys this bind group and removes all listeners.

```ts
// Create a bind group with a single texture and sampler
const bindGroup = new BindGroup({
   uTexture: texture.source,
   uTexture: texture.style,
});

Bind groups resources must implement the {@link BindResource} interface.
The following resources are supported:
- {@link TextureSource}
- {@link TextureStyle}
- {@link Buffer}
- {@link BufferResource}
- {@link UniformGroup}

The keys in the bind group must correspond to the names of the resources in the GPU program.

This bind group class will also watch for changes in its resources ensuring that the changes
are reflected in the WebGPU BindGroup.
```
