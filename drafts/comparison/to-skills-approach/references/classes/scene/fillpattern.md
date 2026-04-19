# Classes

## scene

### `FillPattern`

A class that represents a fill pattern for use in Text and Graphics fills.
It allows for textures to be used as patterns, with optional repetition modes.
_implements `CanvasPattern`_

```ts
constructor(texture: Texture, repetition?: PatternRepetition): FillPattern
```

**Properties:**

- `transform: Matrix` — The transform matrix applied to the pattern
  **Methods:**
- `setTransform(transform?: Matrix): void` — Sets the transform for the pattern
- `destroy(): void` — Destroys the fill pattern, releasing resources. This will also destroy the internal texture.

```ts
const txt = await Assets.load('https://pixijs.com/assets/bg_scene_rotate.jpg');
const pat = new FillPattern(txt, 'repeat');

const textPattern = new Text({
  text: 'PixiJS',
  style: {
    fontSize: 36,
    fill: 0xffffff,
    stroke: { fill: pat, width: 10 }
  }
});

textPattern.y = textGradient.height;
```
