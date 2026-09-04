"use client";

import * as React from "react";
import { cn, type ClassMap } from "../../lib/cn";
import styles from "./Card.module.css";

/** Which surface role the card takes — raised chrome, or a floating overlay. */
export type CardSurface = "raised" | "overlay";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** @default "raised" */
  surface?: CardSurface;
  /** @default "md" */
  padding?: CardPadding;
}

const SURFACE_CLASS: ClassMap<CardSurface> = {
  raised: undefined,
  overlay: styles.surfaceOverlay,
};

const PADDING_CLASS: ClassMap<CardPadding> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

/**
 * A surface. Card has no primitive behind it — it exists to prove that a
 * theme's material (blur, tint, scrim, highlight, elevation) reads correctly
 * with nothing else going on.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { surface = "raised", padding = "md", className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.root, SURFACE_CLASS[surface], PADDING_CLASS[padding], className)}
      {...rest}
    />
  );
});
