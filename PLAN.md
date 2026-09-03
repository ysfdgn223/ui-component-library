# UI Component Library — Build Plan

> Supersedes the first draft. See [CONTEXT.md](./CONTEXT.md) for the glossary and
> [docs/adr/0001-base-ui-over-radix.md](./docs/adr/0001-base-ui-over-radix.md) for the
> primitives decision. Facts verified against the npm registry on 2026-09-02.

## Context

Greenfield repo, no commits. A React component library for **responsive web only**,
published to npm eventually, consumed first by a separate inventory-dashboard app.

Criteria:

1. Easy to build
2. Not deeply dependent on other libraries
3. Easy to change styles
4. Doesn't rebuild the basics (a11y, focus, portals) from scratch
5. Supports multiple themes — distinct visual personalities
6. React

**Platform scope is web.** Phones and tablets are served by responsive CSS in a browser,
not by native code. React Native is explicitly out: it has no CSS custom properties (the
proposal has sat open and unassigned since 2023), no cascade, and no accessible overlay
primitives worth using. Every mechanism below assumes the DOM.

**The central design bet:** every visual decision in a component is expressed as a CSS
custom property. A theme is then just a block of CSS that redefines those properties —
adding one costs ~40 lines and touches zero component files.

**Decisions:** npm package + prebuilt CSS · CSS Modules + custom properties · Base UI
primitives · global app-wide theme switch · ESM-only · MIT · `@ysfdgn223/ui`.

---

## Architecture

### The theme system needs no JavaScript

Themes are set as data attributes on a root element; CSS custom properties cascade to
every descendant. Components are therefore completely **theme-unaware** — no context, no
props, no re-renders, RSC-safe.

```
<UIProvider theme="glass" colorScheme="dark">
  →  <div data-ui-theme="glass" data-ui-color-scheme="dark">
```

`UIProvider` is a plain `<div>` with two data attributes. No React context in v1.

Attributes are `ui`-prefixed to match the token namespace. Plenty of apps already write
an unprefixed `data-theme="dark"` on `<html>`; prefixing removes any chance of colliding
with a consumer's own dark-mode toggle.

### Two axes, kept independent

`theme` (visual personality: shape, material, weight, type, motion) and `colorScheme`
(light / dark) are **orthogonal**. Any theme must work under either color scheme. Where a
theme must alter color, it redefines the palette layer rather than hardcoding per-scheme
values.

### Three-layer tokens

```
Layer 1  primitive    --ui-blue-500, --ui-space-2, --ui-font-stack-system
Layer 2  semantic     --ui-color-accent, --ui-surface-raised, --ui-radius-control, …
Layer 3  component    --ui-button-padding-x   (only when a component needs its own knob)
```

**Components reference Layer 2 (and 3) only — never Layer 1, never a raw value.** This is
the one rule that makes or breaks the design. Enforced by
`stylelint-declaration-strict-value` on `color`, `background-color`, `border-radius`,
`box-shadow`, `border-width`, `font-family` and `backdrop-filter`, requiring `var()`.

Starting Layer 2 vocabulary:

| Group | Tokens |
|---|---|
| Color | `--ui-color-accent` `--ui-color-fg` `--ui-color-fg-muted` `--ui-color-bg` `--ui-color-border` `--ui-color-danger` `--ui-color-success` `--ui-color-warning` |
| Surface | `--ui-surface-base` `--ui-surface-raised` `--ui-surface-overlay` |
| Material | `--ui-surface-blur` `--ui-surface-tint` `--ui-surface-highlight` `--ui-surface-scrim-opacity` |
| Shape | `--ui-radius-control` `--ui-radius-surface` `--ui-border-width` |
| Elevation | `--ui-shadow-raised` `--ui-shadow-overlay` |
| Type | `--ui-font-sans` `--ui-font-mono` `--ui-text-sm/base/lg` `--ui-weight-normal/medium/semibold` |
| Space | `--ui-space-1` … `--ui-space-8` |
| Motion | `--ui-transition` |
| Icon | `--ui-icon-size` |

### Insulation rule

Base UI is an implementation detail. Every Base UI import lives inside a component file;
no Base UI type is re-exported from `src/index.ts`, and public props are declared in our
own interfaces. Verified in CI: no `@base-ui` string in the generated `.d.ts`.

---

## The glass theme

Theme #1 is **Liquid Glass** — translucency, blur, specular edge highlights, content
showing through chrome.

### Fonts

The system stack, shipped as `--ui-font-sans`:
`-apple-system, BlinkMacSystemFont, "Segoe UI", …`

