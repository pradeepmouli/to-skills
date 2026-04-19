# Classes

## rendering

### `RenderGroup`

A RenderGroup is a class that is responsible for I generating a set of instructions that are used to render the
root container and its children. It also watches for any changes in that container or its children,
these changes are analysed and either the instruction set is rebuild or the instructions data is updated.
_implements `Instruction`_

```ts
constructor(): RenderGroup
```

**Properties:**

- `renderPipeId: string` — a the id of the render pipe that can run this instruction
- `root: Container`
- `canBundle: boolean` — true if this instruction can be compiled into a WebGPU bundle
- `renderGroupParent: RenderGroup`
- `renderGroupChildren: RenderGroup[]`
- `worldTransform: Matrix`
- `worldColorAlpha: number`
- `worldColor: number`
- `worldAlpha: number`
- `childrenToUpdate: Record<number, { list: Container[]; index: number }>`
- `updateTick: number`
- `gcTick: number`
- `childrenRenderablesToUpdate: { list: Container<ContainerChild>[]; index: number }`
- `structureDidChange: boolean`
- `instructionSet: InstructionSet`
- `textureNeedsUpdate: boolean` — Indicates if the cached texture needs to be updated.
- `isCachedAsTexture: boolean` — Indicates if the container should be cached as a texture.
- `texture: Texture` (optional) — The texture used for caching the container. this is only set if isCachedAsTexture is true.
  It can only be accessed after a render pass.
- `_textureBounds: Bounds` (optional) — The bounds of the cached texture.
- `textureOptions: CacheAsTextureOptions` — The options for caching the container as a texture.
- `_batchableRenderGroup: BatchableSprite` — holds a reference to the batchable render sprite
- `_parentCacheAsTextureRenderGroup: RenderGroup` — Holds a reference to the closest parent RenderGroup that has isCachedAsTexture enabled.
  This is used to properly transform coordinates when rendering into cached textures.
  **Methods:**
- `init(root: Container): void`
- `enableCacheAsTexture(options: CacheAsTextureOptions): void`
- `disableCacheAsTexture(): void`
- `updateCacheTexture(): void`
- `reset(): void`
- `addRenderGroupChild(renderGroupChild: RenderGroup): void`
- `addChild(child: Container): void`
- `removeChild(child: Container): void`
- `removeChildren(children: Container<ContainerChild>[]): void`
- `onChildUpdate(child: Container): void`
- `updateRenderable(renderable: ViewContainer): void`
- `onChildViewUpdate(child: Container): void`
- `addOnRender(container: Container): void` — adding a container to the onRender list will make sure the user function
  passed in to the user defined 'onRender` callBack
- `removeOnRender(container: Container): void`
- `runOnRender(renderer: Renderer): void`
- `destroy(): void`
- `getChildren(out: Container<ContainerChild>[]): Container<ContainerChild>[]`
- `invalidateMatrices(): void`
