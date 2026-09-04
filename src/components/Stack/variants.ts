import { type ClassMap } from "../../lib/cn";
import styles from "./Stack.module.css";

/**
 * The library's spacing ladder, applied between children.
 *
 * The same four names `CardPadding` uses, resolving to the same four lengths.
 * A vocabulary is only worth anything if `md` means one length everywhere, so
 * this is deliberately not tuned separately for gaps. A column that needs a
 * length off the ladder sets `--ui-stack-gap` instead.
 */
export type StackGap = "none" | "sm" | "md" | "lg";

/**
 * How wide children are across the column.
 *
 * `stretch` is the default because the reason to reach for a Stack is a column
 * of full-width things — a Card that shrink-wraps to its own text is the
 * surprising outcome, not the safe one. `start` is the shrink-wrapping
 * alternative, and the value a stack of buttons wants.
 */
export type StackAlign = "stretch" | "start" | "center" | "end";

export const GAP_CLASS: ClassMap<StackGap> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

export const ALIGN_CLASS: ClassMap<StackAlign> = {
  // Flex's own default — no class, the same shape as Card's surface="raised".
  stretch: undefined,
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};
