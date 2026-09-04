"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { toPrimitiveRender, type RenderProp } from "../../lib/render";
import {
  SIZE_CLASS,
  TONE_CLASS,
  VARIANT_CLASS,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from "./variants";
import styles from "./Button.module.css";

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /** @default "solid" */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** @default "accent" */
  tone?: ButtonTone;
  /** Rendered before the label, sized by `--ui-icon-size` and inheriting colour. */
  startIcon?: React.ReactNode;
  /** Rendered after the label, sized by `--ui-icon-size` and inheriting colour. */
  endIcon?: React.ReactNode;
  /**
   * Render as a different element — an anchor, a router link — keeping the
   * button's styling and losing none of its semantics.
   */
  render?: RenderProp;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    size = "md",
    tone = "accent",
    startIcon,
    endIcon,
    className,
    children,
    render,
    type,
    ...rest
  },
  ref,
) {
  return useRender({
    ref,
    render: toPrimitiveRender(render),
    defaultTagName: "button",
    props: {
      // Only a real <button> gets a type; putting one on a consumer's anchor
      // or router link would be noise.
      ...(render === undefined ? { type: type ?? "button" } : {}),
      ...rest,
      className: cn(styles.root, VARIANT_CLASS[variant], SIZE_CLASS[size], TONE_CLASS[tone], className),
      children: (
        <>
          {startIcon ? <span className={styles.icon}>{startIcon}</span> : null}
          {children}
          {endIcon ? <span className={styles.icon}>{endIcon}</span> : null}
        </>
      ),
    },
  });
});
