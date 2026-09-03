# Base UI over Radix for headless primitives

We need unstyled, accessible primitives (dialog, select, popover, field) so we
don't rebuild focus management, portals and ARIA wiring ourselves. We chose
**Base UI** (`@base-ui/react`), not Radix.

## Considered Options

An earlier draft of the build plan chose Radix, on the stated grounds that Base
UI "is still `1.0.0-rc.0`, last published 2025-12-04, never hit stable 1.0."

**That conclusion was drawn from a deprecated package.** Base UI was renamed:
`@base-ui-components/react` is abandoned and frozen at `1.0.0-rc.0`, which is
what a naive npm search still surfaces. The live package `@base-ui/react`
shipped stable `1.0.0` on 2025-12-11 and has released a minor roughly monthly
since — `1.7.0` on 2026-08-04. Radix, meanwhile, sits at `1.1.23` (2026-07-24)
with ~348 open issues and a slower cadence.

This is recorded specifically so the next person to check npm does not repeat
the mistake and "correct" this decision back to Radix.

Verified on the npm registry, 2026-09-02:

- `date-fns` / `@date-fns/tz` appear as peer dependencies but are marked
  **optional** in `peerDependenciesMeta` — they only bind if the temporal
  components are used, so the library's dependency footprint stays small.
- `sideEffects: false` plus 83 subpath exports (`./button`, `./dialog`,
  `./field`, …) means unused primitives tree-shake out, so we don't lose the
  bundle-size property that Radix's per-component packages gave us.
- Runtime dependencies are five: `@babel/runtime`, `@base-ui/utils`,
  `@floating-ui/utils`, `@floating-ui/react-dom`, `use-sync-external-store`.

Base UI also ships `./field` and `./form`, which wire label, description and
error association together. Radix has no equivalent, so that a11y plumbing would
otherwise be hand-written per component.

## Consequences

- **`asChild` does not exist.** Base UI composes via a `render` prop, with
  `./use-render` and `./merge-props` as the underlying tools. Our public API
  mirrors `render` rather than reimplementing Radix's `asChild` name over it.
- **Web only, permanently.** `react-dom` is a hard peer dependency. This is
  compatible with our platform scope (responsive web), but it does foreclose
  React Native should that ever be revisited.
- Base UI is never re-exported from the public API — no Base UI type appears in
  our generated `.d.ts`. Swapping it out later stays contained to the internals
  of component wrappers.
