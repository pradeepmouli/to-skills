# Classes

## rendering

### `PrepareUpload`

_extends `PrepareQueue`_

```ts
constructor(renderer: Renderer): PrepareUpload
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`
