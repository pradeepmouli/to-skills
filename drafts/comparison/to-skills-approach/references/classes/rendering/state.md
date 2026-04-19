# Classes

## rendering

### `State`

This is a WebGL state, and is is passed to GlStateSystem.

Each mesh rendered may require WebGL to be in a different state.
For example you may want different blend mode or to enable polygon offsets

```ts
constructor(): State
```

**Properties:**

- `default2d: State`
- `data: number` — The data is a unique number based on the states settings.
  This lets us quickly compare states with a single number rather than looking
  at all the individual settings.
  **Methods:**
- `for2d(): State` — A quickly getting an instance of a State that is configured for 2d rendering.
- `toString(): string`
