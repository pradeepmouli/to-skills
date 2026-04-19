# Classes

## rendering

### `GlTextureSystem`

The system for managing textures in WebGL.
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlTextureSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "texture" }`
  **Methods:**
- `initSource(source: TextureSource): void` — Initializes a texture source, if it has already been initialized nothing will happen.
- `bind(texture: BindableTexture, location: number): void`
- `bindSource(source: TextureSource, location: number): void`
- `unbind(texture: BindableTexture): void`
- `getGlSource(source: TextureSource): GlTexture`
- `generateCanvas(texture: Texture): ICanvas`
- `getPixels(texture: Texture): GetPixelsOutput`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
- `resetState(): void`
