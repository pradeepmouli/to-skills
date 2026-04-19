# Classes

## rendering

### `SchedulerSystem`

The SchedulerSystem manages scheduled tasks with specific intervals.
_implements `System<null>`_

```ts
constructor(): SchedulerSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem, CanvasSystem]; name: "scheduler"; priority: 0 }`
  **Methods:**
- `init(): void` — Initializes the scheduler system and starts the ticker.
- `repeat(func: (elapsed: number) => void, duration: number, useOffset: boolean): number` — Schedules a repeating task.
- `cancel(id: number): void` — Cancels a scheduled task.
