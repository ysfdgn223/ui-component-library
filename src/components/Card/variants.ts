import { type ClassMap } from "../../lib/cn";
import styles from "./Card.module.css";

/** Which surface role the card takes — raised chrome, or a floating overlay. */
export type CardSurface = "raised" | "overlay";

export type CardPadding = "none" | "sm" | "md" | "lg";

export const SURFACE_CLASS: ClassMap<CardSurface> = {
  raised: undefined,
  overlay: styles.surfaceOverlay,
};

export const PADDING_CLASS: ClassMap<CardPadding> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};
