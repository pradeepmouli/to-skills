# Classes

## accessibility

### `AccessibilitySystem`

The Accessibility system provides screen reader and keyboard navigation support for PixiJS content.
It creates an accessible DOM layer over the canvas that can be controlled programmatically or through user interaction.

By default, the system activates when users press the tab key. This behavior can be customized through options:

```js
const app = new Application({
  accessibilityOptions: {
    // Enable immediately instead of waiting for tab
    enabledByDefault: true,
    // Disable tab key activation
    activateOnTab: false,
    // Show/hide accessibility divs
    debug: false,
    // Prevent accessibility from being deactivated when mouse moves
    deactivateOnMouseMove: false
  }
});
```

The system can also be controlled programmatically by accessing the `renderer.accessibility` property:

```js
app.renderer.accessibility.setAccessibilityEnabled(true);
```

To make individual containers accessible:

```js
container.accessible = true;
```

There are several properties that can be set on a Container to control its accessibility which can
be found here: AccessibleOptions.
_implements `System<AccessibilitySystemOptions>`_

```ts
constructor(renderer: Renderer, _mobileInfo: isMobileResult): AccessibilitySystem
```

**Properties:**

- `extension: { type: readonly [WebGLSystem, WebGPUSystem]; name: "accessibility" }`
- `defaultOptions: AccessibilityOptions` — The default options used by the system.
  You can set these before initializing the Application to change the default behavior.
- `debug: boolean` — Whether accessibility divs are visible for debugging
  **Methods:**
- `init(options?: AccessibilitySystemOptions): void` — Runner init called, view is available at this point.
- `postrender(): void` — Updates the accessibility layer during rendering.
- Removes divs for containers no longer in the scene
- Updates the position and dimensions of the root div
- Updates positions of active accessibility divs
  Only fires while the accessibility system is active.
- `destroy(): void` — Destroys the accessibility system. Removes all elements and listeners.
  > [!IMPORTANT] This is typically called automatically when the Application is destroyed.
  > A typically user should not need to call this method directly.
- `setAccessibilityEnabled(enabled: boolean): void` — Enables or disables the accessibility system.
