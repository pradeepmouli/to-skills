# Classes

## rendering

### `BufferImageSource`

A texture source that uses a TypedArray or ArrayBuffer as its resource.
It automatically determines the format based on the type of TypedArray provided.
_extends `TextureSource<TypedArray | ArrayBuffer>`_

```ts
constructor(options: BufferSourceOptions): BufferImageSource
```

**Properties:**

- `extension: ExtensionMetadata`
- `defaultOptions: TextureSourceOptions` — The default options used when creating a new TextureSource. override these to add your own defaults
- `from: (resource: TextureResourceOrOptions) => TextureSource` — A helper function that creates a new TextureSource based on the resource you provide.
- `_gcData: GCData` (optional) — GC tracking data, undefined if not being tracked
- `uid: number` — unique id for this Texture source
- `label: string` — optional label, can be used for debugging
- `pixelWidth: number` — the pixel width of this texture source. This is the REAL pure number, not accounting resolution
- `pixelHeight: number` — the pixel height of this texture source. This is the REAL pure number, not accounting resolution
- `width: number` — the width of this texture source, accounting for resolution
  eg pixelWidth 200, resolution 2, then width will be 100
- `height: number` — the height of this texture source, accounting for resolution
  eg pixelHeight 200, resolution 2, then height will be 100
- `resource: ArrayBuffer | TypedArray` — the resource that will be uploaded to the GPU. This is where we get our pixels from
  eg an ImageBimt / Canvas / Video etc
- `mipLevelCount: number` — The number of mip levels to generate for this texture.
  this is overridden if autoGenerateMipmaps is true. it is read only!
- `autoGenerateMipmaps: boolean` — Should we auto generate mipmaps for this texture? This will automatically generate mipmaps
  for this texture when uploading to the GPU. Mipmapped textures take up more memory, but
  can look better when scaled down.

For performance reasons, it is recommended to NOT use this with RenderTextures, as they are often updated every frame.
If you do, make sure to call `updateMipmaps` after you update the texture.

- `format: TEXTURE_FORMATS` — the format that the texture data has
- `dimension: TEXTURE_DIMENSIONS` — how many dimensions does this texture have? currently v8 only supports 2d
- `viewDimension: TEXTURE_VIEW_DIMENSIONS` — how this texture is viewed/sampled by shaders (WebGPU view dimension)
- `arrayLayerCount: number` — how many array layers this texture has (WebGPU depthOrArrayLayers)
- `alphaMode: ALPHA_MODES` — the alpha mode of the texture
- `antialias: boolean` — Only really affects RenderTextures.
  Should we use antialiasing for this texture. It will look better, but may impact performance as a
  Blit operation will be required to resolve the texture.
- `destroyed: boolean` — Has the source been destroyed?
- `_touched: number` — Used by automatic texture Garbage Collection, stores last GC tick when it was bound
- `_batchTick: number` — Used by the batcher to build texture batches. faster to have the variable here!
- `_textureBindLocation: number` — A temporary batch location for the texture batching. Here for performance reasons only!
- `isPowerOfTwo: boolean`
- `autoGarbageCollect: boolean` — If true, the Garbage Collector will unload this texture if it is not used after a period of time
- `_sourceOrigin: string` — used internally to know where a texture came from. Usually assigned by the asset loader!
  **Methods:**
- `test(resource: any): resource is ArrayBuffer | TypedArray`
- `update(): void` — call this if you have modified the texture outside of the constructor
- `destroy(): void` — Destroys this texture source
- `unload(): void` — This will unload the Texture source from the GPU. This will free up the GPU memory
  As soon as it is required fore rendering, it will be re-uploaded.
- `resize(width?: number, height?: number, resolution?: number): boolean` — Resize the texture, this is handy if you want to use the texture as a render texture
- `updateMipmaps(): void` — Lets the renderer know that this texture has been updated and its mipmaps should be re-generated.
  This is only important for RenderTexture instances, as standard Texture instances will have their
  mipmaps generated on upload. You should call this method after you make any change to the texture

The reason for this is is can be quite expensive to update mipmaps for a texture. So by default,
We want you, the developer to specify when this action should happen.

Generally you don't want to have mipmaps generated on Render targets that are changed every frame,
