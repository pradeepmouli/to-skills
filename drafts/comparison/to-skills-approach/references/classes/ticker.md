# Classes

## ticker

### `Ticker`

A Ticker class that runs an update loop that other objects listen to.
Used for managing animation frames and timing in a PixiJS application.

It provides a way to add listeners that will be called on each frame,
allowing for smooth animations and updates.

## Time Units

- `deltaTime`: Dimensionless scalar (typically ~1.0 at 60 FPS) for frame-independent animations
- `deltaMS`: Milliseconds elapsed (capped and speed-scaled) for time-based calculations
- `elapsedMS`: Raw milliseconds elapsed (uncapped, unscaled) for measurements
- `lastTime`: Timestamp in milliseconds since epoch (performance.now() format)

Animation frames are requested
only when necessary, e.g., when the ticker is started and the emitter has listeners.

```ts
constructor(): Ticker
```

**Properties:**

- `targetFPMS: number` — Target frame rate in frames per millisecond.
  Used for converting deltaTime to a scalar time delta.
- `autoStart: boolean` — Whether or not this ticker should invoke the method Ticker#start|start
  automatically when a listener is added.
- `deltaTime: number` — Scalar representing the delta time factor.
  This is a dimensionless value representing the fraction of a frame at the target framerate.
  At 60 FPS, this value is typically around 1.0.

This is NOT in milliseconds - it's a scalar multiplier for frame-independent animations.
For actual milliseconds, use Ticker#deltaMS.

- `deltaMS: number` — Scalar time elapsed in milliseconds from last frame to this frame.
  Provides precise timing for animations and updates.

This value is capped by setting Ticker#minFPS|minFPS
and is scaled with Ticker#speed|speed.

If the platform supports DOMHighResTimeStamp,
this value will have a precision of 1 µs.

Defaults to target frame time

> [!NOTE] The cap may be exceeded by scaling.

- `elapsedMS: number` — Time elapsed in milliseconds from the last frame to this frame.
  This value is not capped or scaled and provides raw timing information.

Unlike Ticker#deltaMS, this value is unmodified by speed scaling or FPS capping.

- `lastTime: number` — The last time update was invoked, in milliseconds since epoch.
  Similar to performance.now() timestamp format.

Used internally for calculating time deltas between frames.

- `speed: number` — Factor of current Ticker#deltaTime|deltaTime.
  Used to scale time for slow motion or fast-forward effects.
- `started: boolean` — Whether or not this ticker has been started.

`true` if Ticker#start|start has been called.
`false` if Ticker#stop|Stop has been called.

While `false`, this value may change to `true` in the
event of Ticker#autoStart|autoStart being `true`
and a listener is added.
**Methods:**

- `add<T>(fn: TickerCallback<T>, context?: T, priority: number): this` — Register a handler for tick events.
- `addOnce<T>(fn: TickerCallback<T>, context?: T, priority: number): this` — Add a handler for the tick event which is only executed once on the next frame.
- `remove<T>(fn: TickerCallback<T>, context?: T): this` — Removes any handlers matching the function and context parameters.
  If no handlers are left after removing, then it cancels the animation frame.
- `start(): void` — Starts the ticker. If the ticker has listeners a new animation frame is requested at this point.
- `stop(): void` — Stops the ticker. If the ticker has requested an animation frame it is canceled at this point.
- `destroy(): void` — Destroy the ticker and don't use after this. Calling this method removes all references to internal events.
- `update(currentTime: number): void` — Triggers an update.

An update entails setting the
current Ticker#elapsedMS|elapsedMS,
the current Ticker#deltaTime|deltaTime,
invoking all listeners with current deltaTime,
and then finally setting Ticker#lastTime|lastTime
with the value of currentTime that was provided.

This method will be called automatically by animation
frame callbacks if the ticker instance has been started
and listeners are added.

```ts
// Basic ticker usage with different time units
const ticker = new Ticker();
ticker.add((ticker) => {
  // Frame-independent animation using dimensionless deltaTime
  sprite.rotation += 0.1 * ticker.deltaTime;

  // Time-based animation using deltaMS (milliseconds)
  sprite.x += (100 / 1000) * ticker.deltaMS; // 100 pixels per second
});
ticker.start();

// Control update priority
ticker.add(
  (ticker) => {
    // High priority updates run first
    physics.update(ticker.deltaTime);
  },
  undefined,
  UPDATE_PRIORITY.HIGH
);

// One-time updates
ticker.addOnce(() => {
  console.log('Runs on next frame only');
});
```
