import { expect, test } from "@playwright/test";
import {
  backgroundAlpha,
  computed,
  emulateReducedTransparency,
  resolvedColor,
  resolvedComputed,
  resolvedLength,
  specimen,
  tokenValue,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("a card is a surface: raised fill, surface radius, theme blur", async ({ page }) => {
  const card = specimen(page, "light", "card");
  const raised = card.getByTestId("card-raised");

  await expect(raised).toHaveCSS("background-color", await resolvedColor(card, "var(--ui-surface-raised)"));
  expect(Number.parseFloat(await computed(raised, "border-top-left-radius"))).toBeCloseTo(
    await resolvedLength(card, "var(--ui-radius-surface)"),
    1,
  );
  expect(await computed(raised, "backdrop-filter")).toBe(
    await resolvedComputed(card, "backdrop-filter", "var(--ui-surface-blur)"),
  );
});

test("an overlay surface sits more opaque than a raised one", async ({ page }) => {
  const card = specimen(page, "light", "card");

  expect(await backgroundAlpha(card.getByTestId("card-overlay"))).toBeGreaterThan(
    await backgroundAlpha(card.getByTestId("card-raised")),
  );
});

test("a card carries the theme's raised elevation", async ({ page }) => {
  const card = specimen(page, "light", "card");

  const shadow = await computed(card.getByTestId("card-raised"), "box-shadow");
  expect(shadow).not.toBe("none");
});

test("reduced transparency makes the glass opaque — by token, not by rule", async ({ page }) => {
  const card = specimen(page, "light", "card");
  const raised = card.getByTestId("card-raised");

  expect(Number.parseFloat(await tokenValue(card, "--ui-surface-scrim-opacity"))).toBeLessThan(1);
  expect(await backgroundAlpha(raised)).toBeLessThan(1);

  const detach = await emulateReducedTransparency(page, "reduce");

  await expect.poll(async () => tokenValue(card, "--ui-surface-scrim-opacity")).toBe("1");
  // Polled, not read once: the surface transitions to its new value, so the
  // assertion has to be about where it lands.
  await expect.poll(async () => backgroundAlpha(raised)).toBe(1);
  expect(await computed(raised, "backdrop-filter")).toBe("none");

  await detach();
});

test("a card takes a consumer className and forwards unknown props", async ({ page }) => {
  const card = specimen(page, "light", "card").getByTestId("card-raised");

  await expect(card).toHaveClass(/pg-custom-card/);
  await expect(card).toHaveAttribute("data-analytics-id", "card-specimen");
});
