# Classes

## rendering

### `ExtractSystem`

System for exporting content from a renderer. It provides methods to extract content as images,
canvases, or raw pixel data. Available through `renderer.extract`.
_implements `System`_

```ts
constructor(renderer: Renderer): ExtractSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "extract" }`
- `defaultImageOptions: ImageOptions` — Default options for image extraction.
  **Methods:**
- `image(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractImageOptions): Promise<ImageLike>` — Creates an IImage from a display object or texture.
- `base64(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractImageOptions): Promise<string>` — Converts the target into a base64 encoded string.

This method works by first creating
a canvas using `Extract.canvas` and then converting it to a base64 string.

- `canvas(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractOptions): ICanvas` — Creates a Canvas element, renders the target to it and returns it.
  This method is useful for creating static images or when you need direct canvas access.
- `pixels(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractOptions): GetPixelsOutput` — Returns a one-dimensional array containing the pixel data of the entire texture in RGBA order,
  with integer values between 0 and 255 (inclusive).
  > [!NOE] The returned array is a flat Uint8Array where every 4 values represent RGBA
- `texture(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractOptions): Texture` — Creates a texture from a display object or existing texture.

This is useful for creating
reusable textures from rendered content or making copies of existing textures.

> [!NOTE] The returned texture should be destroyed when no longer needed

- `download(options: Container<ContainerChild> | Texture<TextureSource<any>> | ExtractDownloadOptions): void` — Extracts and downloads content from the renderer as an image file.
  This is a convenient way to save screenshots or export rendered content.
  > [!NOTE] The download will use PNG format regardless of the filename extension
- `log(options: Container<ContainerChild> | Texture<TextureSource<any>> | (ExtractOptions & { width?: number; })): void` — Logs the target to the console as an image. This is a useful way to debug what's happening in the renderer.
  The image will be displayed in the browser's console using CSS background images.
- `destroy(): void` — Generic destroy methods to be overridden by the subclass

```ts
import { Application, Graphics } from 'pixi.js';

// Create a new application
const app = new Application();
await app.init();

// Draw something to extract
const graphics = new Graphics().circle(0, 0, 50).fill(0xff0000);

// Basic extraction examples
const image = await app.renderer.extract.image(graphics); // As IImage (HTMLImageElement)
const canvas = app.renderer.extract.canvas(graphics); // As Canvas
const pixels = app.renderer.extract.pixels(graphics); // As pixel data
const base64 = await app.renderer.extract.base64(graphics); // As base64 string

// Advanced extraction with options
const customImage = await app.renderer.extract.image({
  target: graphics,
  format: 'png',
  resolution: 2,
  frame: new Rectangle(0, 0, 100, 100),
  clearColor: '#00000000'
});

// Download content
app.renderer.extract.download({
  target: graphics,
  filename: 'my-image.png'
});

// Debug visualization
app.renderer.extract.log(graphics);
```

Features:

- Extract as various formats (PNG, JPEG, WebP)
- Control output quality and resolution
- Extract specific regions
- Download extracted content
- Debug visualization

Common Use Cases:

- Creating thumbnails
- Saving game screenshots
- Processing visual content
- Debugging renders
- Creating textures from rendered content

Performance Considerations:

- Extraction operations are relatively expensive
- Consider caching results for frequently used content
- Be mindful of resolution and format choices
- Large extractions may impact performance
