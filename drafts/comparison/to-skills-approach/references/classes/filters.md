# Classes

## filters

### `ColorBlend`

The final color has the hue and saturation of the top color, while using the luminosity of the bottom color.
The effect preserves gray levels and can be used to colorize the foreground.

Available as `container.blendMode = 'color'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): ColorBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'color';
```

### `ColorBurnBlend`

The final color is the result of inverting the bottom color, dividing the value by the top color,
and inverting that value. A white foreground leads to no change.
A foreground with the inverse color of the backdrop leads to a black final image.
This blend mode is similar to multiply, but the foreground need only be as dark as the inverse
of the backdrop to make the final image black.

Available as `container.blendMode = 'color-burn'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): ColorBurnBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'color-burn';
```

### `ColorDodgeBlend`

The final color is the result of dividing the bottom color by the inverse of the top color.
A black foreground leads to no change.
A foreground with the inverse color of the backdrop leads to a fully lit color.
This blend mode is similar to screen, but the foreground need only be as light as the inverse of the backdrop to create a fully lit color.

Available as `container.blendMode = 'color-dodge'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): ColorDodgeBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'color-dodge';
```

### `DarkenBlend`

The final color is composed of the darkest values of each color channel.

Available as `container.blendMode = 'darken'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): DarkenBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'darken';
```

### `DifferenceBlend`

The final color is the result of subtracting the darker of the two colors from the lighter one.
black layer has no effect, while a white layer inverts the other layer's color.

Available as `container.blendMode = 'difference'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): DifferenceBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'difference';
```

### `DivideBlend`

The Divide blend mode divides the RGB channel values of the bottom layer by those of the top layer.
The darker the top layer, the brighter the bottom layer will appear.
Blending any color with black yields white, and blending with white has no effect

Available as `container.blendMode = 'divide'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): DivideBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'divide';
```

### `ExclusionBlend`

The final color is similar to difference, but with less contrast.
As with difference, a black layer has no effect, while a white layer inverts the other layer's color.

Available as `container.blendMode = 'exclusion'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): ExclusionBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'exclusion';
```

### `HardLightBlend`

The final color is the result of multiply if the top color is darker, or screen if the top color is lighter.
This blend mode is equivalent to overlay but with the layers swapped.
The effect is similar to shining a harsh spotlight on the backdrop.

Available as `container.blendMode = 'hard-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): HardLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'hard-light';
```

### `HardMixBlend`

Hard defines each of the color channel values of the blend color to the RGB values of the base color.
If the sum of a channel is 255, it receives a value of 255; if less than 255, a value of 0.

Available as `container.blendMode = 'hard-mix'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): HardMixBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'hard-mix';
```

### `LightenBlend`

The final color is composed of the lightest values of each color channel.

Available as `container.blendMode = 'lighten'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): LightenBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'lighten';
```

### `LinearBurnBlend`

Looks at the color information in each channel and darkens the base color to
reflect the blend color by increasing the contrast between the two.

Available as `container.blendMode = 'linear-burn'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): LinearBurnBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'linear-burn';
```

### `LinearDodgeBlend`

Looks at the color information in each channel and brightens the base color to reflect the blend color by decreasing contrast between the two.

Available as `container.blendMode = 'linear-dodge'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): LinearDodgeBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'linear-dodge';
```

### `LinearLightBlend`

Increase or decrease brightness by burning or dodging color values, based on the blend color

Available as `container.blendMode = 'linear-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): LinearLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'linear-light';
```

### `LuminosityBlend`

The final color has the luminosity of the top color, while using the hue and saturation of the bottom color.
This blend mode is equivalent to color, but with the layers swapped.

Available as `container.blendMode = 'luminosity'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): LuminosityBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'luminosity';
```

### `NegationBlend`

Implements the Negation blend mode which creates an inverted effect based on the brightness values.

Available as `container.blendMode = 'negation'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): NegationBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'negation';
```

### `OverlayBlend`

The final color is the result of multiply if the bottom color is darker, or screen if the bottom color is lighter.
This blend mode is equivalent to hard-light but with the layers swapped.

Available as `container.blendMode = 'overlay'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): OverlayBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'overlay';
```

### `PinLightBlend`

Replaces colors based on the blend color.

Available as `container.blendMode = 'pin-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): PinLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'pin-light';
```

### `SaturationBlend`

The final color has the saturation of the top color, while using the hue and luminosity of the bottom color.
A pure gray backdrop, having no saturation, will have no effect.

Available as `container.blendMode = 'saturation'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): SaturationBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'saturation';
```

### `SoftLightBlend`

The final color is similar to hard-light, but softer. This blend mode behaves similar to hard-light.
The effect is similar to shining a diffused spotlight on the backdrop.

