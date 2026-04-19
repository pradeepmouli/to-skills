# Classes

## filters

### `PinLightBlend`

Replaces colors based on the blend color.

Available as `container.blendMode = 'pin-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): PinLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'pin-light';
```
