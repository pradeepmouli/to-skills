# Classes

## rendering

### `CanvasRendererTextSystem`

System plugin to the renderer to manage canvas text for Canvas2D.
_extends `AbstractTextSystem`_

```ts
constructor(renderer: Renderer): CanvasRendererTextSystem
```

**Properties:**

- `extension: { type: readonly [CanvasSystem]; name: "canvasText" }`
  **Methods:**
- `getTexture(text: string, resolution: number, style: TextStyle, textKey: string): Texture`
- `returnTexture(texture: Texture): void` — Returns a texture that was created wit the above `getTexture` function.
  Handy if you are done with a texture and want to return it to the pool.
- `renderTextToCanvas(): void` — Renders text to its canvas, and updates its texture.
- `getManagedTexture(text: Text): Texture<TextureSource<any>>` — Gets or creates a managed texture for a Text object. This method handles texture reuse and reference counting.
- `decreaseReferenceCount(textKey: string): void` — Decreases the reference count for a texture associated with a text key.
  When the reference count reaches zero, the texture is returned to the pool.
- `getReferenceCount(textKey: string): number` — Gets the current reference count for a texture associated with a text key.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
