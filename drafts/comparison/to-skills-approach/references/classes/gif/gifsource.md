# Classes

## gif

### `GifSource`

Resource provided to GifSprite instances. This is very similar to using a shared
Texture between Sprites. This source contains all the frames and animation needed
to support playback.

```ts
constructor(frames: GifFrame[]): GifSource
```

**Properties:**

- `width: number` — Width of the animation
- `height: number` — Height of the animation
- `duration: number` — The total time to play the animation in milliseconds
- `frames: GifFrame[]` — Animation frames
- `textures: Texture<CanvasSource>[]` — Textures
- `totalFrames: number` — Total number of frames in the animation
  **Methods:**
- `from(buffer: ArrayBuffer, options?: GifBufferOptions): GifSource` — Create an animated GIF animation from a GIF image's ArrayBuffer. The easiest way to get
  the buffer is to use Assets.
- `destroy(): void` — Destroy animation data and don't use after this
