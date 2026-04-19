# Classes

## rendering

### `GlContextSystem`

System plugin to the renderer to manage the context
_implements `System<ContextSystemOptions>`_

```ts
constructor(renderer: WebGLRenderer): GlContextSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "context" }`
- `defaultOptions: ContextSystemOptions` — The default options for the system.
- `supports: { uint32Indices: boolean; uniformBufferObject: boolean; vertexArrayObject: boolean; srgbTextures: boolean; nonPowOf2wrapping: boolean; msaa: boolean; nonPowOf2mipmaps: boolean }` — Features supported by current renderer.
- `extensions: WebGLExtensions` — Extensions available.
- `webGLVersion: 1 | 2`
- `multiView: boolean` — Whether to enable multi-view rendering. Set to true when rendering to multiple
  canvases on the dom.
- `canvas: ICanvas` — The canvas that the WebGL Context is rendering to.
  This will be the view canvas. But if multiView is enabled, this canvas will not be attached to the DOM.
  It will be rendered to and then copied to the target canvas.
  **Methods:**
- `init(options: ContextSystemOptions): void`
- `ensureCanvasSize(targetCanvas: ICanvas): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
- `forceContextLoss(): void` — this function can be called to force a webGL context loss
  this will release all resources on the GPU.
  Useful if you need to put Pixi to sleep, and save some GPU memory

As soon as render is called - all resources will be created again.
