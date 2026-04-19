# Classes

## rendering

### `CanvasContextSystem`

Canvas 2D context system for the CanvasRenderer.
_implements `System`_

```ts
constructor(renderer: CanvasRenderer): CanvasContextSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "canvasContext" }`
- `rootContext: CrossPlatformCanvasRenderingContext2D` — Root 2D context tied to the renderer's canvas.
- `activeContext: CrossPlatformCanvasRenderingContext2D` — Active 2D context for rendering (root or render target).
- `activeResolution: number` — Resolution of the active context.
- `smoothProperty: SmoothingEnabledProperties` — The image smoothing property to toggle for this browser.
- `blendModes: Record<BLEND_MODES, GlobalCompositeOperation>` — Map of Pixi blend modes to canvas composite operations.
- `_activeBlendMode: BLEND_MODES` — Current canvas blend mode.
- `_projTransform: Matrix` — Optional projection transform for render targets.
- `_outerBlend: boolean` — True when external blend mode control is in use.
  **Methods:**
- `init(): void` — Initializes the root context and smoothing flag selection.
- `setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number, skipGlobalTransform?: boolean): void` — Sets the current transform on the active context.
- `clear(clearColor?: string | number | number[], alpha?: number): void` — Clears the current render target, optionally filling with a color.
- `setBlendMode(blendMode: BLEND_MODES): void` — Sets the active blend mode.
- `destroy(): void` — Releases context references.
