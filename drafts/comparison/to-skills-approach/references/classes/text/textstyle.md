# Classes

## text

### `TextStyle`

A TextStyle Object contains information to decorate Text objects.
An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
_extends `EventEmitter<{ update: TextDropShadow }>`_

```ts
constructor(style: Partial<TextStyleOptions>): TextStyle
```

**Properties:**

- `defaultDropShadow: TextDropShadow` — Default drop shadow settings used when enabling drop shadows on text.
  These values are used as the base configuration when drop shadows are enabled without specific settings.
- `defaultTextStyle: TextStyleOptions` — Default text style settings used when creating new text objects.
  These values serve as the base configuration and can be customized globally.
  **Methods:**
- `update(): void`
- `reset(): void` — Resets all properties to the default values
- `assign(values: Partial<TextStyleOptions>): this` — Assigns partial style options to this TextStyle instance.
  Uses public setters to ensure proper value transformation.
- `clone(): TextStyle` — Creates a new TextStyle object with the same values as this one.
- `destroy(options: TypeOrBool<TextureDestroyOptions>): void` — Destroys this text style.

```ts
// Create a basic text style
const style = new TextStyle({
  fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
  fontSize: 36,
  fill: 0xff1010,
  align: 'center'
});

// Create a rich text style with multiple features
const richStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 32,
  fill: 'white',
  stroke: {
    color: '#4a1850',
    width: 5
  },
  dropShadow: {
    color: '#000000',
    blur: 4,
    distance: 6,
    angle: Math.PI / 6
  },
  wordWrap: true,
  wordWrapWidth: 440,
  lineHeight: 40,
  align: 'center'
});

// Share style between multiple text objects
const text1 = new Text({
  text: 'Hello',
  style: richStyle
});

const text2 = new Text({
  text: 'World',
  style: richStyle
});

// Update style dynamically - affects all text objects
richStyle.fontSize = 48;
richStyle.fill = 0x00ff00;
```

Key Features:

- Shared styling between multiple text objects
- Rich text formatting options
- Gradient and pattern fills
- Drop shadows and strokes
- Word wrapping and alignment
- Dynamic updates
