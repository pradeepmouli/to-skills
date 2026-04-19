# Functions

## assets

### `crossOrigin`

Set cross origin based detecting the url and the crossorigin

```ts
crossOrigin(element: ImageLike | HTMLVideoElement, url: string, crossorigin?: string | boolean): void
```

**Parameters:**

- `element: ImageLike | HTMLVideoElement` — Element to apply crossOrigin
- `url: string` — URL to check
- `crossorigin: string | boolean` (optional) — Cross origin value to use

### `determineCrossOrigin`

Sets the `crossOrigin` property for this resource based on if the url
for this resource is cross-origin. If crossOrigin was manually set, this
function does nothing.
Nipped from the resource loader!

```ts
determineCrossOrigin(url: string, loc?: Location): string
```

**Parameters:**

- `url: string` — The url to test.
- `loc: Location` (optional) — default: `globalThis.location` — The location object to test against.
  **Returns:** `string` — The crossOrigin value to use (or empty string for none).

### `setBasisTranscoderPath`

Sets the Basis transcoder paths.
This allows you to override the default paths for the Basis transcoder files.

```ts
setBasisTranscoderPath(config: Partial<typeof basisTranscoderUrls>): void
```

**Parameters:**

- `config: Partial<typeof basisTranscoderUrls>` — The configuration object containing the new paths.

```ts
// Host transcoder files locally for offline or CSP-restricted environments
setBasisTranscoderPath({
  jsUrl: '/static/basis_transcoder.js',
  wasmUrl: '/static/basis_transcoder.wasm'
});
```

### `setKTXTranscoderPath`

Sets the paths for the KTX transcoder library.

```ts
setKTXTranscoderPath(config: Partial<typeof ktxTranscoderUrls>): void
```

**Parameters:**

- `config: Partial<typeof ktxTranscoderUrls>` — Partial configuration object to set custom paths for the KTX transcoder.
  This allows you to override the default URLs for the KTX transcoder library.

```ts
// Serve the KTX transcoder from your own CDN or local server
setKTXTranscoderPath({
  jsUrl: '/static/libktx.js',
  wasmUrl: '/static/libktx.wasm'
});
```
