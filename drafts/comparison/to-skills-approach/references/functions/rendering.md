# Functions

## rendering

### `autoDetectRenderer`

Automatically determines the most appropriate renderer for the current environment.

The function will prioritize the WebGL renderer as it is the most tested safe API to use.
In the near future as WebGPU becomes more stable and ubiquitous, it will be prioritized over WebGL.

The selected renderer's code is then dynamically imported to optimize
performance and minimize the initial bundle size.

To maximize the benefits of dynamic imports, it's recommended to use a modern bundler
that supports code splitting. This will place the renderer code in a separate chunk,
which is loaded only when needed.

```ts
autoDetectRenderer(options: Partial<AutoDetectOptions>): Promise<Renderer>
```

**Parameters:**

- `options: Partial<AutoDetectOptions>` — A partial configuration object based on the `AutoDetectOptions` type.
  **Returns:** `Promise<Renderer>` — A Promise that resolves to an instance of the selected renderer.

```ts
// create a renderer
const renderer = await autoDetectRenderer({
  width: 800,
  height: 600,
  antialias: true
});

// custom for each renderer
const renderer = await autoDetectRenderer({
  width: 800,
  height: 600,
  webgpu: {
    antialias: true,
    backgroundColor: 'red'
  },
  webgl: {
    antialias: true,
    backgroundColor: 'green'
  }
});

// only allow webgl and canvas (exclude webgpu entirely)
const renderer = await autoDetectRenderer({
  preference: ['webgl', 'canvas']
});
```

### `fastCopy`

Copies from one ArrayBuffer to another.
Uses Float64Array (8-byte), Float32Array (4-byte), or Uint8Array depending on alignment.

```ts
fastCopy(sourceBuffer: ArrayBufferLike, destinationBuffer: ArrayBufferLike, sourceOffset?: number, byteLength?: number): void
```

**Parameters:**

- `sourceBuffer: ArrayBufferLike` — the array buffer to copy from
- `destinationBuffer: ArrayBufferLike` — the array buffer to copy to
- `sourceOffset: number` (optional) — the byte offset to start copying from (default 0)
- `byteLength: number` (optional) — the number of bytes to copy (default: min of source available and destination size)
