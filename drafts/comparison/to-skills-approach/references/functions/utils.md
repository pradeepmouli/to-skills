# Functions

## utils

### `formatShader`

formats a shader so its more pleasant to read

```ts
formatShader(shader: string): string
```

**Parameters:**

- `shader: string` — a glsl shader program source
  **Returns:** `string`

### `definedProps`

Returns a new object with all properties from the input object that have defined values.

```ts
definedProps<T>(obj: T): T
```

**Parameters:**

- `obj: T` — The input object.
  **Returns:** `T` — - A new object with only the defined properties from the input object.

### `isWebGLSupported`

Helper for checking for WebGL support in the current environment.

Results are cached after first call for better performance.

```ts
isWebGLSupported(failIfMajorPerformanceCaveat?: boolean): boolean
```

**Parameters:**

- `failIfMajorPerformanceCaveat: boolean` (optional) — Whether to fail if there is a major performance caveat
  **Returns:** `boolean` — True if WebGL is supported

```ts
// Basic WebGL support check
if (isWebGLSupported()) {
  console.log('WebGL is available');
}
```

### `isWebGPUSupported`

Helper for checking for WebGPU support in the current environment.
Results are cached after first call for better performance.

```ts
isWebGPUSupported(options: GPURequestAdapterOptions): Promise<boolean>
```

**Parameters:**

- `options: GPURequestAdapterOptions` — default: `{}` — The options for requesting a GPU adapter
  **Returns:** `Promise<boolean>` — Promise that resolves to true if WebGPU is supported

```ts
// Basic WebGPU support check
const hasWebGPU = await isWebGPUSupported();
console.log('WebGPU available:', hasWebGPU);
```

### `warn`

Logs a PixiJS warning message to the console. Stops logging after 500 warnings have been logged.

```ts
warn(args: any[]): void
```

**Parameters:**

- `args: any[]` — The warning message(s) to log

### `sayHello`

Prints out the version and renderer information for this running instance of PixiJS.
Only logs once per page load — subsequent calls are silently ignored.

```ts
sayHello(type: string): void
```

**Parameters:**

- `type: string` — The name of the renderer this instance is using.

```ts
sayHello('WebGL'); // logs PixiJS version and renderer to console once
sayHello('WebGL'); // second call is a no-op
```
