# Classes

## rendering

### `Batcher`

A batcher is used to batch together objects with the same texture.
It is an abstract class that must be extended. see DefaultBatcher for an example.

```ts
constructor(options: BatcherOptions): Batcher
```

**Properties:**

- `defaultOptions: Partial<BatcherOptions>`
- `uid: number` — unique id for this batcher
- `attributeBuffer: ViewableBuffer` — The buffer containing attribute data for all elements in the batch.
- `indexBuffer: IndexBufferArray` — The buffer containing index data for all elements in the batch.
- `attributeSize: number` — The current size of the attribute data in the batch.
- `indexSize: number` — The current size of the index data in the batch.
- `elementSize: number` — The total number of elements currently in the batch.
- `elementStart: number` — The starting index of elements in the current batch.
- `dirty: boolean` — Indicates whether the batch data has been modified and needs updating.
- `batchIndex: number` — The current index of the batch being processed.
- `batches: Batch[]` — An array of all batches created during the current rendering process.
- `maxTextures: number` — The maximum number of textures per batch.
- `name: string` — The name of the batcher. Must be implemented by subclasses.
- `geometry: Geometry` — The geometry used by this batcher. Must be implemented by subclasses.
- `shader: Shader` — The shader used by this batcher. Must be implemented by subclasses.
  this can be shared by multiple batchers of the same type.
  **Methods:**
- `packAttributes(element: BatchableMeshElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void` — Packs the attributes of a BatchableMeshElement into the provided views.
  Must be implemented by subclasses.
- `packQuadAttributes(element: BatchableQuadElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void` — Packs the attributes of a BatchableQuadElement into the provided views.
  Must be implemented by subclasses.
- `begin(): void`
- `add(batchableObject: BatchableElement): void`
- `checkAndUpdateTexture(batchableObject: BatchableElement, texture: Texture): boolean`
- `updateElement(batchableObject: BatchableElement): void`
- `break(instructionSet: InstructionSet): void` — breaks the batcher. This happens when a batch gets too big,
  or we need to switch to a different type of rendering (a filter for example)
- `finish(instructionSet: InstructionSet): void`
- `ensureAttributeBuffer(size: number): void` — Resizes the attribute buffer to the given size (1 = 1 float32)
- `ensureIndexBuffer(size: number): void` — Resizes the index buffer to the given size (1 = 1 float32)
- `packQuadIndex(indexBuffer: IndexBufferArray, index: number, indicesOffset: number): void`
- `packIndex(element: BatchableMeshElement, indexBuffer: IndexBufferArray, index: number, indicesOffset: number): void`
- `destroy(options: { shader?: boolean }): void` — Destroys the batch and its resources.
