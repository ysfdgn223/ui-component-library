import clsx, { type ClassValue } from "clsx";

/**
 * Merge the library's own class names with whatever a consumer passed.
 * A consumer's `className` is always additive — it never replaces ours.
 */
export function cn(...values: ClassValue[]): string {
  return clsx(values);
}

/**
 * A lookup from a discrete variant prop to a CSS Module class. Variants are
 * plain objects like this one rather than a variant-authoring dependency.
 */
export type ClassMap<Key extends PropertyKey> = Record<Key, string | undefined>;
