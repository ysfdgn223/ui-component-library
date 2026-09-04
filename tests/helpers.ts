import type { Locator, Page } from "@playwright/test";
import type { ColorScheme } from "../src";

/** The region of the specimen page rendering one color scheme. */
export function region(page: Page, scheme: ColorScheme): Locator {
  return page.locator(`[data-scheme-region="${scheme}"]`);
}

/** One specimen, inside one color scheme's region. */
export function specimen(page: Page, scheme: ColorScheme, id: string): Locator {
  return region(page, scheme).locator(`[data-specimen="${id}"]`);
}

/**
 * The value a custom property resolves to on an element, as the browser
 * computes it. This is the assertion style the whole token thesis rests on —
 * it proves the cascade actually happened rather than that a class was named.
 */
export function tokenValue(locator: Locator, token: string): Promise<string> {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name).trim(),
    token,
  );
}

/** A computed CSS property on an element. */
export function computed(locator: Locator, property: string): Promise<string> {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

/**
 * What the browser computes for `property: expression` inside a given scope.
 *
 * Every token assertion in this suite goes through this one probe, so a token
 * reference and a computed value are always compared after the same
 * normalisation — Chromium reports `saturate(180%)` back as `saturate(1.8)`,
 * and the assertion should be about the value, not about how it is printed.
 */
export function resolvedComputed(
  locator: Locator,
  property: string,
  expression: string,
): Promise<string> {
  return locator.evaluate(
    (element, [prop, expr]) => {
      const probe = document.createElement("span");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.setProperty(prop!, expr!);
      element.appendChild(probe);
      const value = getComputedStyle(probe).getPropertyValue(prop!);
      probe.remove();
      return value;
    },
    [property, expression],
  );
}

/** The colour a CSS expression resolves to inside a scope, as `rgb(...)`. */
export function resolvedColor(locator: Locator, expression: string): Promise<string> {
  return resolvedComputed(locator, "background-color", expression);
}

/** The pixel length a CSS expression resolves to — a token authored in rem. */
export async function resolvedLength(locator: Locator, expression: string): Promise<number> {
  return Number.parseFloat(await resolvedComputed(locator, "width", expression));
}

/**
 * The used widths of a grid's columns, in pixels.
 *
 * Chromium serialises `grid-template-columns` on a grid container as the used
 * track sizes, so the length of this array is how many columns there actually
 * are — one means the grid collapsed. Testing a container query means varying
 * the container and observing the layout it produced, because the query itself
 * is not observable.
 */
export async function gridTracks(locator: Locator): Promise<number[]> {
  const value = await computed(locator, "grid-template-columns");
  return value.split(" ").map(Number.parseFloat);
}

/**
 * The alpha channel of a computed background colour. Chromium serializes a
 * `color-mix()` result as `color(srgb r g b / a)` rather than `rgba(...)`, so
 * both spellings have to be understood.
 */
export async function backgroundAlpha(locator: Locator): Promise<number> {
  const value = await computed(locator, "background-color");
  const slashed = /\/\s*([\d.]+)\s*\)\s*$/.exec(value);
  if (slashed?.[1] !== undefined) return Number.parseFloat(slashed[1]);
  const rgba = /rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/.exec(value);
  if (rgba?.[1] !== undefined) return Number.parseFloat(rgba[1]);
  return 1;
}

/**
 * `prefers-reduced-transparency` is not one of the media features Playwright
 * emulates natively, so it goes through a CDP session, which accepts arbitrary
 * features. Chromium only — which is the browser this suite runs.
 */
export async function emulateReducedTransparency(page: Page, value: "reduce" | "no-preference") {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value }],
  });
  return () => client.detach();
}
