"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { toPrimitiveRender, type RenderProp } from "../../lib/render";
import {
  GAP_CLASS,
  RATIO_CLASS,
  STACK_AT_CLASS,
  type SplitGap,
  type SplitRatio,
  type SplitStackAt,
} from "./variants";
import styles from "./Split.module.css";

export interface SplitProps extends React.ComponentPropsWithoutRef<"div"> {
  /** @default "1:1" */
  ratio?: SplitRatio;
  /** @default "md" */
  gap?: SplitGap;
  /**
   * Where the columns become rows. To drive the layout entirely by hand, set
   * `--ui-split-columns` and pass `never` — below a threshold the query
   * declares that token on the grid itself, and wins over anything inherited.
   *
   * @default "md"
   */
  stackAt?: SplitStackAt;
  /**
   * Render as a different element — a `<main>`, a `<section>` — keeping the
   * layout and losing none of the semantics.
   */
  render?: RenderProp;
}

/**
 * Two regions side by side, becoming two rows once the Split itself is too
 * narrow — its own width, not the viewport's, so a Split nested inside another
 * stacks when its column runs out of room rather than when the page does.
 *
 * Two elements: the root establishes containment, the inner grid is what the
 * container query can target, because a query container can never match its
 * own query. The root is what takes `className`, `style` and the rest — sizing
 * the grid instead would leave the container measuring the wrong box. That is
 * the opposite of Table, where the semantic `<table>` is the root and the
 * container gets an escape hatch; here the grid has no semantics and no knob
 * that is not a token cascading from the root.
 *
 * Split is two regions. A third child starts a new row.
 */
export const Split = React.forwardRef<HTMLDivElement, SplitProps>(function Split(
  { ratio = "1:1", gap = "md", stackAt = "md", className, children, render, ...rest },
  ref,
) {
  return useRender({
    ref,
    render: toPrimitiveRender(render),
    defaultTagName: "div",
    props: {
      ...rest,
      className: cn(
        styles.root,
        RATIO_CLASS[ratio],
        GAP_CLASS[gap],
        STACK_AT_CLASS[stackAt],
        className,
      ),
      children: <div className={styles.grid}>{children}</div>,
    },
  });
});
