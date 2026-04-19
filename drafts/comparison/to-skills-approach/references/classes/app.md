# Classes

## app

### `Application`

Convenience class to create a new PixiJS application.

The Application class is the main entry point for creating a PixiJS application. It handles the setup of all core
components needed to start rendering and managing your game or interactive experience.

Key features:

- Automatically creates and manages the renderer
- Provides a stage (root container) for your display objects
- Handles canvas creation and management
- Supports plugins for extending functionality
  - ResizePlugin for automatic resizing
  - TickerPlugin for managing frame updates
  - CullerPlugin for culling off-screen objects
    _extends `Application`_

```ts
constructor<R>(): Application<R>
```

**Properties:**

- `stage: Container` — The root display container for your application.
  All visual elements should be added to this container or its children.
- `renderer: R` — The renderer instance that handles all drawing operations.

Unless specified, it will automatically create a WebGL renderer if available.
If WebGPU is available and the `preference` is set to `webgpu`, it will create a WebGPU renderer.

- `resizeTo: HTMLElement | Window` — Element to automatically resize the renderer to.
- `ticker: Ticker` — The application's ticker instance that manages the update/render loop.
  **Methods:**
- `init(options?: Partial<ApplicationOptions>): Promise<void>` — Initializes the PixiJS application with the specified options.

This method must be called after creating a new Application instance.

- `render(): void` — Renders the current stage to the screen.

When using the default setup with TickerPlugin (enabled by default), you typically don't need to call
this method directly as rendering is handled automatically.

Only use this method if you've disabled the TickerPlugin or need custom
render timing control.

- `destroy(rendererDestroyOptions: RendererDestroyOptions, options: DestroyOptions): void` — Destroys the application and all of its resources.

This method should be called when you want to completely
clean up the application and free all associated memory.

- `resize(): void` — Element to automatically resize the renderer to.
  > [!IMPORTANT]
  > You do not need to call this method manually in most cases.
  > A `resize` event will be dispatched automatically when the `resizeTo` element changes size.
- `queueResize(): void` — Queue a resize operation for the next animation frame. This method is throttled
  and optimized for frequent calls.
  > [!IMPORTANT]
  > You do not need to call this method manually in most cases.
  > A `resize` event will be dispatched automatically when the `resizeTo` element changes size.
- `cancelResize(): void` — Cancel any pending resize operation that was queued with `queueResize()`.
- `stop(): void` — Stops the render/update loop.
- `start(): void` — Starts the render/update loop.

```js
import { Assets, Application, Sprite } from 'pixi.js';

// Create a new application
const app = new Application();

// Initialize with options
await app.init({
  width: 800, // Canvas width
  height: 600, // Canvas height
  backgroundColor: 0x1099bb, // Background color
  antialias: true, // Enable antialiasing
  resolution: 1, // Resolution / device pixel ratio
  preference: 'webgl' // or 'webgpu' // Renderer preference
});

// Add the canvas to your webpage
document.body.appendChild(app.canvas);

// Start adding content to your application
const texture = await Assets.load('your-image.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
```

> [!IMPORTANT] From PixiJS v8.0.0, the application must be initialized using the async `init()` method
> rather than passing options to the constructor.

### `ResizePlugin`

Middleware for Application's resize functionality. This plugin handles automatic
and manual resizing of your PixiJS application.

Adds the following features to Application:

- `resizeTo`: Set an element to automatically resize to
- `resize`: Manually trigger a resize
- `queueResize`: Queue a resize for the next animation frame
- `cancelResize`: Cancel a queued resize

```ts
constructor(): ResizePlugin
```

**Properties:**

- `extension: ExtensionMetadata`
  **Methods:**
- `init(options?: ResizePluginOptions): void` — Initialize the plugin with scope of application instance
- `destroy(): void` — Clean up the ticker, scoped to application

```ts
import { Application, ResizePlugin } from 'pixi.js';

// Create application
const app = new Application();

// Example 1: Auto-resize to window
await app.init({ resizeTo: window });

// Example 2: Auto-resize to specific element
const container = document.querySelector('#game-container');
await app.init({ resizeTo: container });

// Example 3: Change resize target at runtime
app.resizeTo = window; // Enable auto-resize to window
app.resizeTo = null; // Disable auto-resize
```

### `TickerPlugin`

Middleware for Application's Ticker functionality. This plugin manages the
animation loop and update cycle of your PixiJS application.

Adds the following features to Application:

- `ticker`: Access to the application's ticker
- `start`: Start the animation loop
- `stop`: Stop the animation loop

```ts
constructor(): TickerPlugin
```

**Properties:**

- `extension: ExtensionMetadata`
  **Methods:**
- `init(options?: ApplicationOptions): void` — Initialize the plugin with scope of application instance
- `destroy(): void` — Clean up the ticker, scoped to application.

```ts
import { Application, TickerPlugin, extensions } from 'pixi.js';

// Create application
const app = new Application();

// Example 1: Basic ticker usage (default autoStart)
await app.init({ autoStart: true }); // Starts ticker automatically

// Example 2: Manual ticker control
await app.init({ autoStart: false }); // Don't start automatically
app.start(); // Start manually
app.stop(); // Stop manually

// Example 3: Add custom update logic
app.ticker.add((ticker) => {
  // Run every frame, delta is the time since last update
  sprite.rotation += 0.1 * ticker.deltaTime;
});

// Example 4: Control update priority
import { UPDATE_PRIORITY } from 'pixi.js';

app.ticker.add(
  (ticker) => {
    // Run before normal priority updates
  },
  null,
  UPDATE_PRIORITY.HIGH
);

// Example 5: One-time update
app.ticker.addOnce(() => {
  console.log('Runs next frame only');
});
```

### `CullerPlugin`

An Application plugin that automatically culls (hides) display objects that are outside
the visible screen area. This improves performance by not rendering objects that aren't visible.

Key Features:

- Automatic culling based on screen boundaries
- Configurable culling areas and behavior per container
- Can improve rendering performance

```ts
constructor(): CullerPlugin
```

**Properties:**

- `extension: ExtensionMetadata`
  **Methods:**
- `init(options?: ApplicationOptions): void` — Initialize the plugin with scope of application instance

```ts
import { Application, CullerPlugin, Container, Rectangle } from 'pixi.js';

// Register the plugin
extensions.add(CullerPlugin);

// Create application
const app = new Application();
await app.init({...});

// Create a container with culling enabled
const container = new Container();
container.cullable = true;         // Enable culling for this container
container.cullableChildren = true; // Enable culling for children (default)
app.stage.addChild(container);

// Optional: Set custom cull area to avoid expensive bounds calculations
container.cullArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

// Add many sprites to the group
for (let j = 0; j < 100; j++) {
    const sprite = Sprite.from('texture.png');
    sprite.x = Math.random() * 2000;
    sprite.y = Math.random() * 2000;

    sprite.cullable = true; // Enable culling for each sprite

    // Set cullArea if needed
    // sprite.cullArea = new Rectangle(0, 0, 100, 100); // Optional

    // Add to container
    container.addChild(sprite);
}
```
