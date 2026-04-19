# Functions

## environment

### `loadEnvironmentExtensions`

Automatically detects the environment and loads the appropriate extensions.

```ts
loadEnvironmentExtensions(skip: boolean): Promise<void>
```

**Parameters:**

- `skip: boolean` — whether to skip loading the default extensions
  **Returns:** `Promise<void>`

```ts
// Load environment extensions (WebGL, WebGPU, etc.) for the current platform
await loadEnvironmentExtensions(false);
```

### `autoDetectEnvironment`

```ts
autoDetectEnvironment(add: boolean): Promise<void>
```

**Parameters:**

- `add: boolean` — whether to add the default imports to the bundle
  **Returns:** `Promise<void>`
  > **Deprecated:** since 8.1.6. Use `loadEnvironmentExtensions` instead

```ts
// Deprecated: use loadEnvironmentExtensions(false) instead
await autoDetectEnvironment(true);
```
