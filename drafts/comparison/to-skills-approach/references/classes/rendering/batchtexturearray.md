# Classes

## rendering

### `BatchTextureArray`

Used by the batcher to build texture batches. Holds list of textures and their respective locations.

```ts
constructor(): BatchTextureArray
```

**Properties:**

- `textures: TextureSource<any>[]` — Inside textures array.
- `ids: Record<number, number>` — Respective locations for textures.
- `count: number` — Number of filled elements.
  **Methods:**
- `clear(): void` — Clear the textures and their locations.
