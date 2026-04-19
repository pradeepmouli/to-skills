# Classes

## rendering

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
