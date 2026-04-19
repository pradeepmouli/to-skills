# Classes

## filters

### `NegationBlend`

Implements the Negation blend mode which creates an inverted effect based on the brightness values.

Available as `container.blendMode = 'negation'` after importing `pixi.js/advanced-blend-modes`.

```ts
constructor(): NegationBlend
```

**Properties:**

- `extension: ExtensionMetadata`

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('something.png');
sprite.blendMode = 'negation';
```
