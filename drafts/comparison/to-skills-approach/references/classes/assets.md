# Classes

## assets

### `BackgroundLoader`

The BackgroundLoader handles loading assets passively in the background to prepare them for future use.
It loads one asset at a time to minimize impact on application performance.

Key features:

- Sequential loading of assets
- Automatic pause when high-priority loads occur
- Configurable concurrency

```ts
constructor(loader: Loader, verbose: boolean): BackgroundLoader
```

**Properties:**

- `verbose: boolean` — Should the loader log to the console.

```ts
import { Assets } from 'pixi.js';

// Background load level assets while in menu
Assets.backgroundLoad(['level1/background.png', 'level1/sprites.json', 'level1/music.mp3']);

// Assets will be instantly available when needed
const assets = await Assets.load(['level1/background.png', 'level1/sprites.json']);

// Background load bundles
Assets.backgroundLoadBundle('level2');

// Later, instant access
const level2 = await Assets.loadBundle('level2');
```

> [!NOTE] You typically do not need to use this class directly. Use the main Assets.backgroundLoad API instead.

### `Loader`

The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
It does not do anything clever with URLs - it just loads stuff!
Behind the scenes all things are cached using promises. This means it's impossible to load an asset more than once.
Through the use of LoaderParsers, the loader can understand how to load any kind of file!

It is not intended that this class is created by developers - its part of the Asset class
This is the second major system of PixiJS' main Assets class

```ts
constructor(): Loader
```

**Properties:**

- `defaultOptions: LoadOptions` — Default options for loading assets
- `loadOptions: LoadOptions` — Options for loading assets with the loader.
  These options will be used as defaults for all load calls made with this loader instance.
  They can be overridden by passing options directly to the load method.
- `parsers: LoaderParser<any, any, Record<string, any>>[]` — All loader parsers registered
- `promiseCache: Record<string, PromiseAndParser>` — Cache loading promises that ae currently active
  **Methods:**
- `reset(): void` — function used for testing
- `load<T>(assetsToLoadIn: string | ResolvedAsset<any>, onProgress?: LoadOptions | ProgressCallback): Promise<T>` — Loads one or more assets using the parsers added to the Loader.
- `unload(assetsToUnloadIn: string | string[] | ResolvedAsset<any> | ResolvedAsset<any>[]): Promise<void>` — Unloads one or more assets. Any unloaded assets will be destroyed, freeing up memory for your app.
  The parser that created the asset, will be the one that unloads it.

### `Resolver`

A class that is responsible for resolving mapping asset URLs to keys.
At its most basic it can be used for Aliases:

```js
resolver.add('foo', 'bar');
resolver.resolveUrl('foo'); // => 'bar'
```

It can also be used to resolve the most appropriate asset for a given URL:

```js
resolver.prefer({
  params: {
    format: 'webp',
    resolution: 2
  }
});

resolver.add('foo', ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);

resolver.resolveUrl('foo'); // => 'bar@2x.webp'
```

Other features include:

- Ability to process a manifest file to get the correct understanding of how to resolve all assets
- Ability to add custom parsers for specific file types
- Ability to add custom prefer rules

This class only cares about the URL, not the loading of the asset itself.

It is not intended that this class is created by developers - its part of the Asset class
This is the third major system of PixiJS' main Assets class

```ts
constructor(): Resolver
```

**Properties:**

- `RETINA_PREFIX: RegExp` — The prefix that denotes a URL is for a retina asset.
  **Methods:**
- `setBundleIdentifier(bundleIdentifier: BundleIdentifierOptions): void` — Override how the resolver deals with generating bundle ids.
  must be called before any bundles are added
- `prefer(preferOrders: PreferOrder[]): void` — Let the resolver know which assets you prefer to use when resolving assets.
  Multiple prefer user defined rules can be added.
- `reset(): void` — Used for testing, this resets the resolver to its initial state
- `setDefaultSearchParams(searchParams: string | Record<string, unknown>): void` — Sets the default URL search parameters for the URL resolver. The urls can be specified as a string or an object.
- `getAlias(asset: UnresolvedAsset): string[]` — Returns the aliases for a given asset
- `removeAlias(alias: string, asset?: ResolvedAsset): void` — Removes the specified alias for an asset.

This only removes the alias mapping. It does **not** remove, unload, or destroy the
underlying asset. If the asset is already cached, it stays in memory until you call
`Assets.unload`.

If `asset` is provided, the alias is only removed when the resolver's current mapping for
that alias matches the given `ResolvedAsset`. This lets you avoid accidentally removing an
alias that has been reassigned.

Silently returns if the alias does not exist or the asset does not match.

- `addManifest(manifest: AssetsManifest): void` — Add a manifest to the asset resolver. This is a nice way to add all the asset information in one go.
  generally a manifest would be built using a tool.
- `addBundle(bundleId: string, assets: Record<string, ArrayOr<string> | UnresolvedAsset<any>> | UnresolvedAsset<any>[]): void` — This adds a bundle of assets in one go so that you can resolve them as a group.
  For example you could add a bundle for each screen in you pixi app
- `add(aliases: ArrayOr<UnresolvedAsset>): void` — Tells the resolver what keys are associated with witch asset.
  The most important thing the resolver does