SF Pro is Apple-licensed and cannot be bundled in an npm package or served as a webfont.
The system stack gets genuine SF on Apple hardware for free and falls back elsewhere; a
consumer who wants consistency across platforms overrides one token to point at Inter.

### Degradation is a token swap, not a patch

Translucent surfaces sit over unpredictable content, so text contrast cannot be
guaranteed by construction. Three fallbacks, all implemented by **redefining tokens
rather than adding component rules**:

```css
@supports not (backdrop-filter: blur(1px))    { /* --ui-surface-blur: none; scrim → 1 */ }
@media (prefers-reduced-transparency: reduce) { /* scrim → 1 */ }
@media (prefers-reduced-motion: reduce)       { /* --ui-transition: none */ }
```

`--ui-surface-scrim-opacity` is the single knob controlling how opaque a glass surface
is. The degraded state is therefore visible in the playground, not discovered in the
wild.

**Dense data under glass is the known weak point** and is accepted rather than designed
around — there is no separate opaque surface token. `Table` simply defaults to a high
scrim opacity. Tuning that value is the mitigation.

### Motion

v0.1 ships transitions only, via `--ui-transition`. Signature liquid motion (springy
overlays, morphing surfaces) is deferred — the material has to read correctly standing
still first. `prefers-reduced-motion` zeroes the token.

### The flat canary

`styles/themes/flat.css` is written as ~30 lines of token overrides and **never
rendered** — not in the playground, not exported. It exists so that the moment a
component reaches for a glass-only concept, filling in the flat file becomes visibly
impossible.

`--ui-surface-blur`, `--ui-surface-tint` and `--ui-surface-highlight` are the tokens most
at risk of over-fitting. Flat sets them to `none` / `transparent` / `none`. If a
component breaks when it cannot blur, the vocabulary is wrong.

---

## Repo layout

Single package, no monorepo. The dashboard lives in its own repository.

```
src/
  styles/
    reset.css              minimal, scoped to the provider
    tokens.css             Layer 1 + Layer 2 defaults
    schemes/light.css dark.css
    themes/glass.css       the only shipped theme
    themes/flat.css        spec-only canary, never rendered
    index.css              imports all of the above
  lib/
    cn.ts                  clsx wrapper
    UIProvider.tsx
  components/
    Button/  Card/  Dialog/  Field/  Input/  Table/
      X.tsx  X.module.css  X.test.tsx  index.ts
  index.ts
playground/                Vite app — specimens + one page, both color schemes
  specimens/Button.tsx …
```

---

## Components — v0.1

Five, deliberately. If the token vocabulary is wrong, you find out after five components
instead of thirty.

| Component | Base UI | What it proves |
|---|---|---|
| `Button` | `./use-render` | interactive states, `render` composition |
| `Input` + `Field` | `./field`, `./input` | label / description / error wiring, focus ring, invalid |
| `Card` | — | surface, elevation, glass material |
| `Dialog` | `./dialog` | portal, overlay, focus trap, `data-*` state animation in pure CSS |
| `Table` | **none** | dense data legibility under glass — the hard case |

`Table` is **presentational only**: a semantic `<table>` split into
`Table.Root / Header / Row / Cell`, styled, zero behaviour. No sorting, selection,
pagination, resizing or virtualization. Those are state management, not styling — the
dashboard wires TanStack Table (headless, unstyled) to these parts if it needs them, and
that dependency stays in the app.

`Table` is also the one component with no Base UI primitive behind it, so its ARIA is
hand-written. That is affordable at presentational scope and gets expensive immediately
beyond it.

Everything else gets built **the day the dashboard actually needs it**. That list is the
Phase 2 backlog, in priority order, derived from real use rather than a roadmap.

### Conventions

- Root element takes `className` (merged via `cn`) and spreads `...rest`
- `forwardRef` to the root on every component
- Composition via a **`render` prop**, mirroring Base UI. `asChild` does not exist here;
  reimplementing that name over `use-render` would be a shim that lies about what is
  underneath
- Variants as discrete props (`variant`, `size`, `tone`) mapped to CSS Module classes via
  a plain lookup object — no CVA dependency
- Style states via attribute selectors: `[data-open]`, `[data-disabled]`
- Every component exports its props interface
- `"use client"` at the top of every component module

### No icons

The library ships none. Icon slots accept `ReactNode`, styled with `currentColor` and
`--ui-icon-size`. An icon set is the heaviest dependency a component library can acquire
and the one consumers most reliably already have and disagree about.

