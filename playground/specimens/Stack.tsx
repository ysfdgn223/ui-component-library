import { Button, Card, Stack } from "../../src";

/** Stack at every gap and alignment, and rendered as a list. */
export function StackSpecimen() {
  return (
    <div className="pg-column">
      <Stack
        data-testid="stack-stretch"
        className="pg-custom-stack"
        data-analytics-id="stack-specimen"
        gap="sm"
      >
        <Card padding="sm">Stretched to the column</Card>
        <Card padding="sm">So is this</Card>
      </Stack>

      {/* The stack of buttons — the case Card's block flow was protecting. */}
      <Stack data-testid="stack-start" align="start" gap="sm">
        <Button size="sm" variant="soft">
          Short
        </Button>
        <Button size="sm" variant="soft">
          A considerably longer label
        </Button>
      </Stack>

      <Stack data-testid="stack-flush" gap="none">
        <Card padding="sm">No gap</Card>
        <Card padding="sm">No gap</Card>
      </Stack>

      <Stack data-testid="stack-list" render={<ul />} gap="sm">
        <li>Rendered as a list</li>
        <li>Still a stack</li>
      </Stack>
    </div>
  );
}
