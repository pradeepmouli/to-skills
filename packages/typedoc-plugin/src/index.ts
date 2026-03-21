/**
 * typedoc-plugin-to-skills — auto-discovered TypeDoc plugin alias.
 *
 * This is a thin re-export of @to-skills/typedoc so that TypeDoc
 * auto-discovers it when installed (TypeDoc looks for packages
 * named typedoc-plugin-*).
 *
 * Usage: just `pnpm add -D typedoc-plugin-to-skills` — no config needed.
 */
export { load } from "@to-skills/typedoc";
