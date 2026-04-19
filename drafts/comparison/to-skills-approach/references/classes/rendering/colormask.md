# Classes

## rendering

### `ColorMask`

The ColorMask effect allows you to apply a color mask to the rendering process.
This can be useful for selectively rendering certain colors or for creating
effects based on color values.
_implements `Effect`, `PoolItem`_

```ts
constructor(options: { mask: number }): ColorMask
```

**Properties:**

- `extension: ExtensionMetadata`
- `priority: number`
- `mask: number`
- `pipe: string`
  **Methods:**
- `test(mask: any): boolean`
- `init(mask: number): void`
- `destroy(): void`
