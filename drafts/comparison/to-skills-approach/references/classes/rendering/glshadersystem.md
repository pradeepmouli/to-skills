# Classes

## rendering

### `GlShaderSystem`

System plugin to the renderer to manage the shaders for WebGL.

```ts
constructor(renderer: WebGLRenderer): GlShaderSystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem]; name: "shader" }`
  **Methods:**
- `bind(shader: Shader, skipSync?: boolean): void` — Changes the current shader to the one given in parameter.
- `updateUniformGroup(uniformGroup: UniformGroup): void` — Updates the uniform group.
- `bindUniformBlock(uniformGroup: UniformGroup<any> | BufferResource, name: string, index: number): void` — Binds a uniform block to the shader.
- `destroy(): void`
- `_generateShaderSync(shader: Shader, shaderSystem: GlShaderSystem): ShaderSyncFunction` — Creates a function that can be executed that will sync the shader as efficiently as possible.
  Overridden by the unsafe eval package if you don't want eval used in your project.
- `resetState(): void`
