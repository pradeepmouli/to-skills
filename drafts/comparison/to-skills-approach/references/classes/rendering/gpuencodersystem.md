# Classes

## rendering

### `GpuEncoderSystem`

The system that handles encoding commands for the GPU.
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): GpuEncoderSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "encoder"; priority: 1 }`
- `commandEncoder: GPUCommandEncoder`
- `renderPassEncoder: GPURenderPassEncoder`
- `commandFinished: Promise<void>`
  **Methods:**
- `renderStart(): void`
- `beginRenderPass(gpuRenderTarget: GpuRenderTarget): void`
- `endRenderPass(): void`
- `setViewport(viewport: Rectangle): void`
- `setPipelineFromGeometryProgramAndState(geometry: Geometry, program: GpuProgram, state: any, topology?: Topology): void`
- `setPipeline(pipeline: GPURenderPipeline): void`
- `resetBindGroup(index: number): void`
- `setBindGroup(index: number, bindGroup: BindGroup, program: GpuProgram): void`
- `setGeometry(geometry: Geometry, program: GpuProgram): void`
- `draw(options: { geometry: Geometry; shader: Shader; state?: State; topology?: Topology; size?: number; start?: number; instanceCount?: number; skipSync?: boolean }): void`
- `finishRenderPass(): void`
- `postrender(): void`
- `restoreRenderPass(): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
