# Classes

## filters

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
