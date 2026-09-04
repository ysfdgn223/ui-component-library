"use client";

import * as React from "react";
import { COLOR_SCHEME_ATTRIBUTE, THEME_ATTRIBUTE } from "./axes";

/**
 * The visual personality of the UI — shape, material, weight, typography and
 * motion. Deliberately excludes light/dark, which is the other axis.
 *
 * The union is open so a consumer can mount a theme of their own without
 * casting; `glass` is the only theme this package ships.
 */
export type Theme = "glass" | (string & {});

/** Whether the UI renders light or dark. Orthogonal to {@link Theme}. */
export type ColorScheme = "light" | "dark";

export interface UIProviderProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Visual personality. Defaults to `glass`. */
  theme?: Theme;
  /** Light or dark. Defaults to `light`. */
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
}

/**
 * Sets both visual axes as data attributes on a plain element. Tokens cascade
 * from here to every descendant, which is why components are theme-unaware:
 * no context, no props, no re-renders, safe to render on the server.
 */
export const UIProvider = React.forwardRef<HTMLDivElement, UIProviderProps>(
  function UIProvider({ theme = "glass", colorScheme = "light", ...rest }, ref) {
    const axes = { [THEME_ATTRIBUTE]: theme, [COLOR_SCHEME_ATTRIBUTE]: colorScheme };
    return <div ref={ref} {...axes} {...rest} />;
  },
);
