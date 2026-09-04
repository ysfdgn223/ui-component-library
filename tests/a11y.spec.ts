import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { ColorScheme } from "../src";
import { SPECIMEN_IDS } from "../playground/specimens/ids";
import { specimen } from "./helpers";

const SCHEMES: ColorScheme[] = ["light", "dark"];

/**
 * One accessibility pass per specimen, per colour scheme, in a real browser —
 * which is the only place colour contrast can be evaluated at all.
 */
for (const scheme of SCHEMES) {
  for (const id of SPECIMEN_IDS) {
    test(`${id} has no accessibility violations (${scheme})`, async ({ page }) => {
      await page.goto("/");

      const results = await new AxeBuilder({ page })
        .include(`[data-scheme-region="${scheme}"] [data-specimen="${id}"]`)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

/**
 * Contrast, specifically — the risk this whole theme is judged on.
 *
 * The pass above does not actually cover it: the glass theme's base surface is
 * a gradient, so axe cannot resolve what is behind the text and reports every
 * contrast check as `incomplete` rather than as a pass or a failure. Running
 * the same check with the base surface overridden to a solid colour — one
 * token, the escape hatch a Consumer has — gives axe something it can
 * evaluate, and asserting that nothing came back `incomplete` is what proves
 * the check ran at all rather than quietly skipping.
 *
 * What stays uncovered: text over the gradient itself. That is the case the
 * spec accepts as manual review.
 */
for (const scheme of SCHEMES) {
  test(`text contrast is evaluated and passes over a solid surface (${scheme})`, async ({ page }) => {
    await page.goto("/?surface=solid");

    const results = await new AxeBuilder({ page })
      .include(`[data-scheme-region="${scheme}"]`)
      .withRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
    expect(
      results.incomplete.map((entry) => `${entry.id}: ${entry.nodes.length} unresolved`),
    ).toEqual([]);
    expect(results.passes.flatMap((entry) => entry.nodes).length).toBeGreaterThan(0);
  });
}

test("an open dialog has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  await specimen(page, "light", "dialog").getByRole("button", { name: "Open dialog" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();

  expect(results.violations).toEqual([]);
});
