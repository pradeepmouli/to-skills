# Classes

## filters

### `OverlayBlend`

The final color is the result of multiply if the bottom color is darker, or screen if the bottom color is lighter.
This blend mode is equivalent to hard-light but with the layers swapped.

Available as `container.blendMode = 'overlay'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): OverlayBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'overlay';
```
