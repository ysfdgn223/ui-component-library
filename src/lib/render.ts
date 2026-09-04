import type * as React from "react";

/**
 * Composition hatch: pass an element to render as instead of the default tag.
 *
 * Declared here in the library's own terms rather than re-exported from the
 * primitives package — no primitive type may appear in the public .d.ts, so
 * that swapping the primitives out stays contained to component internals.
 */
export type RenderProp =
  | React.ReactElement
  | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement);

/**
 * Hand a `RenderProp` to the primitive underneath.
 *
 * The cast is the price of the insulation rule: the public type is ours, the
 * primitive's is structurally compatible but not nominally, and this is the
 * one place that knows both. Widening the public type to the primitive's would
 * leak it into the generated .d.ts, which is the thing ADR-0001 forbids.
 */
export function toPrimitiveRender(render: RenderProp | undefined): never | undefined {
  return render as never | undefined;
}
