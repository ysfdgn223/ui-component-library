import { expect, test } from "@playwright/test";
import { computed, resolvedColor, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the label names the control", async ({ page }) => {
  const field = specimen(page, "light", "field");

  await expect(field.getByLabel("Email", { exact: true })).toHaveJSProperty("tagName", "INPUT");
});

test("clicking the label moves focus to the control", async ({ page }) => {
  const field = specimen(page, "light", "field");

  await field.getByText("Email", { exact: true }).click();

  await expect(field.getByLabel("Email", { exact: true })).toBeFocused();
});

test("description and error are announced with the control", async ({ page }) => {
  const field = specimen(page, "light", "field");

  const described = await field
    .getByLabel("Work email")
    .evaluate((input) =>
      (input.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .join(" | "),
    );

  expect(described).toContain("We only use this to sign you in");
  expect(described).toContain("Enter an address that ends in a domain");
});

test("an invalid field is invalid to assistive technology and to the eye", async ({ page }) => {
  const field = specimen(page, "light", "field");
  const input = field.getByLabel("Work email");

  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveCSS("border-top-color", await resolvedColor(field, "var(--ui-color-danger)"));
});

test("a valid field is not styled as an error", async ({ page }) => {
  const field = specimen(page, "light", "field");
  const input = field.getByLabel("Email", { exact: true });

  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveCSS("border-top-color", await resolvedColor(field, "var(--ui-color-border-strong)"));
});

test("keyboard focus draws the focus ring on the control", async ({ page }) => {
  const field = specimen(page, "light", "field");
  const input = field.getByLabel("Email", { exact: true });

  await input.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");

  await expect(input).toBeFocused();
  await expect(input).toHaveCSS("outline-width", "2px");
  await expect(input).toHaveCSS("outline-color", await resolvedColor(field, "var(--ui-color-focus-ring)"));
});

test("a disabled field disables its control", async ({ page }) => {
  const field = specimen(page, "light", "field");

  await expect(field.getByLabel("Locked")).toBeDisabled();
});

test("the control's surface comes from the theme's material", async ({ page }) => {
  const field = specimen(page, "light", "field");
  const input = field.getByLabel("Email", { exact: true });

  expect(await computed(input, "backdrop-filter")).not.toBe("none");
});
