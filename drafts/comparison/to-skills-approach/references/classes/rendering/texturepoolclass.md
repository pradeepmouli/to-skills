# Classes

## rendering

### `TexturePoolClass`

Texture pool, used by FilterSystem and plugins.

Stores collection of temporary pow2 or screen-sized renderTextures

If you use custom RenderTexturePool for your filters, you can use methods
`getFilterTexture` and `returnFilterTexture` same as in default pool

```ts
constructor(textureOptions?: TextureSourceOptions): TexturePoolClass
```

**Properties:**

- `textureOptions: TextureSourceOptions` — The default options for texture pool
- `textureStyle: TextureStyle` — The default texture style for the pool
- `enableFullScreen: boolean` — Allow renderTextures of the same size as screen, not just pow2

Automatically sets to true after `setScreenSize`
**Methods:**

- `createTexture(pixelWidth: number, pixelHeight: number, antialias: boolean, autoGenerateMipmaps: boolean): Texture` — Creates texture with params that were specified in pool constructor.
- `getOptimalTexture(frameWidth: number, frameHeight: number, resolution: number, antialias: boolean, autoGenerateMipmaps: boolean): Texture` — Gets a Power-of-Two render texture or fullScreen texture
- `getSameSizeTexture(texture: Texture, antialias: boolean): Texture<TextureSource<any>>` — Gets a pooled texture matching the dimensions and resolution of the given texture.

This is a convenience wrapper around TexturePoolClass#getOptimalTexture|getOptimalTexture
that copies width, height, and resolution from an existing texture. Useful when a filter needs
a temporary texture the same size as its input (e.g., for multi-pass blur).

- `returnTexture(renderTexture: Texture, resetStyle: boolean): void` — Returns a texture to the pool so it can be reused by future
  TexturePoolClass#getOptimalTexture|getOptimalTexture
  or TexturePoolClass#getSameSizeTexture|getSameSizeTexture calls.

If you modified the texture's style after obtaining it (e.g., changed filtering or wrapping),
pass `resetStyle = true` to restore the pool's default TexturePoolClass#textureStyle|textureStyle.
This prevents style changes from leaking into subsequent consumers of the same pooled texture.

- `clear(destroyTextures?: boolean): void` — Clears the pool.
