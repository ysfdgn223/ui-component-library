import { expect, test } from "@playwright/test";
import { backgroundAlpha, computed, resolvedColor, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the table is a real table to assistive technology", async ({ page }) => {
  const table = specimen(page, "light", "table").getByRole("table");

  await expect(table).toHaveAccessibleName("Inventory by warehouse");
  await expect(table.getByRole("columnheader")).toHaveCount(4);
  await expect(table.getByRole("row")).toHaveCount(4);
});

test("dense data gets a more opaque surface than ordinary chrome", async ({ page }) => {
  const tableSurface = specimen(page, "light", "table").getByTestId("table-surface");
  const card = specimen(page, "light", "card").getByTestId("card-raised");

  expect(await backgroundAlpha(tableSurface)).toBeGreaterThan(await backgroundAlpha(card));
});

test("the table has no behaviour — no sorting, no selection", async ({ page }) => {
  const table = specimen(page, "light", "table").getByRole("table");
  const header = table.getByRole("columnheader").first();

  await header.click();

  expect(await header.getAttribute("aria-sort")).toBeNull();
  expect(await table.getAttribute("aria-multiselectable")).toBeNull();
  await expect(table.getByRole("button")).toHaveCount(0);
});

test("cells take their rules and text colour from tokens", async ({ page }) => {
  const specimenRoot = specimen(page, "light", "table");
  const cell = specimenRoot.getByRole("cell").first();

  await expect(cell).toHaveCSS("border-bottom-color", await resolvedColor(specimenRoot, "var(--ui-color-border)"));
  await expect(cell).toHaveCSS("color", await resolvedColor(specimenRoot, "var(--ui-color-fg)"));
});

test("numeric columns align to the end", async ({ page }) => {
  const cell = specimen(page, "light", "table").getByTestId("table-numeric").first();

  await expect(cell).toHaveCSS("text-align", "right");
});

test("a wide table scrolls inside its own container", async ({ page }) => {
  const container = specimen(page, "light", "table").getByTestId("table-surface");

  expect(await computed(container, "overflow-x")).toBe("auto");
});
