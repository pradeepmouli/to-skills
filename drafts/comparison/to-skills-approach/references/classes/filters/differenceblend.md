# Classes

## filters

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
