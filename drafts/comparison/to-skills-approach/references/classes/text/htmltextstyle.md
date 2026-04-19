# Classes

## text

### `HTMLTextStyle`

A TextStyle object rendered by the HTMLTextSystem.
_extends `TextStyle`_

```ts
constructor(options: HTMLTextStyleOptions): HTMLTextStyle
```

**Properties:**

- `defaultDropShadow: TextDropShadow` — Default drop shadow settings used when enabling drop shadows on text.
  These values are used as the base configuration when drop shadows are enabled without specific settings.
- `defaultTextStyle: TextStyleOptions` — Default text style settings used when creating new text objects.
  These values serve as the base configuration and can be customized globally.
- `_tagStyles: Record<string, HTMLTextStyleOptions>` — Custom styles to apply to specific HTML tags.
  Allows for consistent styling of custom elements without CSS overrides.
  **Methods:**
- `update(): void` — Updates the text style and triggers a refresh of the CSS style cache.
  This method is called automatically when style properties are changed.
- `clone(): HTMLTextStyle` — Creates a new HTMLTextStyle object with the same values as this one.
  This creates a deep copy of all style properties, including dropShadow and tag styles.
- `addOverride(value: string[]): void` — Add a style override, this can be any CSS property
  it will override any built-in style. This is the
  property and the value as a string (e.g., `color: red`).
  This will override any other internal style.
- `removeOverride(value: string[]): void` — Remove any overrides that match the value.
- `reset(): void` — Resets all properties to the default values
- `assign(values: Partial<TextStyleOptions>): this` — Assigns partial style options to this TextStyle instance.
  Uses public setters to ensure proper value transformation.
- `destroy(options: TypeOrBool<TextureDestroyOptions>): void` — Destroys this text style.