- `resolveBundle(bundleIds: ArrayOr<string>): Record<string, ResolvedAsset<any>> | Record<string, Record<string, ResolvedAsset<any>>>` — If the resolver has had a manifest set via setManifest, this will return the assets urls for
  a given bundleId or bundleIds.
- `resolveUrl(key: ArrayOr<string>): string | Record<string, string>` — Does exactly what resolve does, but returns just the URL rather than the whole asset object
- `resolve(keys: string): ResolvedAsset` — Resolves each key in the list to an asset object.
  Another key function of the resolver! After adding all the various key/asset pairs. this will run the logic
  of finding which asset to return based on any preferences set using the `prefer` function
  by default the same key passed in will be returned if nothing is matched by the resolver.
- `hasKey(key: string): boolean` — Checks if an asset with a given key exists in the resolver
- `hasBundle(key: string): boolean` — Checks if a bundle with the given key exists in the resolver

### `Spritesheet`

Utility class for maintaining reference to a collection
of Textures on a single Spritesheet.

To access a sprite sheet from your code you may pass its JSON data file to Pixi's loader:

```js
import { Assets } from 'pixi.js';

const sheet = await Assets.load('images/spritesheet.json');
```

Alternately, you may circumvent the loader by instantiating the Spritesheet directly:

```js
import { Spritesheet } from 'pixi.js';

const sheet = new Spritesheet(texture, spritesheetData);
await sheet.parse();
console.log('Spritesheet ready to use!');
```

With the `sheet.textures` you can create Sprite objects, and `sheet.animations` can be used to create an AnimatedSprite.

Here's an example of a sprite sheet JSON data file:

```json
{
  "frames": {
    "enemy1.png": {
      "frame": { "x": 103, "y": 1, "w": 32, "h": 32 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 },
      "anchor": { "x": 0.5, "y": 0.5 }
    },
    "enemy2.png": {
      "frame": { "x": 103, "y": 35, "w": 32, "h": 32 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 },
      "anchor": { "x": 0.5, "y": 0.5 }
    },
    "button.png": {
      "frame": { "x": 1, "y": 1, "w": 100, "h": 100 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 100, "h": 100 },
      "sourceSize": { "w": 100, "h": 100 },
      "anchor": { "x": 0, "y": 0 },
      "borders": { "left": 35, "top": 35, "right": 35, "bottom": 35 }
    }
  },

  "animations": {
    "enemy": ["enemy1.png", "enemy2.png"]
  },

  "meta": {
    "image": "sheet.png",
    "format": "RGBA8888",
    "size": { "w": 136, "h": 102 },
    "scale": "1"
  }
}
```

Sprite sheets can be packed using tools like https://codeandweb.com/texturepacker|TexturePacker,
https://renderhjs.net/shoebox/|Shoebox or https://github.com/krzysztof-o/spritesheet.js|Spritesheet.js.
Default anchor points (see Texture#defaultAnchor), default 9-slice borders
(see Texture#defaultBorders) and grouping of animation sprites are currently only
supported by TexturePacker.

Alternative ways for loading spritesheet image if you need more control:

```js
import { Assets } from 'pixi.js';

const sheetTexture = await Assets.load('images/spritesheet.png');
Assets.add({
  alias: 'atlas',
  src: 'images/spritesheet.json',
  data: { texture: sheetTexture } // using of preloaded texture
});
const sheet = await Assets.load('atlas');
```

or:

```js
import { Assets } from 'pixi.js';

Assets.add({
  alias: 'atlas',
  src: 'images/spritesheet.json',
  data: { imageFilename: 'my-spritesheet.2x.avif' } // using of custom filename located in "images/my-spritesheet.2x.avif"
});
const sheet = await Assets.load('atlas');
```

```ts
constructor<S>(options: SpritesheetOptions<S>): Spritesheet<S>
```

**Properties:**

- `BATCH_SIZE: 1000` — The maximum number of Textures to build per process.
- `linkedSheets: Spritesheet<S>[]` — For multi-packed spritesheets, this contains a reference to all the other spritesheets it depends on.
- `textureSource: TextureSource` — Reference to the source texture.
- `textures: Record<keyof S["frames"], Texture>` — A map containing all textures of the sprite sheet.
  Can be used to create a Sprite:
- `animations: Record<keyof NonNullable<S["animations"]>, Texture[]>` — A map containing the textures for each animation.
  Can be used to create an AnimatedSprite:
- `data: S` — Reference to the original JSON data.
- `resolution: number` — The resolution of the spritesheet.
- `cachePrefix: string` — Prefix string to add to global cache
  **Methods:**
- `parse(): Promise<Record<string, Texture<TextureSource<any>>>>` — Parse spritesheet from loaded data. This is done asynchronously
  to prevent creating too many Texture within a single process.
- `parseSync(): Record<keyof S["frames"], Texture>` — Parse spritesheet from loaded data. This is done synchronously
  and is only suitable for smaller spritesheets (less than ~1000 frames)
  or may cause too many Texture within a single process. However, synchronous parsing may be
  more convenient since the called does not need to be asynchronous and is safe for
  small-to-medium sized spritesheets.

Other than being synchronous, `parseSync` is otherwise identical to `.parse()`.

- `destroy(destroyBase?: boolean): void` — Destroy Spritesheet and don't use after this.
