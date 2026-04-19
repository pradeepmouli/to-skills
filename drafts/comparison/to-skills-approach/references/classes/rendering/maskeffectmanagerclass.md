# Classes

## rendering

### `MaskEffectManagerClass`

A class that manages the conversion of masks to mask effects.

```ts
constructor(): MaskEffectManagerClass
```

**Properties:**

- `_effectClasses: EffectConstructor[]`
  **Methods:**
- `init(): void`
- `add(test: MaskConversionTest): void`
- `getMaskEffect(item: any): MaskEffect`
- `returnMaskEffect(effect: Effect & PoolItem): void`
