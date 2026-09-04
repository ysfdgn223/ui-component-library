import { expect, test } from "@playwright/test";
import { computed, gridTracks, resolvedLength, specimen } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

/** The grid is the Split's only element child; its class name is hashed. */
function grid(split: ReturnType<typeof specimen>) {
  return split.locator("> *").first();
}

test("a split lays two columns in the ratio it was given", async ({ page }) => {
  const split = specimen(page, "light", "split");
  const tracks = await gridTracks(grid(split.getByTestId("split-weighted")));

  expect(tracks).toHaveLength(2);
  expect(tracks[1]! / tracks[0]!).toBeCloseTo(2, 1);
});

test("a split stacks on its own width, not the viewport's", async ({ page }) => {
  const split = specimen(page, "light", "split");
  const wide = split.getByTestId("split-wide");
  const narrow = split.getByTestId("split-narrow");

  // The harness's own precondition: both sit on the same page at the same
  // viewport, and only their own boxes straddle the "md" threshold. If this
  // fails, the playground moved — not the container query.
  const threshold = await resolvedLength(split, "32rem");
  expect((await wide.boundingBox())!.width).toBeGreaterThan(threshold);
  expect((await narrow.boundingBox())!.width).toBeLessThan(threshold);

  expect(await gridTracks(grid(wide))).toHaveLength(2);
  expect(await gridTracks(grid(narrow))).toHaveLength(1);
});

test("a split nested in a column stacks when the column runs out of room, not when the page does", async ({
  page,
}) => {
  const split = specimen(page, "light", "split");

  expect(await gridTracks(grid(split.getByTestId("split-outer")))).toHaveLength(2);
  expect(await gridTracks(grid(split.getByTestId("split-inner")))).toHaveLength(1);
});

test("a split relayouts while its width changes, not only when it is first painted", async ({
  page,
}) => {
  const split = specimen(page, "light", "split");
  const wide = split.getByTestId("split-wide");

  await wide.evaluate((node: HTMLElement) => node.style.setProperty("width", "20rem"));
  await expect.poll(async () => (await gridTracks(grid(wide))).length).toBe(1);

  await wide.evaluate((node: HTMLElement) => node.style.setProperty("width", "34rem"));
  await expect.poll(async () => (await gridTracks(grid(wide))).length).toBe(2);
});

test("a split told never to stack keeps two columns at a phone width", async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 780 });
  const split = specimen(page, "light", "split");

  expect(await gridTracks(grid(split.getByTestId("split-never")))).toHaveLength(2);

  // And narrowing a track that far still does not widen the page, which is
  // what `min-width: 0` on the columns is for.
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("the space between the columns is the token the ladder names", async ({ page }) => {
  const split = specimen(page, "light", "split");

  const tight = await computed(grid(split.getByTestId("split-tight")), "column-gap");
  expect(Number.parseFloat(tight)).toBeCloseTo(await resolvedLength(split, "var(--ui-space-3)"), 1);

  const wide = await computed(grid(split.getByTestId("split-wide")), "column-gap");
  expect(Number.parseFloat(wide)).toBeCloseTo(await resolvedLength(split, "var(--ui-space-5)"), 1);
});

test("the columns are one component token, so a consumer can redefine them without a class", async ({
  page,
}) => {
  const split = specimen(page, "light", "split");
  const wide = split.getByTestId("split-wide");

  await wide.evaluate((node: HTMLElement) =>
    node.style.setProperty("--ui-split-columns", "4fr 1fr"),
  );

  const tracks = await gridTracks(grid(wide));
  expect(tracks).toHaveLength(2);
  expect(tracks[0]! / tracks[1]!).toBeCloseTo(4, 1);
});

test("a split fills its parent even where it would otherwise shrink to fit", async ({ page }) => {
  const split = specimen(page, "light", "split");
  const collapsible = split.getByTestId("split-in-flex-start");

  const width = (await collapsible.boundingBox())!.width;
  const parentWidth = await collapsible.evaluate(
    (node: HTMLElement) => (node.parentElement as HTMLElement).clientWidth,
  );

  expect(width).toBeGreaterThan(0);
  expect(width).toBeCloseTo(parentWidth, 0);
});

test("a split can render as another element", async ({ page }) => {
  const split = specimen(page, "light", "split");
  const section = split.getByTestId("split-section");

  expect(await section.evaluate((node) => node.tagName)).toBe("SECTION");
  expect(await gridTracks(grid(section))).toHaveLength(2);
});

test("a split takes a consumer className and forwards unknown props to its root", async ({
  page,
}) => {
  const split = specimen(page, "light", "split").getByTestId("split-wide");

  await expect(split).toHaveClass(/pg-custom-split/);
  await expect(split).toHaveAttribute("data-analytics-id", "split-specimen");

  // The root is the outer element — the one that establishes containment.
  expect(await split.evaluate((node) => node.children.length)).toBe(1);
  expect(await computed(split, "container-type")).toBe("inline-size");
});
