# Classes

## utils

### `ViewableBuffer`

Flexible wrapper around `ArrayBuffer` that also provides typed array views on demand.

```ts
constructor(length: number): ViewableBuffer
```

**Properties:**

- `size: number` — The size of the buffer in bytes.
- `rawBinaryData: ArrayBufferLike` — Underlying `ArrayBuffer` that holds all the data and is of capacity `this.size`.
- `uint32View: Uint32Array` — View on the raw binary data as a `Uint32Array`.
- `float32View: Float32Array` — View on the raw binary data as a `Float32Array`.
- `uint16View: Uint16Array` — View on the raw binary data as a `Uint16Array`.
  **Methods:**
- `sizeOf(type: string): number` — Returns the size of the given type in bytes.
- `view(type: string): TypedArray` — Returns the view of the given type.
- `destroy(): void` — Destroys all buffer references. Do not use after calling this.

### `Transform`

The Transform class facilitates the manipulation of a 2D transformation matrix through
user-friendly properties: position, scale, rotation, skew, and pivot.

```ts
constructor(options: TransformOptions): Transform
```

**Properties:**

- `position: ObservablePoint` — The coordinate of the object relative to the local coordinates of the parent.
- `scale: ObservablePoint` — The scale factor of the object.
- `pivot: ObservablePoint` — The pivot point of the container that it rotates around.
- `skew: ObservablePoint` — The skew amount, on the x and y axis.
  **Methods:**
- `toString(): string`
- `setFromMatrix(matrix: Matrix): void` — Decomposes a matrix and sets the transforms properties based on it.

```ts
// Basic transform usage
const transform = new Transform();
transform.position.set(100, 100);
transform.rotation = Math.PI / 4; // 45 degrees
transform.scale.set(2, 2);

// With pivot point
transform.pivot.set(50, 50);
transform.rotation = Math.PI; // Rotate around pivot

// Matrix manipulation
const matrix = transform.matrix;
const position = { x: 0, y: 0 };
matrix.apply(position); // Transform point
```

### `Pool`

A generic class for managing a pool of items.

```ts
constructor<T, I>(ClassType: PoolItemConstructor<T>, initialSize?: number): Pool<T, I>
```

**Methods:**

- `prepopulate(total: number): void` — Prepopulates the pool with a given number of items.
- `get(data?: I): T` — Gets an item from the pool. Calls the item's `init` method if it exists.
  If there are no items left in the pool, a new one will be created.
- `return(item: T): void` — Returns an item to the pool. Calls the item's `reset` method if it exists.
- `clear(): void` — clears the pool

### `PoolGroupClass`

A group of pools that can be used to store objects of different types.

```ts
constructor(): PoolGroupClass
```

**Methods:**

- `prepopulate<T>(Class: PoolItemConstructor<T>, total: number): void` — Prepopulates a specific pool with a given number of items.
- `get<T>(Class: PoolItemConstructor<T>, data?: unknown): T` — Gets an item from a specific pool.
- `return(item: PoolItem): void` — Returns an item to its respective pool.
- `getPool<T>(ClassType: PoolItemConstructor<T>): Pool<T>` — Gets a specific pool based on the class type.
- `stats(): Record<string, { free: number; used: number; size: number }>` — gets the usage stats of each pool in the system
- `clear(): void` — Clears all pools in the group. This will reset all pools and free their resources.
