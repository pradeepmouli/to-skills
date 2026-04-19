# Functions

## `loadImageBitmap`

Returns a promise that resolves an ImageBitmaps.
This function is designed to be used by a worker.
Part of WorkerManager!

```ts
loadImageBitmap(url: string, asset?: ResolvedAsset<TextureSourceOptions<any>>): Promise<ImageBitmap>
```

**Parameters:**

- `url: string` — The image to load an image bitmap for
- `asset: ResolvedAsset<TextureSourceOptions<any>>` (optional)
  **Returns:** `Promise<ImageBitmap>`

## `createTexture`

Creates a texture from a source and adds it to the cache.

```ts
createTexture(source: TextureSource, loader: Loader, url: string): Texture<TextureSource<any>>
```

**Parameters:**

- `source: TextureSource` — source of the texture
- `loader: Loader` — loader
- `url: string` — url of the texture
  **Returns:** `Texture<TextureSource<any>>`

## `getMaxTexturesPerBatch`

Returns the maximum number of textures that can be batched. This uses WebGL1's `MAX_TEXTURE_IMAGE_UNITS`.
The response for this is that to get this info via WebGPU, we would need to make a context, which
would make this function async, and we want to avoid that.

```ts
getMaxTexturesPerBatch(): number
```

**Returns:** `number` — The maximum number of textures that can be batched

> **Deprecated:** Use `Renderer.limits.maxBatchableTextures` instead.

## `compileShader`

```ts
compileShader(gl: WebGLRenderingContextBase, type: number, src: string): WebGLShader
```

**Parameters:**

- `gl: WebGLRenderingContextBase` — The current WebGL context {WebGLProgram}
- `type: number` — the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
- `src: string` — The vertex shader source as an array of strings.
  **Returns:** `WebGLShader` — the shader

## `defaultValue`

```ts
defaultValue(type: string, size: number): number | boolean | Uint32Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | boolean[]
```

**Parameters:**

- `type: string` — Type of value
- `size: number`
  **Returns:** `number | boolean | Uint32Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | boolean[]`

## `extractAttributesFromGlProgram`

returns the attribute data from the program

```ts
extractAttributesFromGlProgram(program?: WebGLProgram, gl?: WebGLRenderingContextBase, sortAttributes: boolean): Record<string, ExtractedAttributeData>
```

**Parameters:**

- `program: WebGLProgram` (optional) — the WebGL program
- `gl: WebGLRenderingContextBase` (optional) — the WebGL context
- `sortAttributes: boolean` — default: `false`
  **Returns:** `Record<string, ExtractedAttributeData>` — the attribute data for this program

## `generateProgram`

generates a WebGL Program object from a high level Pixi Program.

```ts
generateProgram(gl: WebGL2RenderingContext, program: GlProgram): GlProgramData
```

**Parameters:**

- `gl: WebGL2RenderingContext` — a rendering context on which to generate the program
- `program: GlProgram` — the high level Pixi Program.
  **Returns:** `GlProgramData`

## `getTestContext`

returns a little WebGL context to use for program inspection.

```ts
getTestContext(): WebGL2RenderingContext
```

**Returns:** `WebGL2RenderingContext` — a gl context to test with

## `getUboData`

returns the uniform block data from the program

```ts
getUboData(program: WebGLProgram, gl: WebGL2RenderingContext): Record<string, GlUniformBlockData>
```

**Parameters:**

- `program: WebGLProgram` — the webgl program
- `gl: WebGL2RenderingContext` — the WebGL context
  **Returns:** `Record<string, GlUniformBlockData>` — the uniform data for this program

## `getUniformData`

returns the uniform data from the program

```ts
getUniformData(program: WebGLProgram, gl: WebGLRenderingContextBase): { [key: string]: GlUniformData }
```

**Parameters:**

- `program: WebGLProgram` — the webgl program
- `gl: WebGLRenderingContextBase` — the WebGL context
  **Returns:** `{ [key: string]: GlUniformData }` — the uniform data for this program

## `logProgramError`

logs out any program errors

```ts
logProgramError(gl: WebGLRenderingContext, program: WebGLProgram, vertexShader: WebGLShader, fragmentShader: WebGLShader): void
```

**Parameters:**

- `gl: WebGLRenderingContext` — The current WebGL context
- `program: WebGLProgram` — the WebGL program to display errors for
- `vertexShader: WebGLShader` — the fragment WebGL shader program
- `fragmentShader: WebGLShader` — the vertex WebGL shader program

## `mapSize`

```ts
mapSize(type: string): number
```

**Parameters:**

- `type: string`
  **Returns:** `number`

## `ensurePrecision`

Sets the float precision on the shader, ensuring the device supports the request precision.
If the precision is already present, it just ensures that the device is able to handle it.

```ts
ensurePrecision(src: string, options: EnsurePrecisionOptions, isFragment: boolean): string
```

**Parameters:**

- `src: string`
- `options: EnsurePrecisionOptions`
- `isFragment: boolean`
  **Returns:** `string`

## `mapFormatToGlFormat`

Returns a lookup table that maps each type-format pair to a compatible internal format.

```ts
mapFormatToGlFormat(gl: WebGL2RenderingContext): Record<string, number>
```

**Parameters:**

- `gl: WebGL2RenderingContext` — The rendering context.
  **Returns:** `Record<string, number>` — Lookup table.

## `mapFormatToGlInternalFormat`

