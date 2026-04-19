# Classes

## rendering

### `Buffer`

A wrapper for a WebGPU/WebGL Buffer.
In PixiJS, the Buffer class is used to manage the data that is sent to the GPU rendering pipeline.
It abstracts away the underlying GPU buffer and provides an interface for uploading typed arrays or other data to the GPU,
They are used in the following places:
<br><br>
.1. Geometry as attribute data or index data for geometry
<br>
.2. UniformGroup as an underlying buffer for uniform data
<br>
.3. BufferResource as an underlying part of a buffer used directly by the GPU program
<br>

It is important to note that you must provide a usage type when creating a buffer. This is because
the underlying GPU buffer needs to know how it will be used. For example, if you are creating a buffer
to hold vertex data, you would use `BufferUsage.VERTEX`. This will tell the GPU that this buffer will be
used as a vertex buffer. This is important because it will affect how you can use the buffer.

Buffers are updated by calling the Buffer.update method. This immediately updates the buffer on the GPU.
Be mindful of calling this more often than you need to. It is recommended to update buffers only when needed.

In WebGPU, a GPU buffer cannot resized. This limitation is abstracted away, but know that resizing a buffer means
creating a brand new one and destroying the old, so it is best to limit this if possible.
_extends `EventEmitter<{ change: BindResource; update: Buffer; destroy: Buffer; unload: Buffer }>`_
_implements `BindResource`, `GPUDataOwner`, `GCable`_

```ts
constructor(options: BufferOptions): Buffer
```

**Properties:**

- `autoGarbageCollect: boolean` — If set to true, the buffer will be garbage collected automatically when it is not used.
- `uid: number` — a unique id for this uniform group used through the renderer
- `shrinkToFit: boolean` — should the GPU buffer be shrunk when the data becomes smaller?
  changing this will cause the buffer to be destroyed and a new one created on the GPU
  this can be expensive, especially if the buffer is already big enough!
  setting this to false will prevent the buffer from being shrunk. This will yield better performance
  if you are constantly setting data that is changing size often.
- `destroyed: boolean` — Has the buffer been destroyed?
  **Methods:**
- `setDataWithSize(value: TypedArray, size: number, syncGPU: boolean): void` — Sets the data in the buffer to the given value. This will immediately update the buffer on the GPU.
  If you only want to update a subset of the buffer, you can pass in the size of the data.
- `update(sizeInBytes?: number): void` — updates the buffer on the GPU to reflect the data in the buffer.
  By default it will update the entire buffer. If you only want to update a subset of the buffer,
  you can pass in the size of the buffer to update.
- `unload(): void` — Unloads the buffer from the GPU
- `destroy(): void` — Destroys the buffer

```ts
const buffer = new Buffer({
  data: new Float32Array([1, 2, 3, 4]),
  usage: BufferUsage.VERTEX
});
```