### Palette

A complete default palette ships — accent, greys, semantic states — so `npm i` plus one
CSS import renders something deliberate with zero configuration. Overriding is one token.

---

## Build & packaging

- **Vite library mode** + `@vitejs/plugin-react` + `vite-plugin-dts`.
  Vite is at **8.2.2**; confirm plugin compatibility at scaffold time rather than
  trusting pinned versions from the earlier draft
- **ESM-only**, `"type": "module"`. This excludes a thin slice of consumers (Jest without
  ESM config, webpack 4). Adding a CJS build later is *additive* — a new exports entry,
  not a breaking change — so it forecloses nothing. Dual builds also carry the
  dual-package hazard, worth avoiding until someone complains
- `react` / `react-dom` as **peerDependencies**
- `"sideEffects": ["*.css"]`
- Rollup `output.preserveModules: true` — one file per component in `dist/`, which makes
  tree-shaking trivially correct and makes `"use client"` revertible per component
- **`vite-plugin-lib-inject-css`** — injects each component's CSS import into its own JS
  chunk, so component CSS tree-shakes alongside the JS
- **`"use client"` via Rollup's `output.banner` as a function.** Rollup strips
  module-level directives by default. `rollup-plugin-preserve-directives` exists but is
  `0.4.0` from 2024-02-02 — two and a half years stale, not worth the dependency.
  `banner` receives each chunk, so a few lines of config prepends the directive per
  component chunk with zero deps

Runtime deps: `clsx` + `@base-ui/react`. Base UI's own footprint is five packages, and
its `date-fns` peers are marked optional so they never bind.

### What a consumer imports

```js
import { Button } from "@ysfdgn223/ui";
import "@ysfdgn223/ui/styles.css";   // tokens + theme + reset — global, small, required
```

Exports map: `.` → components, `./styles.css` → the global sheet.

**Two accepted tradeoffs:**

- *CSS order becomes import-order dependent.* Low risk because components never override
  each other — all styling flows through tokens, so there is no cascade to fight. If that
  stops being true, revisit.
- *The consumer's bundler must handle CSS imports from `node_modules`.* Vite, Next.js and
  webpack + css-loader all do. A bundler capability, not a library dependency, so
  criterion #2 holds.

### Versioning

Start at `0.x`. That, not privacy, is what signals the API is still moving. Publishing is
deferred but nothing here blocks it: the scope `@ysfdgn223` is verified available, MIT is
in place from the first commit (no license means nobody may legally use it, including a
future collaborator), and renaming before there are users is free.

---

## The dashboard — first consumer

A **separate repository**: an inventory-management dashboard. Not a demo — something
worth existing, so the API feedback is real.

It has no insider access to `src/`, which is the point. It consumes the built package the
way a stranger would.

- **Inner loop:** `npm link` — instant iteration
- **Milestone gate:** `npm pack`, then install the tarball. This catches what `link`
  hides: a file missing from `files`, a broken `exports` subpath, a `.d.ts` that does not
  resolve, a CSS import that is not exported. The classic first-publish failures

The dashboard picks its own icon set, independently — a small extra check that the
library is not secretly coupled to one.

---

## Dev surface

**Specimens plus a single playground page. Storybook deferred.**

Each component gets a `specimens/X.tsx` exporting a representative render of its notable
states (sizes, variants, disabled, invalid). One page renders every specimen under both
color schemes side by side.

With a single theme there is no matrix — the earlier draft's `MatrixView` and
`GalleryView` collapse into the same page, and building both would be ceremony. The
structure returns for free when theme #2 arrives, since it is a nested loop over data
attributes with no re-mounting or provider juggling.

Specimens are the shared unit: the playground page and the Playwright snapshots consume
the same ones, so they cannot disagree. A specimen maps roughly 1:1 onto a Storybook
story, so this work is ported, not thrown away.

The dashboard does **not** replace the playground: it shows components in one arrangement
you chose, which is exactly the blind spot a specimen page covers.

---

## Testing

**Two seams. No jsdom.**

### Seam 1 — the specimen page, in a real browser, via Playwright

Specimens are already the shared unit, which makes the specimen page the highest seam
inside the library. Everything the library promises is observable there.

- **Behavioural** — focus trap, open and close, field association, keyboard nav
- **Computed style** — `getComputedStyle` reads token values, proving the cascade and the
  degradation paths actually resolve
- **Accessibility** — `@axe-core/playwright`, one pass per specimen
- **Screenshot baselines** — deferred to the end of Phase 1

