# Classes

## rendering

### `RenderTexture`

A render texture, extends `Texture`.
_extends `Texture`_

```ts
constructor(options: TextureOptions<TextureSource<any>>): RenderTexture
```

**Properties:**

- `from: (id: TextureSourceLike, skipCache?: boolean) => Texture` — Helper function that creates a returns Texture based on the source you provide.
  The source should be loaded and ready to go. If not its best to grab the asset using Assets.
- `EMPTY: Texture` — an Empty Texture used internally by the engine
- `WHITE: Texture<BufferImageSource>` — a White texture used internally by the engine
- `label: string` (optional) — label used for debugging
- `uid: number` — unique id for this texture
- `destroyed: boolean` — Has the texture been destroyed?
- `rotate: number` — Indicates whether the texture is rotated inside the atlas
  set to 2 to compensate for texture packer rotation
  set to 6 to compensate for spine packer rotation
  can be used to rotate or mirror sprites
  See groupD8 for explanation
- `uvs: UVs` — A uvs object based on the given frame and the texture source
- `defaultAnchor: { x: number; y: number }` (optional) — Anchor point that is used as default if sprite is created with this texture.
  Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
- `defaultBorders: TextureBorders` (optional) — Default width of the non-scalable border that is used if 9-slice plane is created with this texture.
- `frame: Rectangle` — This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
  irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
- `orig: Rectangle` — This is the area of original texture, before it was put in atlas.
- `trim: Rectangle` — This is the trimmed area of original texture, before it was put in atlas
  Please call `updateUvs()` after you change coordinates of `trim` manually.
- `noFrame: boolean` — Does this Texture have any frame data assigned to it?

This mode is enabled automatically if no frame was passed inside constructor.

In this mode texture is subscribed to baseTexture events, and fires `update` on any change.

Beware, after loading or resize of baseTexture event can fired two times!
If you want more control, subscribe on baseTexture itself.

- `dynamic: boolean` — Set to true if you plan on modifying the uvs of this texture.
  When this is the case, sprites and other objects using the texture will
  make sure to listen for changes to the uvs and update their vertices accordingly.
- `isTexture: true` — is it a texture? yes! used for type checking
  **Methods:**
- `create(options: RenderTextureOptions): RenderTexture` — Creates a RenderTexture. Pass `dynamic: true` in options to allow resizing after creation.
- `resize(width: number, height: number, resolution?: number): this` — Resizes the render texture.
- `updateUvs(): void` — Call this function when you have modified the frame of this texture.
- `destroy(destroySource: boolean): void` — Destroys this texture
- `update(): void` — Call this if you have modified the `texture outside` of the constructor.

If you have modified this texture's source, you must separately call `texture.source.update()` to see those changes.
