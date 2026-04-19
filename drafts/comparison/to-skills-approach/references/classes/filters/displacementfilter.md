# Classes

## filters

### `DisplacementFilter`

A filter that applies a displacement map effect using a sprite's texture.

The DisplacementFilter uses another texture (from a sprite) as a displacement map,
where the red and green channels of each pixel in the map determine how the corresponding
pixel in the filtered object should be offset:

- Red channel controls horizontal displacement
- Green channel controls vertical displacement

Common use cases:

- Creating ripple or wave effects
- Distorting images dynamically
- Implementing heat haze effects
- Creating transition effects
  _extends `Filter`_

```ts
constructor(options: Sprite | DisplacementFilterOptions): DisplacementFilter
```

**Methods:**

- `apply(filterManager: FilterSystem, input: Texture, output: Texture, clearMode: boolean): void` — Applies the filter.

```ts
import { Sprite, DisplacementFilter } from 'pixi.js';

// Create a sprite to use as the displacement map
const displacementSprite = Sprite.from('displacement-map.png');

// Create and configure the filter
const displacementFilter = new DisplacementFilter({
  sprite: displacementSprite,
  scale: { x: 20, y: 20 }
});

// Apply to any display object
container.filters = [displacementFilter];
```
