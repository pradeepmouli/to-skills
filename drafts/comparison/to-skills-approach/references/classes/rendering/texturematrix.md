# Classes

## rendering

### `TextureMatrix`

Class controls uv mapping from Texture normal space to BaseTexture normal space.

Takes `trim` and `rotate` into account. May contain clamp settings for Meshes and TilingSprite.

Can be used in Texture `uvMatrix` field, or separately, you can use different clamp settings on the same texture.
If you want to add support for texture region of certain feature or filter, that's what you're looking for.

Takes track of Texture changes through `_lastTextureID` private field.
Use `update()` method call to track it from outside.

```ts
constructor(texture: Texture, clampMargin?: number): TextureMatrix
```

**Properties:**

- `mapCoord: Matrix` — Matrix operation that converts texture region coords to texture coords
- `clampOffset: number` — Changes frame clamping
  Works with TilingSprite and Mesh
  Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
- `clampMargin: number` — Changes frame clamping
  Works with TilingSprite and Mesh
  Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
- `uClampFrame: Float32Array` — Clamp region for normalized coords, left-top pixel center in xy , bottom-right in zw.
  Calculated based on clampOffset.
- `uClampOffset: Float32Array` — Normalized clamp offset. Calculated based on clampOffset.
- `_updateID: number` — Tracks Texture frame changes.
- `isSimple: boolean` — If texture size is the same as baseTexture.
  **Methods:**
- `multiplyUvs(uvs: Float32Array, out?: Float32Array): Float32Array` — Multiplies uvs array to transform
- `update(): boolean` — Updates matrices if texture was changed
