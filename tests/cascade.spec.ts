import { expect, test } from "@playwright/test";
import { computed, region, resolvedColor, specimen, tokenValue } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the provider is a plain element carrying the two axes", async ({ page }) => {
  const provider = region(page, "light");

  await expect(provider).toHaveJSProperty("tagName", "DIV");
  await expect(provider).toHaveAttribute("data-ui-theme", "glass");
  await expect(provider).toHaveAttribute("data-ui-color-scheme", "light");
});

test("the two axes are independent: same theme, different colour scheme", async ({ page }) => {
  const [light, dark] = [region(page, "light"), region(page, "dark")];

  expect(await tokenValue(light, "--ui-radius-control")).toBe(await tokenValue(dark, "--ui-radius-control"));
  expect(await tokenValue(light, "--ui-color-fg")).not.toBe(await tokenValue(dark, "--ui-color-fg"));
});

test("one token override reaches every component, with no per-component work", async ({ page }) => {
  const light = region(page, "light");
  const button = specimen(page, "light", "button").getByRole("button", { name: "Solid accent" });
  const input = specimen(page, "light", "field").getByLabel("Email", { exact: true });

  await light.evaluate((node) => node.style.setProperty("--ui-radius-control", "0px"));

  await expect(button).toHaveCSS("border-top-left-radius", "0px");
  await expect(input).toHaveCSS("border-top-left-radius", "0px");
});

test("reduced motion zeroes the transition token", async ({ page }) => {
  const button = specimen(page, "light", "button").getByRole("button", { name: "Solid accent" });
  expect(await computed(button, "transition-duration")).not.toMatch(/^0s(,\s*0s)*$/);

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expect.poll(async () => tokenValue(region(page, "light"), "--ui-transition")).toBe("0s");
  expect(await computed(button, "transition-duration")).toMatch(/^0s(,\s*0s)*$/);
});

test("both colour schemes resolve their own colour roles", async ({ page }) => {
  const darkButton = specimen(page, "dark", "button").getByRole("button", { name: "Solid accent" });

  await expect(darkButton).toHaveCSS(
    "background-color",
    await resolvedColor(region(page, "dark"), "var(--ui-color-accent)"),
  );
});
