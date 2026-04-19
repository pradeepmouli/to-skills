# Classes

## color

### `Color`

Color utility class for managing colors in various formats. Provides a unified way to work
with colors across your PixiJS application.

Features:

- Accepts multiple color formats (hex, RGB, HSL, etc.)
- Automatic format conversion
- Color manipulation methods
- Component access (r,g,b,a)
- Chainable operations

```ts
constructor(value: ColorSource): Color
```

**Properties:**

- `shared: Color` — Static shared Color instance used for utility operations. This is a singleton color object
  that can be reused to avoid creating unnecessary Color instances.
  > [!IMPORTANT] You should be careful when using this shared instance, as it is mutable and can be
  > changed by any code that uses it.
  >
  > It is best used for one-off color operations or temporary transformations.
  > For persistent colors, create your own Color instance instead.
  > **Methods:**
- `isColorLike(value: unknown): value is ColorSource` — Check if a value can be interpreted as a valid color format.
  Supports all color formats that can be used with the Color class.
- `setValue(value: ColorSource): this` — Sets the color value and returns the instance for chaining.

This is a chainable version of setting the `value` property.

- `toRgba(): RgbaColor` — Convert to a RGBA color object with normalized components (0-1).
- `toRgb(): RgbColor` — Convert to a RGB color object with normalized components (0-1).

Alpha component is omitted in the output.

- `toRgbaString(): string` — Convert to a CSS-style rgba string representation.

RGB components are scaled to 0-255 range, alpha remains 0-1.

- `toUint8RgbArray<T>(out?: T): T` — Convert to an [R, G, B] array of clamped uint8 values (0 to 255).
- `toArray<T>(out?: T): T` — Convert to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
- `toRgbArray<T>(out?: T): T` — Convert to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
- `toNumber(): number` — Convert to a hexadecimal number.
- `toBgrNumber(): number` — Convert to a BGR number.

Useful for platforms that expect colors in BGR format.

- `toLittleEndianNumber(): number` — Convert to a hexadecimal number in little endian format (e.g., BBGGRR).

Useful for platforms that expect colors in little endian byte order.

- `multiply(value: ColorSource): this` — Multiply with another color.

This action is destructive and modifies the original color.

- `premultiply(alpha: number, applyToRGB?: boolean): this` — Converts color to a premultiplied alpha format.

This action is destructive and modifies the original color.

- `toPremultiplied(alpha: number, applyToRGB?: boolean): number` — Returns the color as a 32-bit premultiplied alpha integer.

Format: 0xAARRGGBB

- `toHex(): string` — Convert to a hexadecimal string (6 characters).
- `toHexa(): string` — Convert to a hexadecimal string with alpha (8 characters).
- `setAlpha(alpha: number): this` — Set alpha (transparency) value while preserving color components.

Provides a chainable interface for setting alpha.

```js
import { Color } from 'pixi.js';

new Color('red').toArray(); // [1, 0, 0, 1]
new Color(0xff0000).toArray(); // [1, 0, 0, 1]
new Color('ff0000').toArray(); // [1, 0, 0, 1]
new Color('#f00').toArray(); // [1, 0, 0, 1]
new Color('0xff0000ff').toArray(); // [1, 0, 0, 1]
new Color('#f00f').toArray(); // [1, 0, 0, 1]
new Color({ r: 255, g: 0, b: 0, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
new Color('rgb(255, 0, 0, 0.5)').toArray(); // [1, 0, 0, 0.5]
new Color([1, 1, 1]).toArray(); // [1, 1, 1, 1]
new Color([1, 0, 0, 0.5]).toArray(); // [1, 0, 0, 0.5]
new Color(new Float32Array([1, 0, 0, 0.5])).toArray(); // [1, 0, 0, 0.5]
new Color(new Uint8Array([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
new Color(new Uint8ClampedArray([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
new Color({ h: 0, s: 100, l: 50, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
new Color('hsl(0, 100%, 50%, 50%)').toArray(); // [1, 0, 0, 0.5]
new Color({ h: 0, s: 100, v: 100, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]

// Convert between formats
const color = new Color('red');
color.toHex(); // "#ff0000"
color.toRgbString(); // "rgb(255,0,0,1)"
color.toNumber(); // 0xff0000

// Access components
color.red; // 1
color.green; // 0
color.blue; // 0
color.alpha; // 1

// Chain operations
color.setAlpha(0.5).multiply([0.5, 0.5, 0.5]).premultiply(0.8);
```
