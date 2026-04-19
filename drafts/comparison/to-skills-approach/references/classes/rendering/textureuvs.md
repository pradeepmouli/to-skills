# Classes

## rendering

### `TextureUvs`

Stores a texture's frame in UV coordinates, in
which everything lies in the rectangle `[(0,0), (1,0),
(1,1), (0,1)]`.

| Corner       | Coordinates |
| ------------ | ----------- |
| Top-Left     | `(x0,y0)`   |
| Top-Right    | `(x1,y1)`   |
| Bottom-Right | `(x2,y2)`   |
| Bottom-Left  | `(x3,y3)`   |

```ts
constructor(): TextureUvs
```

**Properties:**

- `x0: number` — X-component of top-left corner `(x0,y0)`.
- `y0: number` — Y-component of top-left corner `(x0,y0)`.
- `x1: number` — X-component of top-right corner `(x1,y1)`.
- `y1: number` — Y-component of top-right corner `(x1,y1)`.
- `x2: number` — X-component of bottom-right corner `(x2,y2)`.
- `y2: number` — Y-component of bottom-right corner `(x2,y2)`.
- `x3: number` — X-component of bottom-left corner `(x3,y3)`.
- `y3: number` — Y-component of bottom-right corner `(x3,y3)`.
- `uvsFloat32: Float32Array`
  **Methods:**
- `set(frame: Rectangle, baseFrame: Size, rotate: number): void` — Sets the texture Uvs based on the given frame information.
- `toString(): string`
