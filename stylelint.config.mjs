/**
 * The Layer-2-only rule, enforced as a build failure rather than a test.
 *
 * Components may reference semantic tokens (`--ui-color-accent`) and their own
 * component tokens (`--ui-button-padding-x`). They may not reference a
 * primitive token and may not write a literal.
 *
 * Two rules, because one is not enough:
 *
 * 1. `declaration-strict-value` rejects literals — `#fff`, `4px`, `Arial`. Its
 *    `ignoreFunctions` default has to stay on, or `color-mix()` and a
 *    two-shadow `box-shadow` list are both rejected, and the vocabulary needs
 *    those.
 * 2. That leaves a colour-function hole (`rgb(0 0 0 / 0.5)` would pass), so a
 *    disallowed-list closes it for the colour-ish properties specifically.
 *
 * One consequence worth knowing: the rule reads a comma-separated value as a
 * literal, so `box-shadow: var(--a), var(--b)` is rejected. Composing the two
 * into a component token first — `--ui-card-shadow: var(--a), var(--b)` — is
 * the way through, and is what component tokens are for anyway.
 *
 * src/styles/** is exempt: defining raw values is exactly what the token files
 * are for.
 */
const TOKEN_ONLY_PROPERTIES = [
  "color",
  "background-color",
  "border-radius",
  "box-shadow",
  "border-width",
  "font-family",
  "backdrop-filter",
  // Gap is the only interesting property a layout component has, so it is the
  // one most likely to be written as a literal. `padding` cannot join the list
  // — Table's `var(--ui-space-3) var(--ui-space-4) 0` reads as a literal to
  // this rule — so a padding still relies on the convention alone.
  "gap",
  "row-gap",
  "column-gap",
];

const RAW_COLOUR_OR_MATERIAL = [
  String.raw`/#[0-9a-fA-F]{3,8}\b/`,
  String.raw`/\brgba?\(/`,
  String.raw`/\bhsla?\(/`,
  String.raw`/\boklch\(/`,
  String.raw`/\bblur\(/`,
];

export default {
  plugins: ["stylelint-declaration-strict-value"],
  ignoreFiles: ["dist/**", "node_modules/**"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      TOKEN_ONLY_PROPERTIES,
      {
        ignoreValues: ["currentColor", "inherit", "transparent", "none", "unset", "initial"],
        message:
          "Components speak in semantic and component tokens only — never a primitive token, never a literal",
      },
    ],
    "declaration-property-value-disallowed-list": [
      {
        "/^(color|background-color|border-color|box-shadow|backdrop-filter|outline-color)$/":
          RAW_COLOUR_OR_MATERIAL,
      },
      {
        message:
          "Raw colour and blur values belong in src/styles, not in a component. Reference a token.",
      },
    ],
    // Components are theme-unaware. A component that names a theme has stopped
    // being restyleable by tokens alone, which is the whole design.
    "selector-disallowed-list": [
      [/\[data-ui-theme/, /\[data-ui-color-scheme/],
      {
        message:
          "A component may not select on a theme or colour scheme. Redefine a token in src/styles instead.",
      },
    ],
  },
  overrides: [
    {
      files: ["src/styles/**/*.css"],
      rules: {
        "scale-unlimited/declaration-strict-value": null,
        "declaration-property-value-disallowed-list": null,
        "selector-disallowed-list": null,
      },
    },
  ],
};
