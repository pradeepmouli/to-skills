# Classes

## rendering

### `GlBackBufferSystem`

For blend modes you need to know what pixels you are actually drawing to. For this to be possible in WebGL
we need to render to a texture and then present that texture to the screen. This system manages that process.

As the main scene is rendered to a texture, it means we can sample it and copy its pixels,
something not possible on the main canvas.

If antialiasing is set to to true and useBackBuffer is set to true, then the back buffer will be antialiased.
and the main gl context will not.

You only need to activate this back buffer if you are using a blend mode that requires it.

to activate is simple, you pass `useBackBuffer:true` to your render options
_implements `System<GlBackBufferOptions>`_

```ts
constructor(renderer: WebGLRenderer): GlBackBufferSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "backBuffer"; priority: 1 }`
- `defaultOptions: GlBackBufferOptions` — default options for the back buffer system
- `useBackBuffer: boolean` — if true, the back buffer is used
  **Methods:**
- `init(options: GlBackBufferOptions): void`
- `destroy(): void` — destroys the back buffer
