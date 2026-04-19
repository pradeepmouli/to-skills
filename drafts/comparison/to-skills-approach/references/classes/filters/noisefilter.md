# Classes

## filters

### `NoiseFilter`

A filter that adds configurable random noise to rendered content.

This filter generates pixel noise based on a noise intensity value and an optional seed.
It can be used to create various effects like film grain, static, or texture variation.

Based on: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
_extends `Filter`_

```ts
constructor(options: NoiseFilterOptions): NoiseFilter
```

**Properties:**

- `defaultOptions: NoiseFilterOptions` — The default configuration options for the NoiseFilter.

These values will be used when no specific options are provided to the constructor.
You can override any of these values by passing your own options object.

```ts
import { NoiseFilter } from 'pixi.js';

// Create with options
const filter = new NoiseFilter({
  noise: 0.5, // 50% noise intensity
  seed: 12345 // Fixed seed for consistent noise
});

// Apply to a display object
sprite.filters = [filter];

// Adjust noise dynamically
filter.noise = 0.8; // Increase noise
filter.seed = Math.random(); // New random pattern
```
