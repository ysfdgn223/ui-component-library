/**
 * The two visual axes, as they appear in the DOM.
 *
 * Every token in this library is scoped to `[data-ui-theme]`, and the Dialog
 * reads both attributes back off the nearest provider when it portals — so the
 * spelling is load-bearing in more than one place, and lives here rather than
 * in each of them. The `ui` prefix is what keeps a consumer's own
 * `data-theme="dark"` from colliding with ours.
 */
export const THEME_ATTRIBUTE = "data-ui-theme";
export const COLOR_SCHEME_ATTRIBUTE = "data-ui-color-scheme";

/** Matches any provider element. */
export const PROVIDER_SELECTOR = `[${THEME_ATTRIBUTE}]`;
