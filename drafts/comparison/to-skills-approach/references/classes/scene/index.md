# scene

| Class               | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| [Culler](culler.md) | The Culler class is responsible for managing and culling containers. |

Culling optimizes rendering performance by skipping objects outside the visible area.

> [!IMPORTANT] culling is not always a golden bullet, it can be more expensive than rendering
> objects that are not visible, so it is best used in scenarios where you have many objects
> that are not visible at the same time, such as in large scenes or games with many sprites. |
> | [DOMContainer](domcontainer.md) | The DOMContainer object is used to render DOM elements within the PixiJS scene graph.
> It allows you to integrate HTML elements into your PixiJS application while maintaining
> proper transform hierarchy and visibility.

DOMContainer is especially useful for rendering standard DOM elements
that handle user input, such as `<input>` or `<textarea>`.
This is often simpler and more flexible than trying to implement text input
directly in PixiJS. For instance, if you need text fields or text areas,
you can embed them through this container for native browser text handling.

--------- EXPERIMENTAL ---------

This is a new API, things may change and it may not work as expected.
We want to hear your feedback as we go!

-------------------------------- |
| [Container](container.md) | Container is a general-purpose display object that holds children. It also adds built-in support for advanced
rendering features like masking and filtering.

It is the base class of all display objects that act as a container for other objects, including Graphics
and Sprite.

<details id="transforms">

<summary>Transforms</summary>

The [transform]Container#localTransform of a display object describes the projection from its
local coordinate space to its parent's local coordinate space. The following properties are derived
from the transform:

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[pivot]Container#pivot</td>
      <td>
        Invariant under rotation, scaling, and skewing. The projection of into the parent's space of the pivot
        is equal to position, regardless of the other three transformations. In other words, It is the center of
        rotation, scaling, and skewing.
      </td>
    </tr>
    <tr>
      <td>[position]Container#position</td>
      <td>
        Translation. This is the position of the [pivot]Container#pivot in the parent's local
        space. The default value of the pivot is the origin (0,0). If the top-left corner of your display object
        is (0,0) in its local space, then the position will be its top-left corner in the parent's local space.
      </td>
    </tr>
    <tr>
      <td>[scale]Container#scale</td>
      <td>
        Scaling. This will stretch (or compress) the display object's projection. The scale factors are along the
        local coordinate axes. In other words, the display object is scaled before rotated or skewed. The center
        of scaling is the [pivot]Container#pivot.
      </td>
    </tr>
    <tr>
      <td>[rotation]Container#rotation</td>
      <td>
         Rotation. This will rotate the display object's projection by this angle (in radians).
      </td>
    </tr>
    <tr>
      <td>[skew]Container#skew</td>
      <td>
        <p>Skewing. This can be used to deform a rectangular display object into a parallelogram.</p>
        <p>
        In PixiJS, skew has a slightly different behaviour than the conventional meaning. It can be
        thought of the net rotation applied to the coordinate axes (separately). For example, if "skew.x" is
        ⍺ and "skew.y" is β, then the line x = 0 will be rotated by ⍺ (y = -x*cot⍺) and the line y = 0 will be
        rotated by β (y = x*tanβ). A line y = x*tanϴ (i.e. a line at angle ϴ to the x-axis in local-space) will
        be rotated by an angle between ⍺ and β.
        </p>
        <p>
        It can be observed that if skew is applied equally to both axes, then it will be equivalent to applying
        a rotation. Indeed, if "skew.x" = -ϴ and "skew.y" = ϴ, it will produce an equivalent of "rotation" = ϴ.
        </p>
        <p>
        Another quite interesting observation is that "skew.x", "skew.y", rotation are commutative operations. Indeed,
        because rotation is essentially a careful combination of the two.
        </p>
      </td>
    </tr>
    <tr>
      <td>[angle]Container#angle</td>
      <td>Rotation. This is an alias for [rotation]Container#rotation, but in degrees.</td>
    </tr>
    <tr>
      <td>[x]Container#x</td>
      <td>Translation. This is an alias for position.x!</td>
    </tr>
    <tr>
      <td>[y]Container#y</td>
      <td>Translation. This is an alias for position.y!</td>
    </tr>
    <tr>
      <td>[width]Container#width</td>
      <td>
        Implemented in [Container]Container. Scaling. The width property calculates scale.x by dividing
        the "requested" width by the local bounding box width. It is indirectly an abstraction over scale.x, and there
        is no concept of user-defined width.
      </td>
    </tr>
    <tr>
      <td>[height]Container#height</td>
      <td>
        Implemented in [Container]Container. Scaling. The height property calculates scale.y by dividing
        the "requested" height by the local bounding box height. It is indirectly an abstraction over scale.y, and there
        is no concept of user-defined height.
      </td>
    </tr>
  </tbody>
</table>
</details>

