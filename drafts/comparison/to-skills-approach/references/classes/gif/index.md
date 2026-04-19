# gif

| Class                     | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| [GifSource](gifsource.md) | Resource provided to GifSprite instances. This is very similar to using a shared |

Texture between Sprites. This source contains all the frames and animation needed
to support playback. |
| [GifSprite](gifsprite.md) | Runtime object for playing animated GIFs with advanced playback control.

Features:

- Play, pause, and seek controls
- Adjustable animation speed
- Loop control
- Frame change callbacks
- Auto-updating via shared ticker

This class extends Sprite and provides similar functionality to AnimatedSprite,
but specifically optimized for GIF playback. |
