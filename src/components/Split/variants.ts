import { type ClassMap } from "../../lib/cn";
import styles from "./Split.module.css";

/**
 * The two columns' share of the inline size, written the way a ratio is read:
 * `"1:2"` is a column beside one twice its width. Closed on purpose — a Split
 * is two regions in a chosen proportion, not a grid.
 */
export type SplitRatio = "1:1" | "1:2" | "2:1" | "1:3" | "3:1";

/**
 * The library's spacing ladder, applied between the columns.
 *
 * Structurally identical to `StackGap`, and deliberately not shared: a variant
 * module dereferences its own CSS Module, so one shared map would pull both
 * stylesheets into every import.
 */
export type SplitGap = "none" | "sm" | "md" | "lg";

/**
 * The width — of the Split's own box, not the viewport — below which the two
 * columns become two rows, so a Split composes correctly when nested inside
 * another. `never` keeps them side by side at any width.
 */
export type SplitStackAt = "sm" | "md" | "lg" | "never";

export const RATIO_CLASS: ClassMap<SplitRatio> = {
  "1:1": styles.ratio1to1,
  "1:2": styles.ratio1to2,
  "2:1": styles.ratio2to1,
  "1:3": styles.ratio1to3,
  "3:1": styles.ratio3to1,
};

export const GAP_CLASS: ClassMap<SplitGap> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

export const STACK_AT_CLASS: ClassMap<SplitStackAt> = {
  sm: styles.stackSm,
  md: styles.stackMd,
  lg: styles.stackLg,
  // No class: nothing to redefine, so the ratio holds at every width.
  never: undefined,
};
