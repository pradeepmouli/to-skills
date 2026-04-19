# Classes

## rendering

### `GlProgram`

A wrapper for a WebGL Program. You can create one and then pass it to a shader.
This will manage the WebGL program that is compiled and uploaded to the GPU.

To get the most out of this class, you should be familiar with glsl shaders and how they work.

```ts
constructor(options: GlProgramOptions): GlProgram
```

**Properties:**

- `defaultOptions: Partial<GlProgramOptions>` — The default options used by the program.
- `fragment: string` (optional) — the fragment glsl shader source.
- `vertex: string` (optional) — the vertex glsl shader source
- `transformFeedbackVaryings: { names: string[]; bufferMode: "separate" | "interleaved" }` (optional) — details on how to use this program with transform feedback
  **Methods:**
- `from(options: GlProgramOptions): GlProgram` — Helper function that creates a program for a given source.
  It will check the program cache if the program has already been created.
  If it has that one will be returned, if not a new one will be created and cached.
- `destroy(): void` — destroys the program

```ts
// Create a new program
const program = new GlProgram({
  vertex: '...',
  fragment: '...',
});


There are a few key things that pixi shader will do for you automatically:
<br>
- If no precision is provided in the shader, it will be injected into the program source for you.
This precision will be taken form the options provided, if none is provided,
then the program will default to the defaultOptions.
<br>
- It will inject the program name into the shader source if none is provided.
<br>
 - It will set the program version to 300 es.

For optimal usage and best performance, its best to reuse programs as much as possible.
You should use the {@link GlProgram.from} helper function to create programs.
```
