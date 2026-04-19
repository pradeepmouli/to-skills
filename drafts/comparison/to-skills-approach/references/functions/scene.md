# Functions

## scene

### `graphicsContextToSvg`

Converts a Graphics object or GraphicsContext into an SVG string.

This is a pure function — it reads from the context's instructions and
returns a self-contained SVG document string. Texture instructions are
skipped since they have no SVG equivalent.

```ts
graphicsContextToSvg(source: Graphics | GraphicsContext, precision: number): string
```

**Parameters:**

- `source: Graphics | GraphicsContext` — A Graphics instance or a GraphicsContext.
- `precision: number` — default: `2` — Decimal places for SVG coordinates (default 2).
  **Returns:** `string` — A complete SVG document string.

```ts
const graphics = new Graphics().rect(0, 0, 100, 50).fill(0xff0000);
const svgString = graphicsContextToSvg(graphics);
// svgString is a full '<svg>...</svg>' document
document.body.innerHTML = svgString;
```

### `buildGeometryFromPath`

When building a mesh, it helps to leverage the simple API we have in `GraphicsPath` as it can often be easier to
define the geometry in a more human-readable way. This function takes a `GraphicsPath` and returns a `MeshGeometry`.

```ts
buildGeometryFromPath(options: GraphicsPath | GeometryPathOptions): MeshGeometry
```

**Parameters:**

- `options: GraphicsPath | GeometryPathOptions` — either a `GraphicsPath` or `GeometryPathOptions`
  **Returns:** `MeshGeometry` — a new `MeshGeometry` instance build from the path

```ts
const path = new GraphicsPath().drawRect(0, 0, 100, 100);

const geometry: MeshGeometry = buildGeometryFromPath(path);

const mesh = new Mesh({ geometry });
```

You can also pass in a Matrix to transform the uvs as by default you may want to control how they are set up.
