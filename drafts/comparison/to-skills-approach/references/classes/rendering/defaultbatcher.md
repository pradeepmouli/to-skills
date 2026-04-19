# Classes

## rendering

### `DefaultBatcher`

The default batcher is used to batch quads and meshes. This batcher will batch the following elements:

- tints
- roundPixels
- texture
- transform
  _extends `Batcher`_

```ts
constructor(options: BatcherOptions): DefaultBatcher
```

**Properties:**

- `extension: { type: readonly [Batcher]; name: "default" }`
- `defaultOptions: Partial<BatcherOptions>`
- `geometry: BatchGeometry` — The geometry used by this batcher. Must be implemented by subclasses.
- `shader: DefaultShader` — The shader used by this batcher. Must be implemented by subclasses.
  this can be shared by multiple batchers of the same type.
- `name: "default"` — The name of the batcher. Must be implemented by subclasses.
- `vertexSize: number` — The size of one attribute. 1 = 32 bit. x, y, u, v, color, textureIdAndRound -> total = 6
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
  **Methods:**
- `packAttributes(element: DefaultBatchableMeshElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void` — Packs the attributes of a DefaultBatchableMeshElement into the provided views.
- `packQuadAttributes(element: DefaultBatchableQuadElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void` — Packs the attributes of a DefaultBatchableQuadElement into the provided views.
- `destroy(): void` — Destroys the batch and its resources.
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
