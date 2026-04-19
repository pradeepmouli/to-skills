# Classes

## filters

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
