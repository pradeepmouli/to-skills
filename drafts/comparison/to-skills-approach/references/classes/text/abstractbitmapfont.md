# Classes

## text

### `AbstractBitmapFont`

An abstract representation of a bitmap font.
_extends `EventEmitter<BitmapFontEvents<FontType>>`_
_implements `Omit<BitmapFontData, "chars" | "pages" | "fontSize">`_

```ts
constructor<FontType>(): AbstractBitmapFont<FontType>
```

**Properties:**

- `chars: Record<string, CharData>` — The map of characters by character string.
- `lineHeight: number` — The line-height of the font face in pixels.
- `fontFamily: string` — The name of the font face
- `fontMetrics: FontMetrics` — The metrics of the font face.
- `baseLineOffset: number` — The offset of the font face from the baseline.
- `distanceField: { type: "none" | "sdf" | "msdf"; range: number }` — The range and type of the distance field for this font.
- `pages: { texture: Texture }[]` — The map of base page textures (i.e., sheets of glyphs).
- `applyFillAsTint: boolean` — should the fill for this font be applied as a tint to the text.
- `baseMeasurementFontSize: number` — The size of the font face in pixels.
  **Methods:**
- `destroy(destroyTextures: boolean): void`
