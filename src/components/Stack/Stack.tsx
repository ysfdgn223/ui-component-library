"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { toPrimitiveRender, type RenderProp } from "../../lib/render";
import { ALIGN_CLASS, GAP_CLASS, type StackAlign, type StackGap } from "./variants";
import styles from "./Stack.module.css";

export interface StackProps extends React.ComponentPropsWithoutRef<"div"> {
  /** @default "md" */
  gap?: StackGap;
  /** @default "stretch" */
  align?: StackAlign;
  /**
   * Render as a different element — a `<main>`, a `<ul>`, a `<nav>` — keeping
   * the column and losing none of the semantics.
   */
  render?: RenderProp;
}

/**
 * A column, spaced by one token. One element, because a Stack is a column at
 * every width and has nothing to query.
 *
 * Children stretch by default. Card deliberately does not — it is a surface
 * that cannot know what it contains, and stretching turns a Button inside it
 * into a full-width Button. A Stack is different: a consumer reaching for one
 * has said what arrangement they want, and the arrangement they nearly always
 * want is a column of full-width things. `align="start"` is the stack of
 * buttons.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = "md", align = "stretch", className, render, ...rest },
  ref,
) {
  return useRender({
    ref,
    render: toPrimitiveRender(render),
    defaultTagName: "div",
    props: {
      ...rest,
      className: cn(styles.root, GAP_CLASS[gap], ALIGN_CLASS[align], className),
    },
  });
});
