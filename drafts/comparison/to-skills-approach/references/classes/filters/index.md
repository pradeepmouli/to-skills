# filters

| Class                       | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [ColorBlend](colorblend.md) | The final color has the hue and saturation of the top color, while using the luminosity of the bottom color. |

The effect preserves gray levels and can be used to colorize the foreground.

Available as `container.blendMode = 'color'` after importing `pixi.js/advanced-blend-modes`. |
| [ColorBurnBlend](colorburnblend.md) | The final color is the result of inverting the bottom color, dividing the value by the top color,
and inverting that value. A white foreground leads to no change.
A foreground with the inverse color of the backdrop leads to a black final image.
This blend mode is similar to multiply, but the foreground need only be as dark as the inverse
of the backdrop to make the final image black.

Available as `container.blendMode = 'color-burn'` after importing `pixi.js/advanced-blend-modes`. |
| [ColorDodgeBlend](colordodgeblend.md) | The final color is the result of dividing the bottom color by the inverse of the top color.
A black foreground leads to no change.
A foreground with the inverse color of the backdrop leads to a fully lit color.
This blend mode is similar to screen, but the foreground need only be as light as the inverse of the backdrop to create a fully lit color.

Available as `container.blendMode = 'color-dodge'` after importing `pixi.js/advanced-blend-modes`. |
| [DarkenBlend](darkenblend.md) | The final color is composed of the darkest values of each color channel.

Available as `container.blendMode = 'darken'` after importing `pixi.js/advanced-blend-modes`. |
| [DifferenceBlend](differenceblend.md) | The final color is the result of subtracting the darker of the two colors from the lighter one.
black layer has no effect, while a white layer inverts the other layer's color.

Available as `container.blendMode = 'difference'` after importing `pixi.js/advanced-blend-modes`. |
| [DivideBlend](divideblend.md) | The Divide blend mode divides the RGB channel values of the bottom layer by those of the top layer.
The darker the top layer, the brighter the bottom layer will appear.
Blending any color with black yields white, and blending with white has no effect

Available as `container.blendMode = 'divide'` after importing `pixi.js/advanced-blend-modes`. |
| [ExclusionBlend](exclusionblend.md) | The final color is similar to difference, but with less contrast.
As with difference, a black layer has no effect, while a white layer inverts the other layer's color.

Available as `container.blendMode = 'exclusion'` after importing `pixi.js/advanced-blend-modes`. |
| [HardLightBlend](hardlightblend.md) | The final color is the result of multiply if the top color is darker, or screen if the top color is lighter.
This blend mode is equivalent to overlay but with the layers swapped.
The effect is similar to shining a harsh spotlight on the backdrop.

Available as `container.blendMode = 'hard-light'` after importing `pixi.js/advanced-blend-modes`. |
| [HardMixBlend](hardmixblend.md) | Hard defines each of the color channel values of the blend color to the RGB values of the base color.
If the sum of a channel is 255, it receives a value of 255; if less than 255, a value of 0.

Available as `container.blendMode = 'hard-mix'` after importing `pixi.js/advanced-blend-modes`. |
| [LightenBlend](lightenblend.md) | The final color is composed of the lightest values of each color channel.

Available as `container.blendMode = 'lighten'` after importing `pixi.js/advanced-blend-modes`. |
| [LinearBurnBlend](linearburnblend.md) | Looks at the color information in each channel and darkens the base color to
reflect the blend color by increasing the contrast between the two.

Available as `container.blendMode = 'linear-burn'` after importing `pixi.js/advanced-blend-modes`. |
| [LinearDodgeBlend](lineardodgeblend.md) | Looks at the color information in each channel and brightens the base color to reflect the blend color by decreasing contrast between the two.

Available as `container.blendMode = 'linear-dodge'` after importing `pixi.js/advanced-blend-modes`. |
| [LinearLightBlend](linearlightblend.md) | Increase or decrease brightness by burning or dodging color values, based on the blend color

Available as `container.blendMode = 'linear-light'` after importing `pixi.js/advanced-blend-modes`. |
| [LuminosityBlend](luminosityblend.md) | The final color has the luminosity of the top color, while using the hue and saturation of the bottom color.
This blend mode is equivalent to color, but with the layers swapped.

Available as `container.blendMode = 'luminosity'` after importing `pixi.js/advanced-blend-modes`. |
| [NegationBlend](negationblend.md) | Implements the Negation blend mode which creates an inverted effect based on the brightness values.

