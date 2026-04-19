# Classes

## scene

### `FillGradient`

Class representing a gradient fill that can be used to fill shapes and text.
Supports both linear and radial gradients with multiple color stops.

For linear gradients, color stops define colors and positions (0 to 1) along a line from start point (x0,y0)
to end point (x1,y1).

For radial gradients, color stops define colors between two circles - an inner circle centered at (x0,y0) with radius r0,
and an outer circle centered at (x1,y1) with radius r1.
_implements `CanvasGradient`_

```ts
constructor(options: GradientOptions): FillGradient
```

**Properties:**

- `defaultLinearOptions: LinearGradientOptions` — Default options for creating a gradient fill
- `defaultRadialOptions: RadialGradientOptions` — Default options for creating a radial gradient fill
- `type: GradientType` — Type of gradient - currently only supports 'linear'
- `texture: Texture` — Internal texture used to render the gradient
- `transform: Matrix` — Transform matrix for positioning the gradient
- `colorStops: { offset: number; color: string }[]` — Array of color stops defining the gradient
- `textureSpace: TextureSpace` — Whether gradient coordinates are in local or global space
- `start: PointData` — The start point of the linear gradient
- `end: PointData` — The end point of the linear gradient
- `center: PointData` — The center point of the inner circle of the radial gradient
- `outerCenter: PointData` — The center point of the outer circle of the radial gradient
- `innerRadius: number` — The radius of the inner circle of the radial gradient
- `outerRadius: number` — The radius of the outer circle of the radial gradient
- `scale: number` — The scale of the radial gradient
- `rotation: number` — The rotation of the radial gradient
  **Methods:**
- `addColorStop(offset: number, color: ColorSource): this` — Adds a color stop to the gradient
- `destroy(): void` — Destroys the gradient, releasing resources. This will also destroy the internal texture.

```ts
// Create a vertical linear gradient from red to blue
const linearGradient = new FillGradient({
  type: 'linear',
  start: { x: 0, y: 0 }, // Start at top
  end: { x: 0, y: 1 }, // End at bottom
  colorStops: [
    { offset: 0, color: 'red' }, // Red at start
    { offset: 1, color: 'blue' } // Blue at end
  ],
  // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
  textureSpace: 'local'
});

// Create a radial gradient from yellow center to green edge
const radialGradient = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'yellow' }, // Center color
    { offset: 1, color: 'green' } // Edge color
  ],
  // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
  textureSpace: 'local'
});

// Create a rainbow linear gradient in global coordinates
const globalGradient = new FillGradient({
  type: 'linear',
  start: { x: 0, y: 0 },
  end: { x: 100, y: 0 },
  colorStops: [
    { offset: 0, color: 0xff0000 }, // Red
    { offset: 0.33, color: 0x00ff00 }, // Green
    { offset: 0.66, color: 0x0000ff }, // Blue
    { offset: 1, color: 0xff00ff } // Purple
  ],
  textureSpace: 'global' // Use world coordinates
});

// Create an offset radial gradient
const offsetRadial = new FillGradient({
  type: 'radial',
  center: { x: 0.3, y: 0.3 },
  innerRadius: 0.1,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'white' },
    { offset: 1, color: 'black' }
  ],
  // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
  textureSpace: 'local'
});
```

Internally this creates a texture of the gradient then applies a
transform to it to give it the correct size and angle.

This means that it's important to destroy a gradient when it is no longer needed
to avoid memory leaks.

If you want to animate a gradient then it's best to modify and update an existing one
rather than creating a whole new one each time. That or use a custom shader.
