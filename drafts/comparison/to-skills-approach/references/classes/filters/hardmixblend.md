# Classes

## filters

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
