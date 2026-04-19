# Classes

## rendering

### `GlStateSystem`

System plugin to the renderer to manage WebGL state machines
_implements `System`_

```ts
constructor(renderer: WebGLRenderer): GlStateSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "state" }`
- `stateId: number` — State ID
- `polygonOffset: number` — Polygon offset
- `blendMode: BLEND_MODES` — Blend mode
  **Methods:**
- `set(state: State): void` — Sets the current state
- `forceState(state: State): void` — Sets the state, when previous state is unknown.
- `setBlend(value: boolean): void` — Sets whether to enable or disable blending.
- `setOffset(value: boolean): void` — Sets whether to enable or disable polygon offset fill.
- `setDepthTest(value: boolean): void` — Sets whether to enable or disable depth test.
- `setDepthMask(value: boolean): void` — Sets whether to enable or disable depth mask.
- `setCullFace(value: boolean): void` — Sets whether to enable or disable cull face.
- `setFrontFace(value: boolean): void` — Sets the gl front face.
- `setBlendMode(value: BLEND_MODES): void` — Sets the blend mode.
- `setPolygonOffset(value: number, scale: number): void` — Sets the polygon offset.
- `resetState(): void` — Resets all the logic and disables the VAOs.
- `destroy(): void`
