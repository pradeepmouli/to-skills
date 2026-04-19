# Classes

## rendering

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
