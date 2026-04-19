# Classes

## filters

### `SubtractBlend`

Subtracts the blend from the base color using each color channel

Available as `container.blendMode = 'subtract'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): SubtractBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'subtract';
```
