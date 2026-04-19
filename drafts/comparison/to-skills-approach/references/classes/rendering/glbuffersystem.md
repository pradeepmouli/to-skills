# Classes

## rendering

### `GlBufferSystem`

System plugin to the renderer to manage buffers.

WebGL uses Buffers as a way to store objects to the GPU.
This system makes working with them a lot easier.

Buffers are used in three main places in WebGL

- geometry information
- Uniform information (via uniform buffer objects - a WebGL 2 only feature)
- Transform feedback information. (WebGL 2 only feature)

This system will handle the binding of buffers to the GPU as well as uploading
them. With this system, you never need to work directly with GPU buffers, but instead work with
the Buffer class.
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlBufferSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "buffer" }`
  **Methods:**
- `destroy(): void`
- `getGlBuffer(buffer: Buffer): GlBuffer`
- `bind(buffer: Buffer): void` — This binds specified buffer. On first run, it will create the webGL buffers for the context too
- `bindBufferBase(glBuffer: GlBuffer, index: number): void` — Binds an uniform buffer to at the given index.

A cache is used so a buffer will not be bound again if already bound.

- `nextBindBase(hasTransformFeedback: boolean): void`
- `freeLocationForBufferBase(glBuffer: GlBuffer): number`
- `getLastBindBaseLocation(glBuffer: GlBuffer): number`
- `bindBufferRange(glBuffer: GlBuffer, index?: number, offset?: number, size?: number): void` — Binds a buffer whilst also binding its range.
  This will make the buffer start from the offset supplied rather than 0 when it is read.
- `updateBuffer(buffer: Buffer): GlBuffer` — Will ensure the data in the buffer is uploaded to the GPU.
- `destroyAll(contextLost: boolean): void` — dispose all WebGL resources of all managed buffers
- `resetState(): void`