The Phase 1 deferral applies to **screenshots only**. Behavioural and computed-style
assertions are immune to token churn — retuning a colour doesn't break "focus is
trapped" — so those run from day one. Only baseline images wait for `tokens.css` to
settle, because during churn every intended change fails a snapshot and reflexive
`--update-snapshots` makes the suite meaningless.

**Vitest, Testing Library and jsdom are deliberately not used.** Three reasons:

1. jsdom does not compute styles from stylesheets. The library's entire thesis is CSS
   custom properties cascading from a data attribute; jsdom can verify none of it.
2. jsdom has no real focus model or tab order. A focus-trap test there asserts that Base
   UI's code ran, not that focus is trapped — theatre on the component where it matters
   most.
3. axe in jsdom cannot check colour contrast; it needs computed styles. Contrast under
   glass is the #1 named risk, so this is the difference between covering it and not.

Nothing else warrants a unit seam — `cn.ts` is a clsx wrapper and the variant maps are
lookup objects.

#### Emulating the degraded states

Playwright's `emulateMedia` supports `colorScheme`, `reducedMotion`, `forcedColors` and
`contrast` — but **not `prefers-reduced-transparency`**. That path is driven through a
CDP session instead (`Emulation.setEmulatedMedia` accepts arbitrary `{name, value}`
features); confirm with a short spike before relying on it.

The `@supports not (backdrop-filter: blur(1px))` path is **not automated**. It is
genuinely unreachable in a browser that supports the feature, and faking it by injecting
a copy of the override block would produce a test that passes while the real rule is
broken. Covered by manual review and the flat canary instead.

### Seam 2 — the packed tarball, in a scratch consumer

A different contract, and one that **cannot be observed from inside the repo** — which is
what justifies a second seam. A script covering verification steps 4–8: the exports map
resolves, the `.d.ts` resolves and contains no `@base-ui`, every component chunk starts
with `"use client"`, the CSS subpath imports, and unused components tree-shake out.

Runs at milestone gates, not per commit.

### Not seams

`stylelint` enforces the Layer-2-only rule as a build failure, not a test.
`tsc --noEmit` over the playground typechecks the public props interfaces for free.

---

## Phasing

### Phase 1 — Vertical slice

Token vocabulary, the five components, the glass theme, and the dashboard, built
together.

**Exit criteria:**

1. The dashboard is usable and built against the packed tarball
2. `flat.css` can be filled in completely without editing any `.tsx`
3. Glass degrades correctly with `backdrop-filter` unsupported, and under
   `prefers-reduced-transparency` and `prefers-reduced-motion`
4. `tokens.css` has stopped changing daily — then Playwright goes in

### Phase 2 — Whatever the dashboard demanded

Built on demand, in the order real use surfaced them. No planned roster.

### Phase 3 — Release

Theme #2 (flat, promoted from canary to shipped — the real test of the architecture).
Port specimens to Storybook for consumer-facing docs. README with a theme gallery.
Publish.

---

## Verification

1. `npm run dev` → playground; both color schemes render coherently, degraded states
   included
2. `npm test` → green
3. `npm run lint:css` → stylelint passes, proving no raw values leaked into components
4. `npm run build` → `dist/` contains ESM, `.d.ts`, per-component chunks, and a single
   `styles.css`
5. `grep -r "@base-ui" dist/*.d.ts` → **no matches** (insulation rule holds)
6. `head -1 dist/components/*/*.js` → every component chunk starts with `"use client"`
7. `npm pack`, install the tarball into the dashboard → renders with zero extra config
8. Build the dashboard and grep its output bundle for `Dialog` and
   `@base-ui/react/dialog` when unused → **no matches**, proving components and their
   primitives actually tree-shake rather than only appearing to

---

## Risks

- **Token vocabulary churn.** Near-certain in Phase 1; the five-component slice and the
  flat canary are the mitigations. Do not start Phase 2 until it stops moving.
- **Glass over dense data.** Accepted, not solved. `Table` is the canary; if it cannot be
  made legible by raising scrim opacity, the theme needs rethinking before Phase 2.
- **`Table` scope creep.** Presentational-only is a hard boundary. The moment sorting or
  virtualization is discussed, it goes to TanStack Table in the dashboard.
- **Base UI version churn.** Pin exact versions; it ships monthly minors.
- **A library with one consumer** is a library designed for one consumer. The dashboard
  keeps this honest but does not eliminate it. Treat the second consumer as the real API
  review.
