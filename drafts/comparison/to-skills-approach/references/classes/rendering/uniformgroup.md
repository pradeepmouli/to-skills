# Classes

## rendering

### `UniformGroup`

Uniform group holds uniform map and some ID's for work

`UniformGroup` has two modes:

1: Normal mode
Normal mode will upload the uniforms with individual function calls as required. This is the default mode
for WebGL rendering.

2: Uniform buffer mode
This mode will treat the uniforms as a uniform buffer. You can pass in either a buffer that you manually handle, or
or a generic object that PixiJS will automatically map to a buffer for you.
For maximum benefits, make Ubo UniformGroups static, and only update them each frame.
This is the only way uniforms can be used with WebGPU.

Rules of UBOs:

- UBOs only work with WebGL2, so make sure you have a fallback!
- Only floats are supported (including vec[2,3,4], mat[2,3,4])
- Samplers cannot be used in ubo's (a GPU limitation)
- You must ensure that the object you pass in exactly matches in the shader ubo structure.
  Otherwise, weirdness will ensue!
- The name of the ubo object added to the group must match exactly the name of the ubo in the shader.

When declaring your uniform options, you ust parse in the value and the type of the uniform.
The types correspond to the WebGPU types

Uniforms can be modified via the classes 'uniforms' property. It will contain all the uniforms declared in the constructor.

```ts
// UBO in shader:
uniform myCoolData { // Declaring a UBO...
    mat4 uCoolMatrix;
    float uFloatyMcFloatFace;
};
```

```js
// A new Uniform Buffer Object...
const myCoolData = new UniformGroup({
    uCoolMatrix: {value:new Matrix(), type: 'mat4<f32>'},
    uFloatyMcFloatFace: {value:23, type: 'f32'},
}}

// modify the data
myCoolData.uniforms.uFloatyMcFloatFace = 42;
// Build a shader...
const shader = Shader.from(srcVert, srcFrag, {
    myCoolData // Name matches the UBO name in the shader. Will be processed accordingly.
})
```

_implements `BindResource`_

```ts
constructor<UNIFORMS>(uniformStructures: UNIFORMS, options?: UniformGroupOptions): UniformGroup<UNIFORMS>
```

**Properties:**

- `defaultOptions: UniformGroupOptions` — The default options used by the uniform group.
- `uid: number` — a unique id for this uniform group used through the renderer
- `uniformStructures: UNIFORMS` — the structures of the uniform group
- `uniforms: ExtractUniformObject<UNIFORMS>` — the uniforms as an easily accessible map of properties
- `ubo: boolean` — true if it should be used as a uniform buffer object
- `buffer: Buffer` (optional) — an underlying buffer that will be uploaded to the GPU when using this UniformGroup
- `isStatic: boolean` — if true, then you are responsible for when the data is uploaded to the GPU.
  otherwise, the data is reuploaded each frame.
- `isUniformGroup: true` — used ito identify if this is a uniform group
- `destroyed: false` — a boolean that indicates if the resource has been destroyed.
  If true, the resource should not be used and any bind groups
  that will release any references to this resource.
  **Methods:**
- `update(): void` — Call this if you want the uniform groups data to be uploaded to the GPU only useful if `isStatic` is true.
