# @ysfdgn223/ui

A React component library for responsive web, in which **every visual decision a
component makes is a named token rather than a literal value**. A theme is then
just a block of CSS that redefines those tokens: adding one costs about forty
lines and touches no component code.

```bash
npm install @ysfdgn223/ui
```

```jsx
import { Button, UIProvider } from "@ysfdgn223/ui";
import "@ysfdgn223/ui/styles.css";

export function App() {
  return (
    <UIProvider theme="glass" colorScheme="dark">
      <Button tone="accent">Ship it</Button>
    </UIProvider>
  );
}
```

That is the whole setup. `UIProvider` is a plain `<div>` carrying two data
attributes — no React context, no re-renders, safe inside React Server
Components.

## The two axes

| Axis | What it is | Values |
| --- | --- | --- |
| **Theme** | Visual personality: shape, material, weight, typography, motion | `glass` |
| **Color scheme** | Light or dark | `light`, `dark` |

They are orthogonal. Every theme must work under either color scheme, so dark
mode is not a second visual identity to maintain.

## Restyling is one token

Tokens come in three layers. Components reference the semantic layer (and their
own component tokens) — never a primitive, never a literal.

```
primitive    --ui-blue-500, --ui-radius-md, --ui-font-stack-system
semantic     --ui-color-accent, --ui-surface-raised, --ui-radius-control, ...
component    --ui-button-padding-x   (only when a component needs its own knob)
```

To rebrand, override a semantic token wherever the provider is:

```css
[data-ui-theme] {
  --ui-color-accent: #7c3aed;
  --ui-radius-control: 0;
  --ui-font-sans: "Inter", sans-serif;
}
```

Every component picks it up through the cascade. There is no component to go
and update, which is the entire point.

The full semantic vocabulary is in [`src/styles/tokens.css`](src/styles/tokens.css).

## Components

Five, deliberately — enough to find out whether the token vocabulary is wrong
without discovering it after thirty.

| Component | What it is |
| --- | --- |
| `Button` | `variant` × `size` × `tone`, icon slots, `render` composition |
| `Field` + `Input` | label, description and error wired to one control |
| `Card` | a surface: material, elevation, radius |
| `Dialog` | portalled, focus-trapped, animated in CSS from state attributes |
| `Table` | presentational only — `Root` / `Header` / `Body` / `Row` / `HeaderCell` / `Cell` |

Anything else gets built the day a consumer actually needs it.

**The table has no behaviour.** No sorting, selection, pagination, resizing or
virtualization — those are state management, not styling. Wire a headless table
library to these parts in your app, and keep that dependency there.

**No icons ship.** Icon slots take any node and style it with `currentColor` and
`--ui-icon-size`.

### Composition

Every component merges `className`, spreads unknown props onto its root and
forwards a ref. `Button` and the `Dialog` trigger and close parts take a
`render` prop to change the element:

```jsx
<Button render={<a href="/inventory" />}>Inventory</Button>
```

`asChild` does not exist here. The primitive underneath composes through
`render`, and a shim over it would lie about what is happening.

## The glass theme

Translucency, blur, specular edge highlights, content showing through chrome.
Because translucent surfaces sit over unpredictable content, contrast cannot be
guaranteed by construction — so glass degrades, and every fallback is a **token
swap rather than a component rule**:

| Condition | What changes |
| --- | --- |
| `backdrop-filter` unsupported | blur off, scrim opacity to 1 |
| `prefers-reduced-transparency: reduce` | blur off, scrim opacity to 1 |
| `prefers-reduced-motion: reduce` | `--ui-transition` to `0s` |

`--ui-surface-scrim-opacity` is the single knob controlling how opaque a glass
surface is. `Table` raises it on its own, because dense data under glass is the
theme's known weak point.

## Development

```bash
npm run dev          # the specimen page: every component, both color schemes
npm test             # Playwright, against that same page
npm run lint:css     # the token discipline, enforced as a build failure
npm run typecheck
npm run build
npm run verify:pack  # pack, install into a scratch consumer, check the contract
npm run types:css    # regenerate the CSS Module declarations (see below)
```

**CSS Module class names are typed, not stringly-typed.** `npm run types:css`
runs `happy-css-modules` over `src/**/*.module.css` and writes a
`X.module.css.d.ts` beside each stylesheet, so `styles.padNone` is a declared
property rather than an index-signature hit on Vite's ambient
`declare module '*.module.css'`. Two things follow: a misspelled class is a
`tsc` error instead of a silently-undefined class name, and go-to-definition on
`styles.padNone` lands on the rule in the `.css` file (the generator emits
declaration maps) instead of inside `node_modules/vite`.

The declarations are generated, gitignored, and regenerated by `prepare`,
`dev`, `build` and `typecheck` — so a fresh `npm ci` leaves the editor in a
correct state. While editing stylesheets, `npm run types:css:watch` keeps them
current without a restart. `prepare` runs with `--logLevel silent` on purpose:
`verify:pack` parses `npm pack --json`, and any lifecycle-script chatter on
stdout breaks that parse.

**Specimens are the shared unit.** `playground/specimens/X.tsx` renders one
component in its notable states; the playground page and the Playwright suite
consume the same file, so they cannot disagree about what a component looks
like.

**Tests run in a real browser, and there is no jsdom seam.** jsdom computes no
styles from stylesheets, has no real focus model, and cannot evaluate colour
contrast — which are precisely the three things this library needs verified.

**`src/styles/themes/flat.css` is a canary.** It is never rendered, never
exported and never imported. It exists so that the moment a component reaches
for a glass-only concept, filling in the flat file becomes visibly impossible.

## Status

`0.x`. The API is still moving, and the token vocabulary is expected to churn
until the first consumer has been through it. ESM only — adding CommonJS later
is additive rather than breaking.

MIT.
