# text

| Class                                                                           | Description                                                             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [AbstractBitmapFont](abstractbitmapfont.md)                                     | An abstract representation of a bitmap font.                            |
| [BitmapFont](bitmapfont.md)                                                     | A BitmapFont object represents a particular font face, size, and style. |
| This class handles both pre-loaded bitmap fonts and dynamically generated ones. |
| [BitmapText](bitmaptext.md)                                                     | A BitmapText object creates text using pre-rendered bitmap fonts.       |

It supports both loaded bitmap fonts (XML/FNT) and dynamically generated ones.

To split a line you can use '\n' in your text string, or use the `wordWrap` and
`wordWrapWidth` style properties.

Key Features:

- High-performance text rendering using pre-generated textures
- Support for both pre-loaded and dynamic bitmap fonts
- Compatible with MSDF/SDF fonts for crisp scaling
- Automatic font reuse and optimization

Performance Benefits:

- Faster rendering compared to Canvas/HTML text
- Lower memory usage for repeated characters
- More efficient text changes
- Better batching capabilities

Limitations:

- Full character set support is impractical due to the number of chars (mainly affects CJK languages)
- Initial font generation/loading overhead
- Less flexible styling compared to Canvas/HTML text |
  | [HTMLText](htmltext.md) | A HTMLText object creates text using HTML/CSS rendering with SVG foreignObject.
  This allows for rich text formatting using standard HTML tags and CSS styling.

Key features:

- HTML tag support (&lt;strong&gt;, &lt;em&gt;, etc.)
- CSS styling and custom style overrides
- Emoji and special character support
- Line breaking and word wrapping
- SVG-based rendering |
  | [HTMLTextStyle](htmltextstyle.md) | A TextStyle object rendered by the HTMLTextSystem. |
  | [AbstractSplitText](abstractsplittext.md) | A container that splits text into individually manipulatable segments (lines, words, and characters)
  for advanced text effects and animations. |
  | [SplitBitmapText](splitbitmaptext.md) | A container that splits text into individually manipulatable segments (lines, words, and characters)
  for advanced text effects and animations.
  Converts each segment into a separate BitmapText object. |
  | [SplitText](splittext.md) | A container that splits text into individually manipulatable segments (lines, words, and characters)
  for advanced text effects and animations.
  Converts each segment into a separate Text object. |
  | [AbstractText](abstracttext.md) | An abstract Text class, used by all text type in Pixi. This includes Canvas, HTML, and Bitmap Text. |
  | [CanvasTextMetrics](canvastextmetrics.md) | The TextMetrics object represents the measurement of a block of text with a specified style. |
  | [Text](text.md) | A powerful text rendering class that creates one or multiple lines of text using the Canvas API.
  Provides rich text styling capabilities with runtime modifications.

Key features:

- Dynamic text content and styling
- Multi-line text support
- Word wrapping
- Custom texture styling
- High-quality text rendering |
  | [TextStyle](textstyle.md) | A TextStyle Object contains information to decorate Text objects.
  An instance can be shared between multiple Text objects; then changing the style will update all text objects using it. |
