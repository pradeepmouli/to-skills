# Classes

## rendering

### `PipelineSystem`

A system that creates and manages the GPU pipelines.

Caching Mechanism: At its core, the system employs a two-tiered caching strategy to minimize
the redundant creation of GPU pipelines (or "pipes"). This strategy is based on generating unique
keys that represent the state of the graphics settings and the specific requirements of the
item being rendered. By caching these pipelines, subsequent draw calls with identical configurations
can reuse existing pipelines instead of generating new ones.

State Management: The system differentiates between "global" state properties (like color masks
and stencil masks, which do not change frequently) and properties that may vary between draw calls
(such as geometry, shaders, and blend modes). Unique keys are generated for both these categories
using getStateKey for global state and getGraphicsStateKey for draw-specific settings. These keys are
then then used to caching the pipe. The next time we need a pipe we can check
the cache by first looking at the state cache and then the pipe cache.
_implements `System`_

```ts
constructor(renderer: WebGPURenderer): PipelineSystem
```

**Properties:**

- `extension: { type: readonly [WebGPUSystem]; name: "pipeline" }`
  **Methods:**
- `setMultisampleCount(multisampleCount: number): void`
- `setRenderTarget(renderTarget: GpuRenderTarget): void`
- `setColorMask(colorMask: number): void`
- `setStencilMode(stencilMode: STENCIL_MODES): void`
- `setPipeline(geometry: Geometry, program: GpuProgram, state: State, passEncoder: GPURenderPassEncoder): void`
- `getPipeline(geometry: Geometry, program: GpuProgram, state: State, topology?: Topology): GPURenderPipeline`
- `getBufferNamesToBind(geometry: Geometry, program: GpuProgram): Record<string, string>` — Returns a hash of buffer names mapped to bind locations.
  This is used to bind the correct buffer to the correct location in the shader.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
