# Classes

## filters

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
