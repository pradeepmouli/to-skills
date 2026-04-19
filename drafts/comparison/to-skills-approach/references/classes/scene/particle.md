# Classes

## scene

### `Particle`

Represents a single particle within a particle container. This class implements the IParticle interface,
providing properties and methods to manage the particle's position, scale, rotation, color, and texture.

The reason we use a particle over a sprite is that these are much lighter weight and we can create a lot of them
without taking on the overhead of a full sprite.
_implements `IParticle`_

```ts
constructor(options: Texture<TextureSource<any>> | ParticleOptions): Particle
```

**Properties:**

- `defaultOptions: Partial<ParticleOptions>` — Default options used when creating new particles. These values are applied when specific
  options aren't provided in the constructor.
- `anchorX: number` — The x-coordinate of the anchor point (0-1).
  Controls the origin point for rotation and scaling.
- `anchorY: number` — The y-coordinate of the anchor point (0-1).
  Controls the origin point for rotation and scaling.
- `x: number` — The x-coordinate of the particle in world space.
- `y: number` — The y-coordinate of the particle in world space.
- `scaleX: number` — The horizontal scale factor of the particle.
  Values greater than 1 increase size, less than 1 decrease size.
- `scaleY: number` — The vertical scale factor of the particle.
  Values greater than 1 increase size, less than 1 decrease size.
- `rotation: number` — The rotation of the particle in radians.
  Positive values rotate clockwise.
- `color: number` — The color of the particle as a 32-bit RGBA value.
  Combines tint and alpha into a single value.
- `texture: Texture` — The texture used to render this particle.
  All particles in a container should share the same base texture.

```javascript
const particle = new Particle({
  texture,
  x: 100,
  y: 100,
  scaleX: 0.5,
  scaleY: 0.5,
  rotation: Math.PI / 2,
  color: 0xff0000
});
```
