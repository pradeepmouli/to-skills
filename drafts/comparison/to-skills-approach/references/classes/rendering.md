# Classes

## rendering

### `CanvasFilterSystem`

Canvas2D filter system that applies compatible filters using CSS filter strings.
Unsupported filters are skipped with a warn-once message.
_implements `System`_

```ts
constructor(renderer: { canvasContext: { activeContext: ICanvasRenderingContext2D; activeResolution: number } }): CanvasFilterSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "filter" }`
- `renderer: { canvasContext: { activeContext: ICanvasRenderingContext2D; activeResolution: number } }` — The renderer this system is attached to
  **Methods:**
- `push(instruction: FilterInstruction): void` — Push a filter instruction onto the stack.
  Called when entering a filtered container.
- `pop(): void` — Pop a filter from the stack. Called when exiting a filtered container.
- `generateFilteredTexture(params: { texture: Texture; filters: Filter[] }): Texture` — Applies supported filters to a texture and returns a new texture.
  Unsupported filters are skipped with a warn-once message.
- `destroy(): void` — Destroys the system

### `FilterSystem`

System that manages the filter pipeline
_implements `System`_

```ts
constructor(renderer: WebGLRenderer<HTMLCanvasElement> | WebGPURenderer<HTMLCanvasElement>): FilterSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "filter" }`
- `renderer: WebGLRenderer<HTMLCanvasElement> | WebGPURenderer<HTMLCanvasElement>`
  **Methods:**
- `generateFilteredTexture(params: { texture: Texture; filters: Filter[] }): Texture` — Applies filters to a texture.

This method takes a texture and a list of filters, applies the filters to the texture,
and returns the resulting texture.

- `getBackTexture(lastRenderSurface: RenderTarget, bounds: Bounds, previousBounds?: Bounds): Texture<TextureSource<any>>` — Copies the last render surface to a texture.
- `applyFilter(filter: Filter, input: Texture, output: RenderSurface, clear: boolean): void` — Applies a filter to a texture.
- `calculateSpriteMatrix(outputMatrix: Matrix, sprite: Sprite): Matrix` — Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.

Use `outputMatrix * vTextureCoord` in the shader.

- `destroy(): void` — Generic destroy methods to be overridden by the subclass

### `PrepareBase`

Part of the prepare system. Responsible for uploading all the items to the GPU.
This class provides the base functionality and handles processing the queue asynchronously.

```ts
constructor(renderer: Renderer): PrepareBase
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`

### `PrepareQueue`

Part of the prepare system. Responsible for uploading all the items to the GPU.
This class extends the base functionality and resolves given resource items ready for the queue.
_extends `PrepareBase`_

```ts
constructor(renderer: Renderer): PrepareQueue
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`

### `PrepareSystem`

The prepare system provides renderer-specific plugins for pre-rendering DisplayObjects. This is useful for
asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.

Do not instantiate this plugin directly. It is available from the `renderer.prepare` property.
_extends `PrepareUpload`_
_implements `System`_

```ts
constructor(renderer: Renderer): PrepareSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "prepare" }`
- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `destroy(): void` — Destroys the plugin, don't use after this.
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing

```ts
import 'pixi.js/prepare';
import { Application, Graphics } from 'pixi.js';

// Create a new application (prepare will be auto-added to renderer)
const app = new Application();
await app.init();
document.body.appendChild(app.view);

// Don't start rendering right away
app.stop();

// Create a display object
const rect = new Graphics().beginFill(0x00ff00).drawRect(40, 40, 200, 200);

// Add to the stage
app.stage.addChild(rect);

// Don't start rendering until the graphic is uploaded to the GPU
app.renderer.prepare.upload(app.stage, () => {
  app.start();
});
```

### `PrepareUpload`

_extends `PrepareQueue`_

```ts
constructor(renderer: Renderer): PrepareUpload
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`

### `CanvasBatchAdaptor`

A BatcherAdaptor that renders batches using Canvas2D.

```ts
constructor(): CanvasBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [CanvasPipesAdaptor]; name: "batch" }`
  **Methods:**
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`

### `GlBatchAdaptor`

A BatcherAdaptor that uses WebGL to render batches.

```ts
constructor(): GlBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGLPipesAdaptor]; name: "batch" }`
  **Methods:**
- `init(batcherPipe: BatcherPipe): void`
- `contextChange(): void`
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`

### `GpuBatchAdaptor`

A BatcherAdaptor that uses the GPU to render batches.

```ts
constructor(): GpuBatchAdaptor
```

**Properties:**