<details id="alpha">
<summary>Alpha</summary>

This alpha sets a display object's **relative opacity** w.r.t its parent. For example, if the alpha of a display
object is 0.5 and its parent's alpha is 0.5, then it will be rendered with 25% opacity (assuming alpha is not
applied on any ancestor further up the chain).

</details>

<details id="visible">
<summary>Renderable vs Visible</summary>

The `renderable` and `visible` properties can be used to prevent a display object from being rendered to the
screen. However, there is a subtle difference between the two. When using `renderable`, the transforms of the display
object (and its children subtree) will continue to be calculated. When using `visible`, the transforms will not
be calculated.

```ts
import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js';

const container = new Container();
const sprite = Sprite.from('https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png');

sprite.width = 512;
sprite.height = 512;

// Adds a sprite as a child to this container. As a result, the sprite will be rendered whenever the container
// is rendered.
container.addChild(sprite);

// Blurs whatever is rendered by the container
container.filters = [new BlurFilter()];

// Only the contents within a circle at the center should be rendered onto the screen.
container.mask = new Graphics()
  .beginFill(0xffffff)
  .drawCircle(sprite.width / 2, sprite.height / 2, Math.min(sprite.width, sprite.height) / 2)
  .endFill();
```

</details>

<details id="renderGroup">
<summary>RenderGroup</summary>

In PixiJS v8, containers can be set to operate in 'render group mode',
transforming them into entities akin to a stage in traditional rendering paradigms.
A render group is a root renderable entity, similar to a container,
but it's rendered in a separate pass with its own unique set of rendering instructions.
This approach enhances rendering efficiency and organization, particularly in complex scenes.

You can enable render group mode on any container using container.enableRenderGroup()
or by initializing a new container with the render group property set to true (new Container({isRenderGroup: true})).
The method you choose depends on your specific use case and setup requirements.

An important aspect of PixiJS’s rendering process is the automatic treatment of rendered scenes as render groups.
This conversion streamlines the rendering process, but understanding when and how this happens is crucial
to fully leverage its benefits.

One of the key advantages of using render groups is the performance efficiency in moving them. Since transformations
are applied at the GPU level, moving a render group, even one with complex and numerous children,
doesn't require recalculating the rendering instructions or performing transformations on each child.
This makes operations like panning a large game world incredibly efficient.

However, it's crucial to note that render groups do not batch together.
This means that turning every container into a render group could actually slow things down,
as each render group is processed separately. It's best to use render groups judiciously, at a broader level,
rather than on a per-child basis.
This approach ensures you get the performance benefits without overburdening the rendering process.

RenderGroups maintain their own set of rendering instructions,
ensuring that changes or updates within a render group don't affect the rendering
instructions of its parent or other render groups.
This isolation ensures more stable and predictable rendering behavior.

Additionally, renderGroups can be nested, allowing for powerful options in organizing different aspects of your scene.
This feature is particularly beneficial for separating complex game graphics from UI elements,
enabling intricate and efficient scene management in complex applications.

This means that Containers have 3 levels of matrix to be mindful of:

1. localTransform, this is the transform of the container based on its own properties
2. groupTransform, this it the transform of the container relative to the renderGroup it belongs too
3. worldTransform, this is the transform of the container relative to the Scene being rendered
</details> |
| [RenderContainer](rendercontainer.md) | A container that allows for custom rendering logic. Its essentially calls the render function each frame
and allows for custom rendering logic - the render could be a WebGL renderer or WebGPU render or even a canvas render.
Its up to you to define the logic.

This can be used in two ways, either by extending the class and overriding the render method,
or by passing a custom render function |
| [FillGradient](fillgradient.md) | Class representing a gradient fill that can be used to fill shapes and text.
Supports both linear and radial gradients with multiple color stops.

For linear gradients, color stops define colors and positions (0 to 1) along a line from start point (x0,y0)
to end point (x1,y1).

For radial gradients, color stops define colors between two circles - an inner circle centered at (x0,y0) with radius r0,
and an outer circle centered at (x1,y1) with radius r1. |
| [FillPattern](fillpattern.md) | A class that represents a fill pattern for use in Text and Graphics fills.
It allows for textures to be used as patterns, with optional repetition modes. |
| [Graphics](graphics.md) | The Graphics class is primarily used to render primitive shapes such as lines, circles and
rectangles to the display, and to color and fill them. It can also be used to create complex
masks and hit areas for interaction. |
| [GraphicsContext](graphicscontext.md) | The GraphicsContext class allows for the creation of lightweight objects that contain instructions for drawing shapes and paths.
It is used internally by the Graphics class to draw shapes and paths, and can be used directly and shared between Graphics objects,

