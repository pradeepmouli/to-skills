# Classes

## rendering

### `GlTexture`

Internal texture for WebGL context

```ts
constructor(texture: WebGLTexture): GlTexture
```

**Properties:**

- `target: GL_TARGETS`
- `texture: WebGLTexture` — The WebGL texture.
- `width: number` — Width of texture that was used in texImage2D.
- `height: number` — Height of texture that was used in texImage2D.
- `mipmap: boolean` — Whether mip levels has to be generated.
- `type: number` — Type copied from texture source.
- `internalFormat: number` — Type copied from texture source.
- `samplerType: number` — Type of sampler corresponding to this texture. See SAMPLER_TYPES
- `format: GL_FORMATS`
  **Methods:**
- `destroy(): void`
