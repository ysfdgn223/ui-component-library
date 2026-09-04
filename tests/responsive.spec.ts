import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { specimen } from "./helpers";

/**
 * The library is for responsive web, so a phone is a supported viewport rather
 * than a separate target. These run at a narrow width instead of in a second
 * Playwright project, because what needs checking is the CSS at that width —
 * not a different browser.
 */
const PHONE = { width: 380, height: 780 };

test.use({ viewport: PHONE });

async function pageOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test("the page does not scroll sideways on a phone", async ({ page }) => {
  await page.goto("/");

  const { scrollWidth, clientWidth } = await pageOverflow(page);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("a wide table scrolls inside itself rather than stretching the page", async ({ page }) => {
  await page.goto("/");
  const container = specimen(page, "light", "table").getByTestId("table-surface");

  const overflow = await container.evaluate((node) => ({
    scrolls: node.scrollWidth > node.clientWidth,
    withinViewport: node.getBoundingClientRect().width <= document.documentElement.clientWidth,
  }));

  expect(overflow.scrolls).toBe(true);
  expect(overflow.withinViewport).toBe(true);

  const { scrollWidth, clientWidth } = await pageOverflow(page);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("an open dialog fits the viewport", async ({ page }) => {
  await page.goto("/");
  await specimen(page, "light", "dialog").getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(PHONE.width);
  expect(box!.height).toBeLessThanOrEqual(PHONE.height);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
});

test("nothing new is inaccessible at a phone width", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).include("[data-scheme-region]").analyze();

  expect(results.violations).toEqual([]);
});
