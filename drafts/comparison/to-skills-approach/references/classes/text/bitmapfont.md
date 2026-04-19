# Classes

## text

### `BitmapFont`

A BitmapFont object represents a particular font face, size, and style.
This class handles both pre-loaded bitmap fonts and dynamically generated ones.
_extends `AbstractBitmapFont<BitmapFont>`_

```ts
constructor(options: BitmapFontOptions, url?: string): BitmapFont
```

**Properties:**

- `url: string` (optional) — The URL from which the font was loaded, if applicable.
  This is useful for tracking font sources and reloading.
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
- `install(options: BitmapFontInstallOptions): void` — Generates and installs a bitmap font with the specified options.
  The font will be cached and available for use in BitmapText objects.
- `uninstall(name: string): void` — Uninstalls a bitmap font from the cache.
  This frees up memory and resources associated with the font.
- `destroy(): void` — Destroys the BitmapFont object.

```ts
import { BitmapFont, Texture } from 'pixi.js';

// Create a bitmap font from loaded textures and data
const font = new BitmapFont({
  data: {
    pages: [{ id: 0, file: 'font.png' }],
    chars: {
      A: {
        id: 65,
        page: 0,
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        xOffset: 0,
        yOffset: 0,
        xAdvance: 32,
        letter: 'A'
      }
    },
    fontSize: 32,
    lineHeight: 36,
    baseLineOffset: 26,
    fontFamily: 'MyFont',
    distanceField: {
      type: 'msdf',
      range: 4
    }
  },
  textures: [Texture.from('font.png')]
});

// Install a font for global use
BitmapFont.install({
  name: 'MyCustomFont',
  style: {
    fontFamily: 'Arial',
    fontSize: 32,
    fill: '#ffffff',
    stroke: { color: '#000000', width: 2 }
  }
});

// Uninstall when no longer needed
BitmapFont.uninstall('MyCustomFont');
```
