# Classes

## rendering

### `FilterSystem`

System that manages the filter pipeline
_implements `System`_

```ts
constructor(renderer: WebGLRenderer<HTMLCanvasElement> | WebGPURenderer<HTMLCanvasElement>): FilterSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "filter" }`
- `renderer: WebGLRenderer<HTMLCanvasElement> | WebGPURenderer<HTMLCanvasElement>`
  **Methods:**
- `generateFilteredTexture(params: { texture: Texture; filters: Filter[] }): Texture` — Applies filters to a texture.

This method takes a texture and a list of filters, applies the filters to the texture,
and returns the resulting texture.

- `getBackTexture(lastRenderSurface: RenderTarget, bounds: Bounds, previousBounds?: Bounds): Texture<TextureSource<any>>` — Copies the last render surface to a texture.
- `applyFilter(filter: Filter, input: Texture, output: RenderSurface, clear: boolean): void` — Applies a filter to a texture.
- `calculateSpriteMatrix(outputMatrix: Matrix, sprite: Sprite): Matrix` — Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.

Use `outputMatrix * vTextureCoord` in the shader.

- `destroy(): void` — Generic destroy methods to be overridden by the subclass
