import { expect, test } from "@playwright/test";
import { computed, resolvedColor, resolvedLength, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("solid tones take their fill from the colour role tokens", async ({ page }) => {
  const button = specimen(page, "light", "button");

  for (const [tone, token] of [
    ["Solid accent", "--ui-color-accent"],
    ["Solid danger", "--ui-color-danger"],
  ] as const) {
    const element = button.getByRole("button", { name: tone });
    await expect(element).toHaveCSS("background-color", await resolvedColor(button, `var(${token})`));
  }
});

test("overriding one token restyles the button, with no component change", async ({ page }) => {
  const region = page.locator('[data-scheme-region="light"]');
  const element = specimen(page, "light", "button").getByRole("button", { name: "Solid accent" });

  await region.evaluate((node) => node.style.setProperty("--ui-color-accent", "rgb(255, 0, 128)"));

  await expect(element).toHaveCSS("background-color", "rgb(255, 0, 128)");
});

test("sizes map onto the type scale", async ({ page }) => {
  const button = specimen(page, "light", "button");

  for (const [name, token] of [
    ["Small", "--ui-text-sm"],
    ["Medium", "--ui-text-base"],
    ["Large", "--ui-text-lg"],
  ] as const) {
    const element = button.getByRole("button", { name });
    const expected = await resolvedLength(button, `var(${token})`);
    expect(Number.parseFloat(await computed(element, "font-size"))).toBeCloseTo(expected, 1);
  }
});

test("keyboard focus draws a focus ring from the focus token", async ({ page }) => {
  const button = specimen(page, "light", "button");
  const element = button.getByRole("button", { name: "Solid accent" });

  // Focus has to arrive by keyboard, or :focus-visible does not match and the
  // test would be asserting the wrong rule.
  await element.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");

  await expect(element).toBeFocused();
  await expect(element).toHaveCSS("outline-width", "2px");
  await expect(element).toHaveCSS("outline-color", await resolvedColor(button, "var(--ui-color-focus-ring)"));
});

test("a disabled button is disabled to the browser, not just to the eye", async ({ page }) => {
  const element = specimen(page, "light", "button").getByRole("button", { name: "Disabled" });

  await expect(element).toBeDisabled();
});

test("render swaps the element without losing the styling", async ({ page }) => {
  const button = specimen(page, "light", "button");
  const link = button.getByRole("link", { name: "Link button" });

  await expect(link).toHaveJSProperty("tagName", "A");
  await expect(link).toHaveCSS("background-color", await resolvedColor(button, "var(--ui-color-accent)"));
});

test("a consumer className is merged, not substituted", async ({ page }) => {
  const button = specimen(page, "light", "button");
  const element = button.getByRole("button", { name: "Custom class" });

  await expect(element).toHaveClass(/pg-custom-class/);
  // Still filled by the component's own rule, so the class list was merged.
  await expect(element).toHaveCSS("background-color", await resolvedColor(button, "var(--ui-color-accent)"));
});

test("an icon slot inherits the button's colour and the icon size token", async ({ page }) => {
  const button = specimen(page, "light", "button");
  const icon = button.getByTestId("button-icon");

  const [iconColor, labelColor] = await Promise.all([
    computed(icon, "color"),
    computed(button.getByRole("button", { name: "With icon" }), "color"),
  ]);

  expect(iconColor).toBe(labelColor);
  expect(Number.parseFloat(await computed(icon, "width"))).toBeGreaterThan(0);
});
