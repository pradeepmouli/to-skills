# Classes

## rendering

### `PrepareSystem`

The prepare system provides renderer-specific plugins for pre-rendering DisplayObjects. This is useful for
asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.

Do not instantiate this plugin directly. It is available from the `renderer.prepare` property.
_extends `PrepareUpload`_
_implements `System`_

```ts
constructor(renderer: Renderer): PrepareSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "prepare" }`
- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `destroy(): void` — Destroys the plugin, don't use after this.
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing

```ts
import 'pixi.js/prepare';
import { Application, Graphics } from 'pixi.js';

// Create a new application (prepare will be auto-added to renderer)
const app = new Application();
await app.init();
document.body.appendChild(app.view);

// Don't start rendering right away
app.stop();

// Create a display object
const rect = new Graphics().beginFill(0x00ff00).drawRect(40, 40, 200, 200);

// Add to the stage
app.stage.addChild(rect);

// Don't start rendering until the graphic is uploaded to the GPU
app.renderer.prepare.upload(app.stage, () => {
  app.start();
});
```