Available as `container.blendMode = 'negation'` after importing `pixi.js/advanced-blend-modes`. |
| [OverlayBlend](overlayblend.md) | The final color is the result of multiply if the bottom color is darker, or screen if the bottom color is lighter.
This blend mode is equivalent to hard-light but with the layers swapped.

Available as `container.blendMode = 'overlay'` after importing `pixi.js/advanced-blend-modes`. |
| [PinLightBlend](pinlightblend.md) | Replaces colors based on the blend color.

Available as `container.blendMode = 'pin-light'` after importing `pixi.js/advanced-blend-modes`. |
| [SaturationBlend](saturationblend.md) | The final color has the saturation of the top color, while using the hue and luminosity of the bottom color.
A pure gray backdrop, having no saturation, will have no effect.

Available as `container.blendMode = 'saturation'` after importing `pixi.js/advanced-blend-modes`. |
| [SoftLightBlend](softlightblend.md) | The final color is similar to hard-light, but softer. This blend mode behaves similar to hard-light.
The effect is similar to shining a diffused spotlight on the backdrop.

Available as `container.blendMode = 'soft-light'` after importing `pixi.js/advanced-blend-modes`. |
| [SubtractBlend](subtractblend.md) | Subtracts the blend from the base color using each color channel

Available as `container.blendMode = 'subtract'` after importing `pixi.js/advanced-blend-modes`. |
| [VividLightBlend](vividlightblend.md) | Darkens values darker than 50% gray and lightens those brighter than 50% gray, creating a dramatic effect.
It's essentially an extreme version of the Overlay mode, with a significant impact on midtones

Available as `container.blendMode = 'vivid-light'` after importing `pixi.js/advanced-blend-modes`. |
| [AlphaFilter](alphafilter.md) | Simplest filter - applies alpha.

Use this instead of Container's alpha property to avoid visual layering of individual elements.
AlphaFilter applies alpha evenly across the entire display object and any opaque elements it contains.
If elements are not opaque, they will blend with each other anyway.

Very handy if you want to use common features of all filters:

1. Assign a blendMode to this filter, blend all elements inside display object with background.

2. To use clipping in display coordinates, assign a filterArea to the same container that has this filter. |
   | [BlurFilter](blurfilter.md) | The BlurFilter applies a Gaussian blur to an object.
   The strength of the blur can be set for the x-axis and y-axis separately. |
   | [BlurFilterPass](blurfilterpass.md) | The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object. |
   | [ColorMatrixFilter](colormatrixfilter.md) | The ColorMatrixFilter class lets you apply color transformations to display objects using a 5x4 matrix.
   The matrix transforms the RGBA color and alpha values of every pixel to produce a new set of values.

The class provides convenient methods for common color adjustments like brightness, contrast, saturation,
and various photo filter effects. |
| [DisplacementFilter](displacementfilter.md) | A filter that applies a displacement map effect using a sprite's texture.

The DisplacementFilter uses another texture (from a sprite) as a displacement map,
where the red and green channels of each pixel in the map determine how the corresponding
pixel in the filtered object should be offset:

- Red channel controls horizontal displacement
- Green channel controls vertical displacement

Common use cases:

- Creating ripple or wave effects
- Distorting images dynamically
- Implementing heat haze effects
- Creating transition effects |
  | [NoiseFilter](noisefilter.md) | A filter that adds configurable random noise to rendered content.

This filter generates pixel noise based on a noise intensity value and an optional seed.
It can be used to create various effects like film grain, static, or texture variation.

Based on: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js |
| [Filter](filter.md) | The Filter class is the base for all filter effects used in Pixi.js
As it extends a shader, it requires that a glProgram is parsed in to work with WebGL and a gpuProgram for WebGPU.
If you don't proved one, then the filter is skipped and just rendered as if it wasn't there for that renderer.

A filter can be applied to anything that extends Container in Pixi.js which also includes Sprites, Graphics etc.

Its worth noting Performance-wise filters can be pretty expensive if used too much in a single scene.
The following happens under the hood when a filter is applied:

.1. Break the current batch
<br>
.2. The target is measured using getGlobalBounds
(recursively go through all children and figure out how big the object is)
<br>
.3. Get the closest Po2 Textures from the texture pool
<br>
.4. Render the target to that texture
<br>
.5. Render that texture back to the main frame buffer as a quad using the filters program.
<br>
<br>
Some filters (such as blur) require multiple passes too which can result in an even bigger performance hit. So be careful!
Its not generally the complexity of the shader that is the bottle neck,
but all the framebuffer / shader switching that has to take place.
One filter applied to a container with many objects is MUCH faster than many filter applied to many objects. |
