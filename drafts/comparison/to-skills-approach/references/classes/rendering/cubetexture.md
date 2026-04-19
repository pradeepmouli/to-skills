# Classes

## rendering

### `CubeTexture`

A cube texture that can be bound to shaders (samplerCube / texture_cube).

This is a lightweight wrapper around a CubeTextureSource.
_extends `EventEmitter<{ destroy: CubeTexture }>`_
_implements `BindableTexture`_

```ts
constructor(options: CubeTextureOptions): CubeTexture
```

**Properties:**

- `uid: number` — unique id for this cube texture
- `destroyed: boolean` — Has the texture been destroyed?
- `source: CubeTextureSource` — The underlying cube texture source.
- `label: string` (optional) — Optional label for debugging.
  **Methods:**
- `from(options: CubeTextureSource, skipCache?: boolean): CubeTexture` — Convenience factory for creating a cube texture from a CubeTextureSource.
- `destroy(destroySource: boolean): void` — Destroy this CubeTexture.
  Load 6 images and create a cube texture (paths are just examples):

```ts
import { Assets, CubeTexture } from 'pixi.js';

await Assets.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);

// IMPORTANT: string ids must already be in the cache (e.g. after Assets.load)
const cube = CubeTexture.from({
  faces: {
    right: 'px.png', // +X
    left: 'nx.png', // -X
    top: 'py.png', // +Y
    bottom: 'ny.png', // -Y
    front: 'pz.png', // +Z
    back: 'nz.png' // -Z
  },
  label: 'skybox'
});
```

Bind to a shader (resources differ between WebGL and WebGPU, but the cube texture binding stays the same):

```ts
const shader = Shader.from({
  gl: { fragment: `uniform samplerCube uCube;` },
  gpu: { fragment: { source: `@group(0) @binding(0) var uCube : texture_cube<f32>;` } },
  resources: {
    uCube: cube.source,
    uSampler: cube.source.style
  }
});
```
