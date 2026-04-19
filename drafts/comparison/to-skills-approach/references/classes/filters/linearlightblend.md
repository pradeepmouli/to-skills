# Classes

## filters

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
