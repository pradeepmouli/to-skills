# Classes

## rendering

### `ScissorMask`

ScissorMask is an effect that applies a scissor mask to a container.
It restricts rendering to the area defined by the mask.
The mask is a Container that defines the area to be rendered.
The mask must be a Container that is not renderable or measurable.
This effect is used to create clipping regions in the rendering process.
_implements `Effect`_

```ts
constructor(mask: Container): ScissorMask
```

**Properties:**

- `priority: number`
- `mask: Container`
- `pipe: string`
  **Methods:**
- `addBounds(bounds: Bounds, skipUpdateTransform?: boolean): void`
- `addLocalBounds(bounds: Bounds, localRoot: Container): void`
- `containsPoint(point: Point, hitTestFn: (container: Container, point: Point) => boolean): boolean`
- `reset(): void`
- `destroy(): void`
