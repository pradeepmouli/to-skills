# Classes

## rendering

### `CanvasFilterSystem`

Canvas2D filter system that applies compatible filters using CSS filter strings.
Unsupported filters are skipped with a warn-once message.
_implements `System`_

```ts
constructor(renderer: { canvasContext: { activeContext: ICanvasRenderingContext2D; activeResolution: number } }): CanvasFilterSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "filter" }`
- `renderer: { canvasContext: { activeContext: ICanvasRenderingContext2D; activeResolution: number } }` — The renderer this system is attached to
  **Methods:**
- `push(instruction: FilterInstruction): void` — Push a filter instruction onto the stack.
  Called when entering a filtered container.
- `pop(): void` — Pop a filter from the stack. Called when exiting a filtered container.
- `generateFilteredTexture(params: { texture: Texture; filters: Filter[] }): Texture` — Applies supported filters to a texture and returns a new texture.
  Unsupported filters are skipped with a warn-once message.
- `destroy(): void` — Destroys the system
