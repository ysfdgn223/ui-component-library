import { expect, test } from "@playwright/test";
import { backgroundAlpha, resolvedColor, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const openDialog = async (region: "light" | "dark", page: import("@playwright/test").Page) => {
  const dialogSpecimen = specimen(page, region, "dialog");
  await dialogSpecimen.getByRole("button", { name: "Open dialog" }).click();
  return page.getByRole("dialog");
};

test("the dialog portals out of the layout but stays inside its themed region", async ({ page }) => {
  const dialog = await openDialog("light", page);
  await expect(dialog).toBeVisible();

  const placement = await dialog.evaluate((node) => ({
    insideSpecimen: node.closest('[data-specimen="dialog"]') !== null,
    portalledToBody: node.closest("body > *")?.parentElement?.tagName ?? null,
    colorScheme: node.closest("[data-ui-theme]")?.getAttribute("data-ui-color-scheme") ?? null,
    theme: node.closest("[data-ui-theme]")?.getAttribute("data-ui-theme") ?? null,
  }));

  expect(placement.insideSpecimen).toBe(false);
  expect(placement.portalledToBody).toBe("BODY");
  // Out of the layout, still inside the cascade.
  expect(placement.theme).toBe("glass");
  expect(placement.colorScheme).toBe("light");
});

test("each region themes its own dialog", async ({ page }) => {
  const dialog = await openDialog("dark", page);

  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((node) => node.closest("[data-ui-theme]")?.getAttribute("data-ui-color-scheme")),
  ).toBe("dark");
});

test("focus is trapped while open and restored on close", async ({ page }) => {
  const trigger = specimen(page, "light", "dialog").getByRole("button", { name: "Open dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // Initial focus moves asynchronously; tabbing before it lands tests nothing.
  await expect
    .poll(async () => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null))
    .toBe(true);

  // Tab all the way round several times. Focus passes through the trap's own
  // guard elements on its way, so the assertion is where focus settles: back
  // inside the dialog, every time, never on the page behind it.
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(async () =>
        page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null),
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the close button closes the dialog", async ({ page }) => {
  const dialog = await openDialog("light", page);
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await expect(dialog).toBeHidden();
});

test("open and close are expressed as state attributes the CSS can animate", async ({ page }) => {
  const dialog = await openDialog("light", page);

  await expect(dialog).toHaveAttribute("data-open", "");
  // The entrance is a CSS transition on the state attribute, not a JS animation.
  await expect.poll(async () => dialog.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
  expect(await dialog.evaluate((node) => getComputedStyle(node).transitionDuration)).not.toBe("0s");
});

test("the popup and backdrop are built from the overlay tokens", async ({ page }) => {
  const dialog = await openDialog("light", page);
  const backdrop = page.getByTestId("dialog-backdrop");

  await expect(dialog).toHaveCSS(
    "background-color",
    await resolvedColor(specimen(page, "light", "dialog"), "var(--ui-surface-overlay)"),
  );
  await expect.poll(async () => backgroundAlpha(backdrop)).toBeGreaterThan(0);
});

test("the dialog is named and described by its own parts", async ({ page }) => {
  const dialog = await openDialog("light", page);

  await expect(dialog).toHaveAccessibleName("Delete this item?");
  await expect(dialog).toHaveAccessibleDescription(/cannot be undone/i);
});
