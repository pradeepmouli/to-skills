# Classes

## `IGLUniformData`

```ts
constructor(): IGLUniformData
```

**Properties:**

- `location: WebGLUniformLocation`
- `value: number | boolean | Uint32Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | boolean[]`

## `GlProgramData`

Helper class to create a WebGL Program

```ts
constructor(program: WebGLProgram, uniformData: { [key: string]: IGLUniformData }): GlProgramData
```

**Properties:**

- `program: WebGLProgram` — The shader program.
- `uniformData: Record<string, any>` — Holds the uniform data which contains uniform locations
  and current uniform values used for caching and preventing unneeded GPU commands.
- `uniformGroups: Record<string, any>` — UniformGroups holds the various upload functions for the shader. Each uniform group
  and program have a unique upload function generated.
- `uniformBlockBindings: Record<string, any>` — A hash that stores where UBOs are bound to on the program.
- `uniformSync: Record<string, any>` — A hash for lazily-generated uniform uploading functions.
- `uniformDirtyGroups: Record<string, any>` — A place where dirty ticks are stored for groups
  If a tick here does not match with the Higher level Programs tick, it means
  we should re upload the data.
  **Methods:**
- `destroy(): void` — Destroys this program.

## `BatchableGraphics`

A batchable graphics object.
_implements `DefaultBatchableMeshElement`_

```ts
constructor(): BatchableGraphics
```

**Properties:**

- `packAsQuad: false` — Indicates that this element should not be packed as a quad.
- `batcherName: string` — The name of the batcher to use. Must be registered.
- `texture: Texture` — The texture to be used for rendering.
- `topology: Topology` — The topology to be used for rendering.
- `renderable: Graphics`
- `indexOffset: number` — The offset in the index buffer.
- `indexSize: number` — The size of the index data.
- `attributeOffset: number` — The offset in the attribute buffer.
- `attributeSize: number` — The size of the attribute data.
- `baseColor: number`
- `alpha: number`
- `applyTransform: boolean`
- `roundPixels: 0 | 1` — Determines whether the element should be rounded to the nearest pixel.
- 0: No rounding (default)
- 1: Round to nearest pixel
  This can help with visual consistency, especially for pixel art styles.
- `_indexStart: number` — The starting position in the index buffer.
- `_textureId: number` — The texture ID, stored for efficient updating.
- `_attributeStart: number` — The starting position in the attribute buffer.
- `_batcher: Batcher` — Reference to the batcher.
- `_batch: Batch` — Reference to the batch.
- `geometryData: { vertices: number[]; uvs: number[]; indices: number[] }`
  **Methods:**
- `copyTo(gpuBuffer: BatchableGraphics): void`
- `reset(): void`
- `destroy(): void`

## `BatchableMesh`

A batchable mesh object.
_implements `DefaultBatchableMeshElement`_

```ts
constructor(): BatchableMesh
```

**Properties:**

- `batcherName: string` — The name of the batcher to use. Must be registered.
- `_topology: Topology`
- `packAsQuad: false` — Indicates that this element should not be packed as a quad.
- `location: number`
- `renderable: ViewContainer`
- `indexOffset: number` — The offset in the index buffer.
- `attributeOffset: number` — The offset in the attribute buffer.
- `texture: Texture` — The texture to be used for rendering.
- `geometry: MeshGeometry`
- `transform: Matrix` — The transform matrix of the element.
  This matrix represents the position, scale, rotation, and skew of the element.
- `roundPixels: 0 | 1` — Determines whether the element should be rounded to the nearest pixel.
- 0: No rounding (default)
- 1: Round to nearest pixel
  This can help with visual consistency, especially for pixel art styles.
- `_attributeStart: number` — The starting position in the attribute buffer.
- `_batcher: Batcher` — Reference to the batcher.
- `_batch: Batch` — Reference to the batch.
- `_indexStart: number` — The starting position in the index buffer.
- `_textureId: number` — The texture ID, stored for efficient updating.
- `_textureMatrixUpdateId: number`
  **Methods:**
- `reset(): void`
- `setTexture(value: Texture): void` — Sets the texture for the batchable mesh.
  As it does so, it resets the texture matrix update ID.
  this is to ensure that the texture matrix is recalculated when the uvs are referenced

## `TickerListener`

Internal class for handling the priority sorting of ticker handlers.

```ts
constructor<T>(fn: TickerCallback<T>, context: T, priority: number, once: boolean): TickerListener<T>
```

**Properties:**

- `priority: number` — The current priority.
- `next: TickerListener` — The next item in chain.
- `previous: TickerListener` — The previous item in chain.
  **Methods:**
- `match(fn: TickerCallback<T>, context: any): boolean` — Simple compare function to figure out if a function and context match.
- `emit(ticker: Ticker): TickerListener` — Emit by calling the current function.
- `connect(previous: TickerListener): void` — Connect to the list.
- `destroy(hard: boolean): TickerListener` — Destroy and don't use after this.
