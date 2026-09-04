import { type ClassMap } from "../../lib/cn";
import styles from "./Button.module.css";

/** How the tone is applied: filled, tinted, bordered or bare. */
export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

/** Which colour role the button speaks in. */
export type ButtonTone = "accent" | "neutral" | "danger";

export const VARIANT_CLASS: ClassMap<ButtonVariant> = {
  solid: styles.solid,
  soft: styles.soft,
  outline: styles.outline,
  ghost: styles.ghost,
};

export const SIZE_CLASS: ClassMap<ButtonSize> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const TONE_CLASS: ClassMap<ButtonTone> = {
  accent: styles.toneAccent,
  neutral: styles.toneNeutral,
  danger: styles.toneDanger,
};
