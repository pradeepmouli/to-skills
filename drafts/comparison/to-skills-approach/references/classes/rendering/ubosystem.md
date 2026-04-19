# Classes

## rendering

### `UboSystem`

System plugin to the renderer to manage uniform buffers.
_implements `System`_

```ts
constructor(adaptor: UboAdaptor): UboSystem
```

**Methods:**

- `ensureUniformGroup(uniformGroup: UniformGroup): void`
- `getUniformGroupData(uniformGroup: UniformGroup): { layout: UboLayout; syncFunction: (uniforms: Record<string, any>, data: Float32Array, dataInt32: Int32Array, offset: number) => void }`
- `syncUniformGroup(uniformGroup: UniformGroup, data?: Float32Array, offset?: number): boolean`
- `updateUniformGroup(uniformGroup: UniformGroup): boolean`
- `destroy(): void` — Generic destroy methods to be overridden by the subclass
