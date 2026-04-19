# Classes

## filters

### `ColorMatrixFilter`

The ColorMatrixFilter class lets you apply color transformations to display objects using a 5x4 matrix.
The matrix transforms the RGBA color and alpha values of every pixel to produce a new set of values.

The class provides convenient methods for common color adjustments like brightness, contrast, saturation,
and various photo filter effects.
_extends `Filter`_

```ts
constructor(options: FilterOptions): ColorMatrixFilter
```

**Methods:**

- `brightness(b: number, multiply: boolean): void` — Adjusts the brightness of a display object.

The brightness adjustment works by multiplying the RGB channels by a scalar value while keeping
the alpha channel unchanged. Values below 1 darken the image, while values above 1 brighten it.

- `tint(color: ColorSource, multiply?: boolean): void` — Sets each channel on the diagonal of the color matrix to apply a color tint.

This method provides a way to tint display objects using the color matrix filter, similar to
the tint property available on Sprites and other display objects. The tint is applied by
scaling the RGB channels of each pixel.

- `greyscale(scale: number, multiply: boolean): void` — Converts the display object to greyscale by applying a weighted matrix transformation.

The greyscale effect works by setting equal RGB values for each pixel based on the scale parameter,
effectively removing color information while preserving luminance.

- `grayscale(scale: number, multiply: boolean): void` — Converts the display object to grayscale by applying a weighted matrix transformation.

The grayscale effect works by setting equal RGB values for each pixel based on the scale parameter,
effectively removing color information while preserving luminance.

- `blackAndWhite(multiply: boolean): void` — Converts the display object to pure black and white using a luminance-based threshold.

This method applies a matrix transformation that removes all color information and reduces
the image to just black and white values based on the luminance of each pixel. The transformation
uses standard luminance weightings: 30% red, 60% green, and 10% blue.

- `hue(rotation: number, multiply: boolean): void` — Adjusts the hue of the display object by rotating the color values around the color wheel.

This method uses an optimized matrix transformation that accurately rotates the RGB color space
around its luminance axis. The implementation is based on RGB cube rotation in 3D space, providing
better results than traditional matrices with magic luminance constants.

- `contrast(amount: number, multiply: boolean): void` — Adjusts the contrast of the display object by modifying the separation between dark and bright values.

This method applies a matrix transformation that affects the difference between dark and light areas
in the image. Increasing contrast makes shadows darker and highlights brighter, while decreasing
contrast brings shadows up and highlights down, reducing the overall dynamic range.

- `saturate(amount: number, multiply?: boolean): void` — Adjusts the saturation of the display object by modifying color separation.

This method applies a matrix transformation that affects the intensity of colors.
Increasing saturation makes colors more vivid and intense, while decreasing saturation
moves colors toward grayscale.

- `desaturate(): void` — Completely removes color information from the display object, creating a grayscale version.

This is a convenience method that calls `saturate(-1)` internally. The transformation preserves
the luminance of the original image while removing all color information.

- `negative(multiply: boolean): void` — Creates a negative effect by inverting all colors in the display object.

This method applies a matrix transformation that inverts the RGB values of each pixel
while preserving the alpha channel. The result is similar to a photographic negative.

- `sepia(multiply: boolean): void` — Applies a sepia tone effect to the display object, creating a warm brown tint reminiscent of vintage photographs.

This method applies a matrix transformation that converts colors to various shades of brown while
preserving the original luminance values.

- `technicolor(multiply: boolean): void` — Applies a Technicolor-style effect that simulates the early color motion picture process.

This method applies a matrix transformation that recreates the distinctive look of the
Technicolor process. The effect produces highly
saturated colors with a particular emphasis on reds, greens, and blues.

- `polaroid(multiply: boolean): void` — Applies a vintage Polaroid camera effect to the display object.

This method applies a matrix transformation that simulates the distinctive look of
Polaroid instant photographs, characterized by slightly enhanced contrast, subtle color shifts,
and a warm overall tone.

- `toBGR(multiply: boolean): void` — Swaps the red and blue color channels in the display object.

This method applies a matrix transformation that exchanges the red and blue color values
while keeping the green channel and alpha unchanged.

- `kodachrome(multiply: boolean): void` — Applies a Kodachrome color effect that simulates the iconic film stock.

This method applies a matrix transformation that recreates the distinctive look of Kodachrome film,
known for its rich, vibrant colors and excellent image preservation qualities. The effect emphasizes
reds and blues while producing deep, true blacks.

- `browni(multiply: boolean): void` — Applies a stylized brown-tinted effect to the display object.

This method applies a matrix transformation that creates a rich, warm brown tone
with enhanced contrast and subtle color shifts.

- `vintage(multiply: boolean): void` — Applies a vintage photo effect that simulates old photography techniques.

This method applies a matrix transformation that creates a nostalgic, aged look
with muted colors, enhanced warmth, and subtle vignetting.

- `colorTone(desaturation: number, toned: number, lightColor: ColorSource, darkColor: ColorSource, multiply: boolean): void` — We don't know exactly what it does, kind of gradient map, but funny to play with!
- `night(intensity: number, multiply: boolean): void` — Applies a night vision effect to the display object.

This method applies a matrix transformation that simulates night vision by enhancing
certain color channels while suppressing others, creating a green-tinted effect
similar to night vision goggles.

- `predator(amount: number, multiply: boolean): void` — Predator effect

Erase the current matrix by setting a new independent one

- `lsd(multiply: boolean): void` — Applies a psychedelic color effect that creates dramatic color shifts.

This method applies a matrix transformation that produces vibrant colors
through channel mixing and amplification. Creates an effect reminiscent of
color distortions in psychedelic art.

- `reset(): void` — Resets the color matrix filter to its default state.

This method resets all color transformations by setting the matrix back to its identity state.
The identity matrix leaves colors unchanged, effectively removing all previously applied effects.

```js
import { ColorMatrixFilter } from 'pixi.js';

// Create a new color matrix filter
const colorMatrix = new ColorMatrixFilter();

// Apply it to a container
container.filters = [colorMatrix];

// Adjust contrast
colorMatrix.contrast(2);

// Chain multiple effects
colorMatrix
  .saturate(0.5) // 50% saturation
  .brightness(1.2) // 20% brighter
  .hue(90); // 90 degree hue rotation
```

Common use cases:

- Adjusting brightness, contrast, or saturation
- Applying color tints or color grading
- Creating photo filter effects (sepia, negative, etc.)
- Converting to grayscale
- Implementing dynamic day/night transitions
