# Classes

## scene

### `Culler`

The Culler class is responsible for managing and culling containers.
Culling optimizes rendering performance by skipping objects outside the visible area.

> [!IMPORTANT] culling is not always a golden bullet, it can be more expensive than rendering
> objects that are not visible, so it is best used in scenarios where you have many objects
> that are not visible at the same time, such as in large scenes or games with many sprites.

```ts
constructor(): Culler
```

**Properties:**

- `shared: Culler` — A shared instance of the Culler class. Provides a global culler instance for convenience.
  **Methods:**
- `cull(container: Container, view: RectangleLike, skipUpdateTransform: boolean): void` — Culls the children of a specific container based on the given view rectangle.
  This determines which objects should be rendered and which can be skipped.

```ts
import { Culler, Container, Rectangle } from 'pixi.js';

// Create a culler and container
const culler = new Culler();
const stage = new Container();

// Set up container with culling
stage.cullable = true;
stage.cullArea = new Rectangle(0, 0, 800, 600);

// Add some sprites that will be culled
for (let i = 0; i < 1000; i++) {
  const sprite = Sprite.from('texture.png');
  sprite.x = Math.random() * 2000;
  sprite.y = Math.random() * 2000;
  sprite.cullable = true;
  stage.addChild(sprite);
}

// Cull objects outside view
culler.cull(stage, {
  x: 0,
  y: 0,
  width: 800,
  height: 600
});

// Only visible objects will be rendered
renderer.render(stage);
```
