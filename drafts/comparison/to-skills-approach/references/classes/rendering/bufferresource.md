# Classes

## rendering

### `BufferResource`

A resource that can be bound to a bind group and used in a shader.
Whilst a buffer can be used as a resource, this class allows you to specify an offset and size of the buffer to use.
This is useful if you have a large buffer and only part of it is used in a shader.

This resource, will listen for changes on the underlying buffer and emit a itself if the buffer changes shape.
_extends `EventEmitter<{ change: BindResource }>`_
_implements `BindResource`_

```ts
constructor(options: { buffer: Buffer; offset?: number; size?: number }): BufferResource
```

**Properties:**

- `uid: number` — a unique id for this uniform group used through the renderer
- `buffer: Buffer` — the underlying buffer that this resource is using
- `offset: number` — the offset of the buffer this resource is using. If not provided, then it will use the offset of the buffer.
- `size: number` — the size of the buffer this resource is using. If not provided, then it will use the size of the buffer.
- `destroyed: boolean` — Has the Buffer resource been destroyed?
  **Methods:**
- `destroy(destroyBuffer: boolean): void` — Destroys this resource. Make sure the underlying buffer is not used anywhere else
  if you want to destroy it as well, or code will explode

```ts
const buffer = new Buffer({
  data: new Float32Array(1000),
  usage: BufferUsage.UNIFORM
});
// Create a buffer resource that uses the first 100 bytes of a buffer
const bufferResource = new BufferResource({
  buffer,
  offset: 0,
  size: 100
});
```
