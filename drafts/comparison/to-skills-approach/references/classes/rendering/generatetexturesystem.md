# Classes

## rendering

### `GenerateTextureSystem`

System that manages the generation of textures from display objects in the renderer.
This system is responsible for creating reusable textures from containers, sprites, and other display objects.
Available through `renderer.textureGenerator`.
_implements `System`_

```ts
constructor(renderer: Renderer): GenerateTextureSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "textureGenerator" }`
  **Methods:**
- `generateTexture(options: Container<ContainerChild> | GenerateTextureOptions): RenderTexture` — Creates a texture from a display object that can be used for creating sprites and other textures.
  This is particularly useful for optimizing performance when a complex container needs to be reused.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass

```ts
import { Application, Sprite, Graphics } from 'pixi.js';

const app = new Application();
await app.init();

// Create a complex display object
const container = new Container();

const graphics = new Graphics().circle(0, 0, 50).fill('red');

const sprite = new Sprite(texture);
sprite.x = 100;

container.addChild(graphics, sprite);

// Generate a texture from the container
const generatedTexture = app.renderer.textureGenerator.generateTexture({
  target: container,
  resolution: 2,
  antialias: true
});

// Use the generated texture
const newSprite = new Sprite(generatedTexture);
app.stage.addChild(newSprite);

// Clean up when done
generatedTexture.destroy(true);
```

Features:

- Convert any display object to a texture
- Support for custom regions and resolutions
- Anti-aliasing support
- Background color configuration
- Texture source options customization

Common Use Cases:

- Creating texture atlases dynamically
- Caching complex container content
- Generating thumbnails
- Creating reusable textures from rendered content

Performance Considerations:

- Generating textures is relatively expensive
- Cache results when possible
- Be mindful of resolution and size
- Clean up unused textures
