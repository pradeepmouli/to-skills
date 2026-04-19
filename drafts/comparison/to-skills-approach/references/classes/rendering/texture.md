# Classes

## rendering

### `Texture`

A texture stores the information that represents an image or part of an image.

A texture must have a loaded resource passed to it to work. It does not contain any
loading mechanisms.

The Assets class can be used to load a texture from a file. This is the recommended
way as it will handle the loading and caching for you.

```js
const texture = await Assets.load('assets/image.png');

// once Assets has loaded the image it will be available via the from method
const sameTexture = Texture.from('assets/image.png');
// another way to access the texture once loaded
const sameAgainTexture = Assets.get('assets/image.png');

const sprite1 = new Sprite(texture);
```

It cannot be added to the display list directly; instead use it as the texture for a Sprite.
If no frame is provided for a texture, then the whole image is used.

You can directly create a texture from an image and then reuse it multiple times like this :

```js
import { Sprite, Texture } from 'pixi.js';

const texture = await Assets.load('assets/image.png');
const sprite1 = new Sprite(texture);
const sprite2 = new Sprite(texture);
```

If you didn't pass the texture frame to constructor, it enables `noFrame` mode:
it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
_extends `EventEmitter<{ update: Texture; destroy: Texture }>`_
_implements `BindableTexture`_

```ts
constructor<TextureSourceType>(options: TextureOptions<TextureSourceType>): Texture<TextureSourceType>
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
- `updateUvs(): void` — Call this function when you have modified the frame of this texture.
- `destroy(destroySource: boolean): void` — Destroys this texture
- `update(): void` — Call this if you have modified the `texture outside` of the constructor.

If you have modified this texture's source, you must separately call `texture.source.update()` to see those changes.
