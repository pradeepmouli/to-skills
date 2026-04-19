# Classes

## rendering

### `GlRenderTarget`

Represents a render target.

```ts
constructor(): GlRenderTarget
```

**Properties:**

- `width: number`
- `height: number`
- `msaa: boolean`
- `framebuffer: WebGLFramebuffer`
- `resolveTargetFramebuffer: WebGLFramebuffer`
- `msaaRenderBuffer: WebGLRenderbuffer[]`
- `depthStencilRenderBuffer: WebGLRenderbuffer`
