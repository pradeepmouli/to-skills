# Classes

## rendering

### `ViewSystem`

The view system manages the main canvas that is attached to the DOM.
This main role is to deal with how the holding the view reference and dealing with how it is resized.
_implements `System<ViewSystemOptions, TypeOrBool<ViewSystemDestroyOptions>>`_

```ts
constructor(): ViewSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "view"; priority: 0 }`
- `defaultOptions: ViewSystemOptions` — The default options for the view system.
- `canvas: ICanvas` — The canvas element that everything is drawn to.
- `texture: Texture<CanvasSource>` — The texture that is used to draw the canvas to the screen.
- `antialias: boolean` — Whether to enable anti-aliasing. This may affect performance.
- `screen: Rectangle` — Measurements of the screen. (0, 0, screenWidth, screenHeight).

Its safe to use as filterArea or hitArea for the whole stage.

- `renderTarget: RenderTarget` — The render target that the view is drawn to.
  **Methods:**
- `init(options: ViewSystemOptions): void` — initiates the view system
- `resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution: number): void` — Resizes the screen and canvas to the specified dimensions.
- `destroy(options: TypeOrBool<ViewSystemDestroyOptions>): void` — Destroys this System and optionally removes the canvas from the dom.
