# Classes

## rendering

### `PrepareQueue`

Part of the prepare system. Responsible for uploading all the items to the GPU.
This class extends the base functionality and resolves given resource items ready for the queue.
_extends `PrepareBase`_

```ts
constructor(renderer: Renderer): PrepareQueue
```

**Properties:**

- `uploadsPerFrame: number` — The number of uploads to process per frame
  **Methods:**
- `getQueue(): PrepareQueueItem[]` — Return a copy of the queue
- `add(resource: PrepareSourceItem | PrepareSourceItem[]): this` — Add a textures or graphics resource to the queue
- `upload(resource?: PrepareSourceItem | PrepareSourceItem[]): Promise<void>` — Upload all the textures and graphics to the GPU (optionally add more resources to the queue first)
- `dedupeQueue(): void` — eliminate duplicates before processing
- `destroy(): void`
