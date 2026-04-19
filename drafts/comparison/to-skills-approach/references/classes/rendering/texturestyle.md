# Classes

## rendering

### `TextureStyle`

A texture style describes how a texture should be sampled by a shader.
_extends `EventEmitter<{ change: TextureStyle; destroy: TextureStyle }>`_
_implements `BindResource`_

```ts
constructor(options: TextureStyleOptions): TextureStyle
```

**Properties:**

- `defaultOptions: TextureStyleOptions` — default options for the style
- `addressModeU: WRAP_MODE` (optional)
- `addressModeV: WRAP_MODE` (optional)
- `addressModeW: WRAP_MODE` (optional) — Specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively.
- `magFilter: SCALE_MODE` (optional) — Specifies the sampling behavior when the sample footprint is smaller than or equal to one texel.
- `minFilter: SCALE_MODE` (optional) — Specifies the sampling behavior when the sample footprint is larger than one texel.
- `mipmapFilter: SCALE_MODE` (optional) — Specifies behavior for sampling between mipmap levels.
- `lodMinClamp: number` (optional)
- `lodMaxClamp: number` (optional) — Specifies the minimum and maximum levels of detail, respectively, used internally when sampling a texture.
- `compare: COMPARE_FUNCTION` (optional) — When provided the sampler will be a comparison sampler with the specified
  COMPARE_FUNCTION.
  Note: Comparison samplers may use filtering, but the sampling results will be
  implementation-dependent and may differ from the normal filtering rules.
- `destroyed: boolean` — Has the style been destroyed?
  **Methods:**
- `update(): void`
- `destroy(): void` — Destroys the style
