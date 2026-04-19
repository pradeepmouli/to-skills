# Classes

## filters

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
