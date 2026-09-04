import { expect, test } from "@playwright/test";
import { computed, resolvedLength, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("a stack spaces its children with the token its gap names", async ({ page }) => {
  const stack = specimen(page, "light", "stack");

  const small = await computed(stack.getByTestId("stack-stretch"), "row-gap");
  expect(Number.parseFloat(small)).toBeCloseTo(await resolvedLength(stack, "var(--ui-space-3)"), 1);

  expect(await computed(stack.getByTestId("stack-flush"), "row-gap")).toBe("0px");
});

test("a stack stretches its children, so a card fills the column", async ({ page }) => {
  const stack = specimen(page, "light", "stack").getByTestId("stack-stretch");

  const cardWidth = (await stack.locator("> *").first().boundingBox())!.width;
  const stackWidth = await stack.evaluate((node: HTMLElement) => node.clientWidth);

  expect(cardWidth).toBeCloseTo(stackWidth, 0);
});

test("a start-aligned stack lets a button size itself to its label", async ({ page }) => {
  const stack = specimen(page, "light", "stack").getByTestId("stack-start");

  const stackWidth = await stack.evaluate((node: HTMLElement) => node.clientWidth);
  const short = (await stack.locator("> *").first().boundingBox())!.width;
  const long = (await stack.locator("> *").last().boundingBox())!.width;

  expect(short).toBeLessThan(stackWidth);
  expect(long).toBeLessThan(stackWidth);
  expect(long).toBeGreaterThan(short);
});

test("a stack can render as another element", async ({ page }) => {
  const list = specimen(page, "light", "stack").getByTestId("stack-list");

  expect(await list.evaluate((node) => node.tagName)).toBe("UL");
  expect(await computed(list, "flex-direction")).toBe("column");
});

test("the gap is one component token, so a consumer can set a length off the ladder", async ({
  page,
}) => {
  const stack = specimen(page, "light", "stack");
  const stretched = stack.getByTestId("stack-stretch");

  await stretched.evaluate((node: HTMLElement) =>
    node.style.setProperty("--ui-stack-gap", "var(--ui-space-2)"),
  );

  expect(Number.parseFloat(await computed(stretched, "row-gap"))).toBeCloseTo(
    await resolvedLength(stack, "var(--ui-space-2)"),
    1,
  );
});

test("a stack takes a consumer className and forwards unknown props", async ({ page }) => {
  const stack = specimen(page, "light", "stack").getByTestId("stack-stretch");

  await expect(stack).toHaveClass(/pg-custom-stack/);
  await expect(stack).toHaveAttribute("data-analytics-id", "stack-specimen");
});
