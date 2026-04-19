# Classes

## rendering

### `AbstractRenderer`

The base class for a PixiJS Renderer. It contains the shared logic for all renderers.

You should not use this class directly, but instead use WebGLRenderer
or WebGPURenderer.
Alternatively, you can also use autoDetectRenderer if you want us to
determine the best renderer for you.

The renderer is composed of systems that manage specific tasks. The following systems are added by default
whenever you create a renderer:

| Generic Systems     | Systems that manage functionality that all renderer types share                |
| ------------------- | ------------------------------------------------------------------------------ |
| ViewSystem          | This manages the main view of the renderer usually a Canvas                    |
| BackgroundSystem    | This manages the main views background color and alpha                         |
| EventSystem         | This manages UI events.                                                        |
| AccessibilitySystem | This manages accessibility features. Requires `import 'pixi.js/accessibility'` |

| Core Systems        | Provide an optimised, easy to use API to work with WebGL/WebGPU             |
| ------------------- | --------------------------------------------------------------------------- |
| GlobalUniformSystem | This manages shaders, programs that run on the GPU to calculate 'em pixels. |
| TextureGCSystem     | This will automatically remove textures from the GPU if they are not used.  |

| PixiJS High-Level Systems | Set of specific systems designed to work with PixiJS objects                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| HelloSystem               | Says hello, buy printing out the pixi version into the console log (along with the renderer type) |
| GenerateTextureSystem     | This adds the ability to generate textures from any Container                                     |
| FilterSystem              | This manages the filtering pipeline for post-processing effects.                                  |
| PrepareSystem             | This manages uploading assets to the GPU. Requires `import 'pixi.js/prepare'`                     |
| ExtractSystem             | This extracts image data from display objects.                                                    |

The breadth of the API surface provided by the renderer is contained within these systems.
_extends `EventEmitter<{ resize: [screenWidth: number, screenHeight: number, resolution: number] }>`_

```ts
constructor<PIPES, OPTIONS, CANVAS>(config: RendererConfig): AbstractRenderer<PIPES, OPTIONS, CANVAS>
```

**Properties:**

- `defaultOptions: { resolution: number; failIfMajorPerformanceCaveat: boolean; roundPixels: boolean }` — The default options for the renderer.
- `name: string` — The name of the renderer.
- `tick: number` — The current tick of the renderer.
- `view: ViewSystem` — The view system manages the main canvas that is attached to the DOM
- `background: BackgroundSystem` — The background system manages the background color and alpha of the main view.
- `textureGenerator: GenerateTextureSystem` — System that manages the generation of textures from the renderer
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
