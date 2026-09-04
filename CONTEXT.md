# UI Component Library

A React component library for the web, consumed as an npm package by other
projects. Its organising idea is that every visual decision a component makes is
expressed as a named token rather than a literal value, so the entire look of an
application can be redefined without touching component code.

## Language

### Visual axes

**Theme**:
The visual personality of the UI — shape, material, weight, typography and
motion. Deliberately excludes the light/dark distinction, which is the other
axis. `glass` is the first theme.
_Avoid_: vibe, skin, style, look, preset

**Color scheme**:
Whether the UI renders light or dark. Orthogonal to Theme — any theme must work
under either color scheme.
_Avoid_: theme, mode, dark mode, appearance

### Tokens

**Token**:
A named visual value that components reference instead of a literal. The
complete set of tokens is the vocabulary a theme has to speak in.

**Primitive token**:
A raw value with no meaning attached — a specific colour, a step on the spacing
scale, a font stack. Components never reference these directly.
_Avoid_: base token, global token

**Semantic token**:
A token named for its role rather than its value — the accent colour, the radius
of a control, the elevation of an overlay. This is the layer components are
allowed to use, and the layer a theme redefines.
_Avoid_: alias token, role token

**Component token**:
A token scoped to one component, for a knob no other component needs. Used only
when a semantic token would be wrong to introduce.

### Component anatomy

**Variant module**:
The `variants.ts` beside a component, holding its variant union types together
with the `ClassMap` lookups from each union member to a CSS Module class. Every
component that has variants has one, so the `.tsx` carries only its props and
its element. The unions live here rather than in the component because
`ClassMap` is what makes adding a member a compile error until its class
exists, and because splitting the two would make the pair import each other.
One per component, never a shared module: each map dereferences its own CSS
Module, so a shared one would pull every component's stylesheet into every
import.
_Avoid_: variants file, class map file, style map

### Layout

**Stack**:
A column. One element, `flex-direction: column`, spaced by one token. Children
stretch by default, because a consumer reaching for a Stack has said what
arrangement they want and the arrangement is nearly always a column of
full-width things — which is a different question from Card, a surface that
cannot know what it contains.
_Avoid_: VStack, Flex, column, list, group

**Split**:
Two regions side by side in a named ratio, becoming two rows once the Split
itself is too narrow. Not a grid: the ratio is a closed set of proportions
rather than a per-child size, and a third child starts a new row.
_Avoid_: Row, Columns, Sidebar, Grid, Cluster, two-column

**Query container**:
An element with `container-type` set, which the widths in a `@container` rule
are measured against. A container query is answered by the nearest such
**ancestor**, so an element can never query itself — which is why Split is two
elements and not one. Establishing containment also stops the element being
sized by its contents, and makes it a containing block for positioned
descendants.
_Avoid_: breakpoint parent, wrapper, container (unqualified)

**Stacking threshold**:
The width of a Split's own box below which its columns become rows — named
`sm` / `md` / `lg`, chosen by `stackAt`. Measured against the Split, never the
viewport, so a Split nested inside another stacks when its column runs out of
room rather than when the page does. The one arrangement decision in the
library written as a literal rather than a token, because a custom property is
not substituted in an at-rule prelude: `@container (width < var(--x))` is not
valid CSS. Treated as structure, like Table's scroll container, not as
appearance.
_Avoid_: breakpoint, media query, viewport width, responsive size

**Spacing ladder**:
The four names — `none` / `sm` / `md` / `lg` — every spacing prop resolves
through, whether it is a padding or a gap: `0`, `--ui-space-3`, `--ui-space-5`,
`--ui-space-6`. The names are the vocabulary, so `md` means one length
everywhere. A component needing a length off the ladder sets its component
token rather than the library growing a fifth name.
_Avoid_: size scale, spacing scale, t-shirt sizes, density

### Development surfaces

**Specimen**:
A single component rendered in its notable states — every size, variant and
condition worth looking at. One specimen per component, shared by the playground
views and the visual regression snapshots so they can never disagree.
_Avoid_: story, example, demo, fixture

**Consumer**:
A project that installs the library. The first one is the inventory dashboard,
which lives in its own repository precisely so it has no insider access to the
library's source and must go through the published package surface.
_Avoid_: client, user, app
