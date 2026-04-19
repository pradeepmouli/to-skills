# Classes

## rendering

### `PrepareBase`

Part of the prepare system. Responsible for uploading all the items to the GPU.
This class provides the base functionality and handles processing the queue asynchronously.

```ts
constructor(renderer: Renderer): PrepareBase
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`