Returns a lookup table that maps each type-format pair to a compatible internal format.

```ts
mapFormatToGlInternalFormat(gl: WebGL2RenderingContext, extensions: WebGLExtensions): Record<string, number>
```

**Parameters:**

- `gl: WebGL2RenderingContext` — The rendering context.
- `extensions: WebGLExtensions` — The WebGL extensions.
  **Returns:** `Record<string, number>` — Lookup table.

## `mapFormatToGlType`

Returns a lookup table that maps each type-format pair to a compatible internal format.

```ts
mapFormatToGlType(gl: WebGL2RenderingContext): Record<string, number>
```

**Parameters:**

- `gl: WebGL2RenderingContext` — The rendering context.
  **Returns:** `Record<string, number>` — Lookup table.

## `getDefaultUniformValue`

```ts
getDefaultUniformValue(type: string, size: number): number | boolean | Uint32Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | boolean[]
```

**Parameters:**

- `type: string` — Type of value
- `size: number`
  **Returns:** `number | boolean | Uint32Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Float32Array<ArrayBufferLike> | boolean[]`

## `roundedShapeArc`

Typed and cleaned up version of:
https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/44856925#44856925

```ts
roundedShapeArc(g: ShapePath, points: RoundedPoint[], radius: number): void
```

**Parameters:**

- `g: ShapePath` — Graphics to be drawn on.
- `points: RoundedPoint[]` — Corners of the shape to draw. Minimum length is 3.
- `radius: number` — Corners default radius.

## `roundedShapeQuadraticCurve`

Typed and cleaned up version of:
https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/56214413#56214413

```ts
roundedShapeQuadraticCurve(g: ShapePath, points: RoundedPoint[], radius: number, smoothness?: number): void
```

**Parameters:**

- `g: ShapePath` — Graphics to be drawn on.
- `points: RoundedPoint[]` — Corners of the shape to draw. Minimum length is 3.
- `radius: number` — Corners default radius.
- `smoothness: number` (optional)

## `toFillStyle`

Converts a value to a fill style, we do this as PixiJS has a number of ways to define a fill style
They can be a direct color, a texture, a gradient, or an object with these values in them
This function will take any of these input types and convert them into a single object
that PixiJS can understand and use internally.

```ts
toFillStyle<T>(value: T, defaultStyle: ConvertedFillStyle): ConvertedFillStyle
```

**Parameters:**

- `value: T` — The value to convert to a fill style
- `defaultStyle: ConvertedFillStyle` — The default fill style to use
  **Returns:** `ConvertedFillStyle`

## `toStrokeStyle`

Converts a value to a stroke style, similar to `toFillStyle` but for strokes

```ts
toStrokeStyle(value: StrokeInput, defaultStyle: ConvertedStrokeStyle): ConvertedStrokeStyle
```

**Parameters:**

- `value: StrokeInput` — The value to convert to a stroke style
- `defaultStyle: ConvertedStrokeStyle` — The default stroke style to use
  **Returns:** `ConvertedStrokeStyle`

## `compute2DProjection`

Compute a 2D projection matrix

```ts
compute2DProjection(out: Matrix3x3, x1s: number, y1s: number, x1d: number, y1d: number, x2s: number, y2s: number, x2d: number, y2d: number, x3s: number, y3s: number, x3d: number, y3d: number, x4s: number, y4s: number, x4d: number, y4d: number): Matrix3x3
```

**Parameters:**

- `out: Matrix3x3` — The matrix to store the result in
- `x1s: number` — The x coordinate of the first source point
- `y1s: number` — The y coordinate of the first source point
- `x1d: number` — The x coordinate of the first destination point
- `y1d: number` — The y coordinate of the first destination point
- `x2s: number` — The x coordinate of the second source point
- `y2s: number` — The y coordinate of the second source point
- `x2d: number` — The x coordinate of the second destination point
- `y2d: number` — The y coordinate of the second destination point
- `x3s: number` — The x coordinate of the third source point
- `y3s: number` — The y coordinate of the third source point
- `x3d: number` — The x coordinate of the third destination point
- `y3d: number` — The y coordinate of the third destination point
- `x4s: number` — The x coordinate of the fourth source point
- `y4s: number` — The y coordinate of the fourth source point
- `x4d: number` — The x coordinate of the fourth destination point
- `y4d: number` — The y coordinate of the fourth destination point
  **Returns:** `Matrix3x3` — - The computed 2D projection matrix

## `resolveCharacters`

Processes the passed character set data and returns a flattened array of all the characters.

Ignored because not directly exposed.

```ts
resolveCharacters(chars: string | (string | string[])[]): string[]
```

**Parameters:**

- `chars: string | (string | string[])[]`
  **Returns:** `string[]` — the flattened array of characters

## `unsafeEvalSupported`

Not all platforms allow to generate function code (e.g., `new Function`).
this provides the platform-level detection.

```ts
unsafeEvalSupported(): boolean
```

**Returns:** `boolean` — `true` if `new Function` is supported.

## `logDebugTexture`

Logs a texture to the console as a base64 image.
This can be very useful for debugging issues with rendering.

```ts
logDebugTexture(texture: Texture, renderer: Renderer, size: number): Promise<void>
```

**Parameters:**

- `texture: Texture` — The texture to log
- `renderer: Renderer` — The renderer to use
- `size: number` — default: `200` — The size of the texture to log in the console
  **Returns:** `Promise<void>`
