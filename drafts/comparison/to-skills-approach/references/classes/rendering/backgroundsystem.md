# Classes

## rendering

### `BackgroundSystem`

The background system manages the background color and alpha of the main view.
_implements `System<BackgroundSystemOptions>`_

```ts
constructor(): BackgroundSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "background"; priority: 0 }`
- `defaultOptions: BackgroundSystemOptions` — default options used by the system
- `clearBeforeRender: boolean` — This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
  If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
  frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
  to clear the canvas every frame. Disable this by setting this to false. For example, if
  your game has a canvas filling background image you often don't need this set.
  **Methods:**
- `init(options: BackgroundSystemOptions): void` — initiates the background system
