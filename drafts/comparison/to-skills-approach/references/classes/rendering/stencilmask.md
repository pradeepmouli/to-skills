# Classes

## rendering

### `StencilMask`

A mask that uses the stencil buffer to clip the rendering of a container.
This is useful for complex masks that cannot be achieved with simple shapes.
It is more performant than using a `Graphics` mask, but requires WebGL support.
It is also useful for masking with `Container` objects that have complex shapes.
_implements `Effect`, `PoolItem`_

```ts
constructor(options: { mask: Container }): StencilMask
```

**Properties:**

- `extension: ExtensionMetadata`
- `priority: number`
- `mask: Container`
- `pipe: string`
  **Methods:**
- `test(mask: any): boolean`
- `init(mask: Container): void`
- `reset(): void`
- `addBounds(bounds: Bounds, skipUpdateTransform: boolean): void`
- `addLocalBounds(bounds: Bounds, localRoot: Container): void`
- `containsPoint(point: Point, hitTestFn: (container: Container, point: Point) => boolean): boolean`
- `destroy(): void`
