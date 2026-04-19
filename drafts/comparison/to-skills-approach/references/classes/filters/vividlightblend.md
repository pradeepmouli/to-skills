# Classes

## filters

### `VividLightBlend`

Darkens values darker than 50% gray and lightens those brighter than 50% gray, creating a dramatic effect.
It's essentially an extreme version of the Overlay mode, with a significant impact on midtones

Available as `container.blendMode = 'vivid-light'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): VividLightBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'vivid-light';
```
