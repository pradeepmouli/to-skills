# Classes

## filters

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
