# Classes

## rendering

### `HTMLTextSystem`

System plugin to the renderer to manage HTMLText
_implements `System`_

```ts
constructor(renderer: Renderer): HTMLTextSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "htmlText" }`
  **Methods:**
- `getTexture(options: HTMLTextOptions): Promise<Texture<TextureSource<any>>>`
- `getManagedTexture(text: HTMLText): Promise<Texture<TextureSource<any>>>` — Increases the reference count for a texture.
- `getReferenceCount(textKey: string): number` — Gets the current reference count for a texture associated with a text key.
- `decreaseReferenceCount(textKey: string): void` — Decreases the reference count for a texture.
  If the count reaches zero, the texture is cleaned up.
- `getTexturePromise(options: HTMLTextOptions): Promise<Texture<TextureSource<any>>>` — Returns a promise that resolves to a texture for the given HTMLText options.
- `returnTexturePromise(texturePromise: Promise<Texture<TextureSource<any>>>): void`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
