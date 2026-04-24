/**
 * Adapter package version — embedded into the `AdapterFingerprint`.
 *
 * @remarks
 * Kept in a separate module so `render.ts` doesn't need to import the
 * default export of `index.ts` (which would create a small circular import).
 * Bump this string whenever the adapter's output shape changes.
 */
export const PACKAGE_VERSION = '0.1.0';