- `extension: { type: readonly [WebGPUPipesAdaptor]; name: "batch" }`
  **Methods:**
- `start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void`
- `execute(batchPipe: BatcherPipe, batch: Batch): void`

### `Batch`

A batch pool is used to store batches when they are not currently in use.
_implements `Instruction`_

```ts
constructor(): Batch
```

**Properties:**

- `renderPipeId: string` — a the id of the render pipe that can run this instruction
- `action: BatchAction` — the name of the instruction
- `start: number`
- `size: number`
- `textures: BatchTextureArray`
- `blendMode: BLEND_MODES`
- `topology: Topology`
- `canBundle: boolean` — true if this instruction can be compiled into a WebGPU bundle
- `gpuBindGroup: GPUBindGroup` — breaking rules slightly here in the name of performance..
  storing references to these bindgroups here is just faster for access!
  keeps a reference to the GPU bind group to set when rendering this batch for WebGPU. Will be null is using WebGL.
- `bindGroup: BindGroup` — breaking rules slightly here in the name of performance..
  storing references to these bindgroups here is just faster for access!
  keeps a reference to the bind group to set when rendering this batch for WebGPU. Will be null if using WebGl.
- `batcher: Batcher`
- `elements: BatchableElement[]` — Elements contained in this batch. Used by the Canvas renderer.
  **Methods:**
- `destroy(): void`

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

### `BatcherPipe`

A pipe that batches elements into batches and sends them to the renderer.

You can install new Batchers using ExtensionType.Batcher. Each render group will
have a default batcher and any required ones will be created on demand.
_implements `InstructionPipe<Batch>`, `BatchPipe`_

```ts
constructor(renderer: Renderer, adaptor: BatcherAdaptor): BatcherPipe
```

**Properties:**

- `extension: { type: readonly [WebGLPipes, WebGPUPipes, CanvasPipes]; name: "batch" }`
- `_availableBatchers: Record<string, () => Batcher>`
- `state: State`
- `renderer: Renderer`
  **Methods:**
- `getBatcher(name: string): Batcher`
- `buildStart(instructionSet: InstructionSet): void`
- `addToBatch(batchableObject: BatchableElement, instructionSet: InstructionSet): void` — Add a add a batchable object to the batch.
- `break(instructionSet: InstructionSet): void` — Forces the batch to break. This can happen if for example you need to render everything and then
  change the render target.
- `buildEnd(instructionSet: InstructionSet): void`
- `upload(instructionSet: InstructionSet): void` — called just before we execute the draw calls , this is where the pipes have an opportunity to
  upload data to the GPU. This is only called if data changes.
- `execute(batch: Batch): void` — this is where the actual instruction is executed - eg make the draw call
  activate a filter. Any instructions that have the same renderPipeId have their
  execute method called
- `destroy(): void`

### `BatchGeometry`

This class represents a geometry used for batching in the rendering system.
It defines the structure of vertex attributes and index buffers for batched rendering.
_extends `Geometry`_

```ts
constructor(): BatchGeometry
```

**Properties:**

- `autoGarbageCollect: boolean` — If set to true, the resource will be garbage collected automatically when it is not used.
- `topology: Topology` — The topology of the geometry.
- `uid: number` — The unique id of the geometry.
- `attributes: Record<string, Attribute>` — A record of the attributes of the geometry.
- `buffers: Buffer[]` — The buffers that the attributes use
- `indexBuffer: Buffer` — The index buffer of the geometry
- `instanceCount: number` — the instance count of the geometry to draw
  **Methods:**
- `getAttribute(id: string): Attribute` — Returns the requested attribute.
- `getIndex(): Buffer` — Returns the index buffer
- `getBuffer(id: string): Buffer` — Returns the requested buffer.
- `getSize(): number` — Used to figure out how many vertices there are in this geometry
- `addAttribute(name: string, attributeOption: AttributeOption): void` — Adds an attribute to the geometry.
- `addIndex(indexBuffer: number[] | Buffer | TypedArray): void` — Adds an index buffer to the geometry.
- `unload(): void` — Unloads the geometry from the GPU.
- `destroy(destroyBuffers: boolean): void` — destroys the geometry.

### `BatchTextureArray`

Used by the batcher to build texture batches. Holds list of textures and their respective locations.

```ts
constructor(): BatchTextureArray
```

**Properties:**

- `textures: TextureSource<any>[]` — Inside textures array.
- `ids: Record<number, number>` — Respective locations for textures.
- `count: number` — Number of filled elements.
  **Methods:**
- `clear(): void` — Clear the textures and their locations.

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

<!-- truncated -->
