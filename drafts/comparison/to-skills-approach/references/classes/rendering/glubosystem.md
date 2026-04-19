# Classes

## rendering

### `GlUboSystem`

System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor.
_extends `UboSystem`_

```ts
constructor(): GlUboSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "ubo" }`
  **Methods:**
- `ensureUniformGroup(uniformGroup: UniformGroup): void`
- `getUniformGroupData(uniformGroup: UniformGroup): { layout: UboLayout; syncFunction: (uniforms: Record<string, any>, data: Float32Array, dataInt32: Int32Array, offset: number) => void }`
- `syncUniformGroup(uniformGroup: UniformGroup, data?: Float32Array, offset?: number): boolean`
- `updateUniformGroup(uniformGroup: UniformGroup): boolean`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
