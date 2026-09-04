import { Card, Split } from "../../src";

/**
 * Split at several ratios and gaps, above and below its stacking threshold,
 * nested inside itself, and inside a parent that would collapse it.
 */
export function SplitSpecimen() {
  return (
    <div className="pg-column">
      <Split
        data-testid="split-wide"
        className="pg-custom-split"
        data-analytics-id="split-specimen"
      >
        <Card padding="sm">Left</Card>
        <Card padding="sm">Right</Card>
      </Split>

      <Split data-testid="split-weighted" ratio="1:2">
        <Card padding="sm">One share</Card>
        <Card padding="sm">Two shares</Card>
      </Split>

      {/* Narrower than stackAt="md" while the page around it is not. */}
      <Split data-testid="split-narrow" style={{ maxWidth: "22rem" }}>
        <Card padding="sm">Left</Card>
        <Card padding="sm">Right</Card>
      </Split>

      <Split data-testid="split-never" ratio="3:1" stackAt="never">
        <Card padding="sm">Never stacks</Card>
        <Card padding="sm">Nor this</Card>
      </Split>

      <Split data-testid="split-tight" gap="sm">
        <Card padding="sm">Tight gap</Card>
        <Card padding="sm">Tight gap</Card>
      </Split>

      {/* The nesting case: the inner Split runs out of room inside its column
          long before the page does. */}
      <Split data-testid="split-outer">
        <Split data-testid="split-inner">
          <Card padding="sm">Inner left</Card>
          <Card padding="sm">Inner right</Card>
        </Split>
        <Card padding="sm">Outer right</Card>
      </Split>

      <Split data-testid="split-section" render={<section />}>
        <Card padding="sm">Rendered as a section</Card>
        <Card padding="sm">Still a split</Card>
      </Split>

      {/* A Split inside a flex-start column — the one arrangement where size
          containment would collapse it to zero width. */}
      <div className="pg-stack">
        <Split data-testid="split-in-flex-start">
          <Card padding="sm">Left</Card>
          <Card padding="sm">Right</Card>
        </Split>
      </div>
    </div>
  );
}