Available as `container.blendMode = 'soft-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): SoftLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'soft-light';
```

### `SubtractBlend`

Subtracts the blend from the base color using each color channel

Available as `container.blendMode = 'subtract'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): SubtractBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'subtract';
```

### `VividLightBlend`

Darkens values darker than 50% gray and lightens those brighter than 50% gray, creating a dramatic effect.
It's essentially an extreme version of the Overlay mode, with a significant impact on midtones

Available as `container.blendMode = 'vivid-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): VividLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'vivid-light';
```

### `AlphaFilter`

Simplest filter - applies alpha.

Use this instead of Container's alpha property to avoid visual layering of individual elements.
AlphaFilter applies alpha evenly across the entire display object and any opaque elements it contains.
If elements are not opaque, they will blend with each other anyway.

Very handy if you want to use common features of all filters:

1. Assign a blendMode to this filter, blend all elements inside display object with background.

2. To use clipping in display coordinates, assign a filterArea to the same container that has this filter.
   _extends `Filter`_

```ts
constructor(options?: AlphaFilterOptions): AlphaFilter
```

**Properties:**

- `defaultOptions: AlphaFilterOptions` — Default options for the AlphaFilter.

```ts
import { AlphaFilter } from 'pixi.js';

const filter = new AlphaFilter({ alpha: 0.5 });
sprite.filters = filter;

// update alpha
filter.alpha = 0.8;
```

### `BlurFilter`

The BlurFilter applies a Gaussian blur to an object.
The strength of the blur can be set for the x-axis and y-axis separately.
_extends `Filter`_

```ts
constructor(options?: BlurFilterOptions): BlurFilter
```

**Properties:**

- `defaultOptions: Partial<BlurFilterOptions>` — Default blur filter options
- `blurXFilter: BlurFilterPass` — The horizontal blur filter
- `blurYFilter: BlurFilterPass` — The vertical blur filter
  **Methods:**
- `apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void` — Applies the filter.

```ts
import { BlurFilter } from 'pixi.js';

// Create with default settings
const filter = new BlurFilter();

// Create with custom settings
const filter = new BlurFilter({
  strength: 8, // Overall blur strength
  quality: 4, // Blur quality (higher = better but slower)
  kernelSize: 5 // Size of blur kernel matrix
});

// Apply to a display object
sprite.filters = [filter];

// Update properties
filter.strength = 10; // Set both X and Y blur
filter.strengthX = 5; // Set only horizontal blur
filter.strengthY = 15; // Set only vertical blur
filter.quality = 2; // Adjust quality

// Enable edge pixel clamping
filter.repeatEdgePixels = true;
```

### `BlurFilterPass`

The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
_extends `Filter`_

```ts
constructor(options: BlurFilterPassOptions): BlurFilterPass
```

**Properties:**

- `defaultOptions: Partial<BlurFilterPassOptions>` — Default blur filter pass options
- `horizontal: boolean` — Do pass along the x-axis (`true`) or y-axis (`false`).
- `passes: number` — The number of passes to run the filter.
- `strength: number` — The strength of the blur filter.
- `legacy: boolean` — Whether to use legacy blur pass behavior.
- `padding: number` — The padding of the filter. Some filters require extra space to breath such as a blur.
  Increasing this will add extra width and height to the bounds of the object that the
  filter is applied to.
- `antialias: FilterAntialias` — should the filter use antialiasing?
- `enabled: boolean` — If enabled is true the filter is applied, if false it will not.
- `resolution: number | "inherit"` — The resolution of the filter. Setting this to be lower will lower the quality but
  increase the performance of the filter.
- `blendRequired: boolean` — Whether or not this filter requires the previous render texture for blending.
- `clipToViewport: boolean` — Clip texture into viewport or not
- `uid: number` — A unique identifier for the shader
- `gpuProgram: GpuProgram` — An instance of the GPU program used by the WebGPU renderer
- `glProgram: GlProgram` — An instance of the GL program used by the WebGL renderer
- `compatibleRenderers: number` — A number that uses two bits on whether the shader is compatible with the WebGL renderer and/or the WebGPU renderer.
  0b00 - not compatible with either
  0b01 - compatible with WebGL
  0b10 - compatible with WebGPU
  This is automatically set based on if a GlProgram or GpuProgram is provided.
- `groups: Record<number, BindGroup>`
- `resources: Record<string, any>` — A record of the resources used by the shader.
  **Methods:**
- `from(options: FilterOptions & ShaderFromResources): Filter` — A short hand function to create a filter based of a vertex and fragment shader src.
- `apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void` — Applies the filter.
- `addResource(name: string, groupIndex: number, bindIndex: number): void` — Sometimes a resource group will be provided later (for example global uniforms)

<!-- truncated -->
