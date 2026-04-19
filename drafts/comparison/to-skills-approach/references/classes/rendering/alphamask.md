# Classes

## rendering

### `AlphaMask`

AlphaMask is an effect that applies a mask to a container using a sprite texture.
By default, the red channel of the mask texture controls visibility. Set `channel` to `'alpha'`
to use the alpha channel instead, which is useful for masks defined by transparency.
The mask can be inverted, and non-sprite masks are rendered to a texture automatically.
_implements `Effect`, `PoolItem`_

```ts
constructor(options?: { mask: Container }): AlphaMask
```

**Properties:**

- `extension: ExtensionMetadata`
- `priority: number`
- `mask: Container`
- `inverse: boolean`
- `channel: MaskChannel`
- `pipe: string`
- `renderMaskToTexture: boolean`
  **Methods:**
- `test(mask: any): boolean`
- `init(mask: Container): void`
- `reset(): void`
- `addBounds(bounds: Bounds, skipUpdateTransform?: boolean): void`
- `addLocalBounds(bounds: Bounds, localRoot: Container): void`
- `containsPoint(point: Point, hitTestFn: (container: Container, point: Point) => boolean): boolean`
- `destroy(): void`
