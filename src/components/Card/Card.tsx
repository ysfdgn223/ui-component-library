"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import {
  PADDING_CLASS,
  SURFACE_CLASS,
  type CardPadding,
  type CardSurface,
} from "./variants";
import styles from "./Card.module.css";

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** @default "raised" */
  surface?: CardSurface;
  /** @default "md" */
  padding?: CardPadding;
}

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
