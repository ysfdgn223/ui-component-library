/**
 * The specimen ids, in the order the page renders them.
 *
 * Kept in a module of its own so the Playwright suite can import the list
 * without importing the specimen components — a test file runs in Node, where
 * a `.module.css` import would not parse. Adding a component is one edit here,
 * and the page and the suite both follow.
 */
export const SPECIMEN_IDS = ["button", "card", "field", "dialog", "table", "split", "stack"] as const;

export type SpecimenId = (typeof SPECIMEN_IDS)[number];
