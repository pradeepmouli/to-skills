# Classes

## rendering

### `CanvasRenderer`

The Canvas PixiJS Renderer. This renderer allows you to use the HTML Canvas 2D context.
_extends `AbstractRenderer<CanvasPipes, CanvasOptions, T>`_
_implements `CanvasSystems`_

```ts
constructor<T>(): CanvasRenderer<T>
```

**Properties:**

- `defaultOptions: { resolution: number; failIfMajorPerformanceCaveat: boolean; roundPixels: boolean }` — The default options for the renderer.
- `name: string` — The name of the renderer.
- `tick: number` — The current tick of the renderer.
- `view: ViewSystem` — The view system manages the main canvas that is attached to the DOM
- `background: BackgroundSystem` — The background system manages the background color and alpha of the main view.
- `textureGenerator: GenerateTextureSystem` — System that manages the generation of textures from the renderer
- `gc: GCSystem`
- `texture: CanvasTextureSystem`
- `renderTarget: CanvasRenderTargetSystem`
- `renderGroup: RenderGroupSystem`
- `scheduler: SchedulerSystem`
- `globalUniforms: GlobalUniformSystem`
- `initHook: RendererInitHook`
- `renderableGC: RenderableGCSystem`
- `hello: HelloSystem`
- `textureGC: TextureGCSystem`
- `extract: ExtractSystem`
- `limits: CanvasLimitsSystem`
- `canvasContext: CanvasContextSystem`
- `accessibility: AccessibilitySystem`
- `events: EventSystem`
- `filter: FilterSystem`
- `prepare: PrepareBase` — The prepare mixin provides methods to prepare display objects for rendering.
  It is used to ensure that textures and other resources are ready before rendering.
- `canvasText: AbstractTextSystem`
- `htmlText: HTMLTextSystem`
- `graphicsContext: CanvasGraphicsContextSystem`
  **Methods:**
- `init(options: Partial<OPTIONS>): Promise<void>` — Initialize the renderer.
- `render(options: Container<ContainerChild> | RenderOptions): void` — Renders the object to its view.
- `resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution?: number): void` — Resizes the WebGL view to the specified width and height.
- `clear(options: ClearOptions): void` — Clears the render target.
- `destroy(options: RendererDestroyOptions): void`
- `generateTexture(options: Container<ContainerChild> | GenerateTextureOptions): Texture` — Generate a texture from a container.
- `_unsafeEvalCheck(): void` — Overridable function by `pixi.js/unsafe-eval` to silence
  throwing an error if platform doesn't support unsafe-evals.
- `resetState(): void` — Resets the rendering state of the renderer.
  This is useful when you want to use the WebGL context directly and need to ensure PixiJS's internal state
  stays synchronized. When modifying the WebGL context state externally, calling this method before the next Pixi
  render will reset all internal caches and ensure it executes correctly.

This is particularly useful when combining PixiJS with other rendering engines like Three.js:

```js
// Reset Three.js state
threeRenderer.resetState();

// Render a Three.js scene
threeRenderer.render(threeScene, threeCamera);

// Reset PixiJS state since Three.js modified the WebGL context
pixiRenderer.resetState();

// Now render Pixi content
pixiRenderer.render(pixiScene);
```
