# Classes

## text

### `CanvasTextMetrics`

The TextMetrics object represents the measurement of a block of text with a specified style.

```ts
constructor(text: string, style: TextStyle, width: number, height: number, lines: string[], lineWidths: number[], lineHeight: number, maxLineWidth: number, fontProperties: FontMetrics, taggedData?: { runsByLine?: TextStyleRun[][]; lineAscents?: number[]; lineDescents?: number[]; lineHeights?: number[]; hasDropShadow?: boolean }): CanvasTextMetrics
```

**Properties:**

- `METRICS_STRING: string` — String used for calculate font metrics.
  These characters are all tall to help calculate the height required for text.
- `BASELINE_SYMBOL: string` — Baseline symbol for calculate font metrics.
- `BASELINE_MULTIPLIER: number` — Baseline multiplier for calculate font metrics.
- `HEIGHT_MULTIPLIER: number` — Height multiplier for setting height of canvas to calculate font metrics.
- `graphemeSegmenter: (s: string) => string[]` — A Unicode "character", or "grapheme cluster", can be composed of multiple Unicode code points,
  such as letters with diacritical marks (e.g. `'\u0065\u0301'`, letter e with acute)
  or emojis with modifiers (e.g. `'\uD83E\uDDD1\u200D\uD83D\uDCBB'`, technologist).
  The new `Intl.Segmenter` API in ES2022 can split the string into grapheme clusters correctly. If it is not available,
  PixiJS will fallback to use the iterator of String, which can only spilt the string into code points.
  If you want to get full functionality in environments that don't support `Intl.Segmenter` (such as Firefox),
  you can use other libraries such as [grapheme-splitter]https://www.npmjs.com/package/grapheme-splitter
  or [graphemer]https://www.npmjs.com/package/graphemer to create a polyfill. Since these libraries can be
  relatively large in size to handle various Unicode grapheme clusters properly, PixiJS won't use them directly.
- `_experimentalLetterSpacingSupported: boolean` (optional)
- `experimentalLetterSpacing: boolean` — New rendering behavior for letter-spacing which uses Chrome's new native API. This will
  lead to more accurate letter-spacing results because it does not try to manually draw
  each character. However, this Chrome API is experimental and may not serve all cases yet.
- `text: string` — The text that was measured.
- `style: TextStyle` — The style that was measured.
- `width: number` — The measured width of the text.
- `height: number` — The measured height of the text.
- `lines: string[]` — An array of lines of the text broken by new lines and wrapping is specified in style.
- `lineWidths: number[]` — An array of the line widths for each line matched to `lines`.
- `lineHeight: number` — The measured line height for this style.
- `maxLineWidth: number` — The maximum line width for all measured lines.
- `fontProperties: FontMetrics` — The font properties object from TextMetrics.measureFont.
  **Methods:**
- `measureText(text: string, style: TextStyle, canvas: ICanvas, wordWrap: boolean): CanvasTextMetrics` — Measures the supplied string of text and returns a Rectangle.
- `isBreakingSpace(char: string, _nextChar?: string): boolean` — Determines if char is a breaking whitespace.

It allows one to determine whether char should be a breaking whitespace
For example certain characters in CJK langs or numbers.
It must return a boolean.

- `canBreakWords(_token: string, breakWords: boolean): boolean` — Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.

It allows one to customise which words should break
Examples are if the token is CJK or numbers.
It must return a boolean.

- `canBreakChars(_char: string, _nextChar: string, _token: string, _index: number, _breakWords: boolean): boolean` — Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.

It allows one to determine whether a pair of characters
should be broken by newlines
For example certain characters in CJK langs or numbers.
It must return a boolean.

- `wordWrapSplit(token: string): string[]` — Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.

It is called when a token (usually a word) has to be split into separate pieces
in order to determine the point to break a word.
It must return an array of characters.

- `measureFont(font: string): FontMetrics` — Calculates the ascent, descent and fontSize of a given font-style
- `clearMetrics(font?: string): void` — Clear font metrics in metrics cache.

```ts
import { CanvasTextMetrics, TextStyle } from 'pixi.js';

const style = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 24,
  fill: 0xff1010,
  align: 'center'
});
const textMetrics = CanvasTextMetrics.measureText('Your text', style);
```