This sharing of a `GraphicsContext` means that the intensive task of converting graphics instructions into GPU-ready geometry is done once, and the results are reused,
much like sprites reusing textures. |
| [GraphicsPath](graphicspath.md) | The `GraphicsPath` class is designed to represent a graphical path consisting of multiple drawing instructions.
This class serves as a collection of drawing commands that can be executed to render shapes and paths on a canvas or
similar graphical context. It supports high-level drawing operations like lines, arcs, curves, and more, enabling
complex graphic constructions with relative ease. |
| [ShapePath](shapepath.md) | The `ShapePath` class acts as a bridge between high-level drawing commands
and the lower-level `GraphicsContext` rendering engine.
It translates drawing commands, such as those for creating lines, arcs, ellipses, rectangles, and complex polygons, into a
format that can be efficiently processed by a `GraphicsContext`. This includes handling path starts,
ends, and transformations for shapes.

It is used internally by `GraphicsPath` to build up the path. |
| [RenderLayer](renderlayer.md) | The RenderLayer API provides a way to control the rendering order of objects independently
of their logical parent-child relationships in the scene graph.
This allows developers to decouple how objects are transformed
(via their logical parent) from how they are rendered on the screen.

### Key Concepts

#### RenderLayers Control Rendering Order:

- RenderLayers define where in the render stack objects are drawn,
  but they do not affect an object's transformations (e.g., position, scale, rotation) or logical hierarchy.
- RenderLayers can be added anywhere in the scene graph.

#### Logical Parenting Remains Unchanged:

- Objects still have a logical parent for transformations via addChild.
- Assigning an object to a layer does not reparent it.

#### Explicit Control:

- Developers assign objects to layers using renderLayer.add and remove them using renderLayer.remove.

---

### API Details

#### 1. Creating a RenderLayer

A RenderLayer is a lightweight object responsible for controlling render order.
It has no children or transformations of its own
but can be inserted anywhere in the scene graph to define its render position.

```js
const layer = new RenderLayer();
app.stage.addChild(layer); // Insert the layer into the scene graph
```

#### 2. Adding Objects to a Layer

Use renderLayer.add to assign an object to a layer.
This overrides the object's default render order defined by its logical parent.

```js
const rect = new Graphics();
container.addChild(rect); // Add to logical parent
layer.attach(rect); // Control render order via the layer
```

#### 3. Removing Objects from a Layer

To stop an object from being rendered in the layer, use remove.

```js
layer.remove(rect); // Stop rendering rect via the layer
```

When an object is removed from its logical parent (removeChild), it is automatically removed from the layer.

#### 4. Re-Adding Objects to Layers

If an object is re-added to a logical parent, it does not automatically reassign itself to the layer.
Developers must explicitly reassign it.

```js
container.addChild(rect); // Logical parent
layer.attach(rect); // Explicitly reassign to the layer
```

#### 5. Layer Position in Scene Graph

A layer's position in the scene graph determines its render priority relative to other layers and objects.
Layers can be inserted anywhere in the scene graph.

```js
const backgroundLayer = new RenderLayer();
const uiLayer = new RenderLayer();

app.stage.addChild(backgroundLayer);
app.stage.addChild(world);
app.stage.addChild(uiLayer);
```

This is a new API and therefore considered experimental at this stage.
While the core is pretty robust, there are still a few tricky issues we need to tackle.
However, even with the known issues below, we believe this API is incredibly useful!

Known issues:

- Interaction may not work as expected since hit testing does not account for the visual render order created by layers.
  For example, if an object is visually moved to the front via a layer, hit testing will still use its original position.
- RenderLayers and their children must all belong to the same renderGroup to work correctly.
- Filters on ancestor containers do not apply to children attached to a RenderLayer.
  This is because render layer children are rendered outside their parent's filter scope
  (filters capture children into a texture via push/pop, but render layer children skip
  their parent's collection and render at the layer's position instead). |
  | [PerspectiveMesh](perspectivemesh.md) | A perspective mesh that allows you to draw a 2d plane with perspective. Where ever you move the corners
  the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.

The calculations is done at the uv level. This means that the more vertices you have the more smooth
the perspective will be. If you have a low amount of vertices you may see the texture stretch. Too many vertices
could be slower. It is a balance between performance and quality! We leave that to you to decide.

> [!IMPORTANT] This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it. |
> | [PerspectivePlaneGeometry](perspectiveplanegeometry.md) | A PerspectivePlaneGeometry allows you to draw a 2d plane with perspective. Where ever you move the corners
> the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.

IMPORTANT: This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it :)

````js
const perspectivePlaneGeometry = new PerspectivePlaneGeometry({
 width: 100,
 height: 100,
 verticesX: 10,
 verticesY: 10,
});
``` |
| [MeshPlane](meshplane.md) | A mesh that renders a texture mapped to a plane with configurable vertex density.
Useful for creating distortion effects, bent surfaces, and animated deformations. |
| [PlaneGeometry](planegeometry.md) | The PlaneGeometry allows you to draw a 2d plane |
| [MeshRope](meshrope.md) | A specialized mesh that renders a texture along a path defined by points. Perfect for
creating snake-like animations, chains, ropes, and other flowing objects. |
| [MeshSimple](meshsimple.md) | A simplified mesh class that provides an easy way to create and manipulate textured meshes
with direct vertex control. Perfect for creating custom shapes, deformable sprites, and
simple 2D effects. |
| [RopeGeometry](ropegeometry.md) | RopeGeometry allows you to draw a geometry across several points and then manipulate these points. |
| [Mesh](mesh.md) | Base mesh class.

This class empowers you to have maximum flexibility to render any kind of WebGL/WebGPU visuals you can think of.
This class assumes a certain level of WebGL/WebGPU knowledge.
If you know a bit this should abstract enough away to make your life easier!

Pretty much ALL WebGL/WebGPU can be broken down into the following:
- Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
- Shader - This is the shader that PixiJS will render the geometry with (attributes in the shader must match the geometry)
- State - This is the state of WebGL required to render the mesh.

Through a combination of the above elements you can render anything you want, 2D or 3D! |
| [MeshGeometry](meshgeometry.md) | A geometry used to batch multiple meshes with the same texture. |
| [Particle](particle.md) | Represents a single particle within a particle container. This class implements the IParticle interface,
providing properties and methods to manage the particle's position, scale, rotation, color, and texture.

The reason we use a particle over a sprite is that these are much lighter weight and we can create a lot of them
without taking on the overhead of a full sprite. |
| [ParticleContainer](particlecontainer.md) | The ParticleContainer class is a highly optimized container that can render 1000s or particles at great speed.

A ParticleContainer is specialized in that it can only contain and render particles. Particles are
lightweight objects that use minimal memory, which helps boost performance.

It can render particles EXTREMELY fast!

The tradeoff of using a ParticleContainer is that most advanced functionality is unavailable. Particles are simple
and cannot have children, filters, masks, etc. They possess only the basic properties: position, scale, rotation,
and color.

All particles must share the same texture source (using something like a sprite sheet works well here).

When creating a ParticleContainer, a developer can specify which of these properties are static and which are dynamic.
- Static properties are only updated when you add or remove a child, or when the `update` function is called.
- Dynamic properties are updated every frame.

It is up to the developer to specify which properties are static and which are dynamic. Generally, the more static
properties you have (i.e., those that do not change per frame), the faster the rendering.

If the developer modifies the children order or any static properties of the particle, they must call the `update` method.

By default, only the `position` property is set to dynamic, which makes rendering very fast!

Developers can also provide a custom shader to the particle container, allowing them to render particles in a custom way.

To help with performance, the particle containers bounds are not calculated.
It's up to the developer to set the boundsArea property.

It's extremely easy to use. Below is an example of rendering thousands of sprites at lightning speed.

--------- EXPERIMENTAL ---------

This is a new API, things may change and it may not work as expected.
We want to hear your feedback as we go!

-------------------------------- |
| [AnimatedSprite](animatedsprite.md) | An AnimatedSprite is a simple way to display an animation depicted by a list of textures. |
| [NineSliceGeometry](nineslicegeometry.md) | The NineSliceGeometry class allows you to create a NineSlicePlane object. |
| [NineSliceSprite](nineslicesprite.md) | The NineSliceSprite allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically

<pre>
     A                          B
   +---+----------------------+---+
 C | 1 |          2           | 3 |
   +---+----------------------+---+
   |   |                      |   |
   | 4 |          5           | 6 |
   |   |                      |   |
   +---+----------------------+---+
 D | 7 |          8           | 9 |
   +---+----------------------+---+
 When changing this objects width and/or height:
    areas 1 3 7 and 9 will remain unscaled.
    areas 2 and 8 will be stretched horizontally
    areas 4 and 6 will be stretched vertically
    area 5 will be stretched both horizontally and vertically
</pre> |
| [NineSlicePlane](ninesliceplane.md) | Please use the NineSliceSprite class instead.
The NineSlicePlane is deprecated and will be removed in future versions. |
| [TilingSprite](tilingsprite.md) | A TilingSprite is a fast and efficient way to render a repeating texture across a given area.
The texture can be scrolled, scaled, and rotated independently of the sprite itself. |
| [Sprite](sprite.md) | The Sprite object is one of the most important objects in PixiJS. It is a
drawing item that can be added to a scene and rendered to the screen.
Sprites can display images, handle input events, and be transformed in various ways. |
| [ViewContainer](viewcontainer.md) | A ViewContainer is a type of container that represents a view.
This view can be a Sprite, a Graphics object, or any other object that can be rendered.
This class is abstract and should not be used directly. |
````
