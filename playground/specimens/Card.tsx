import { Button, Card } from "../../src";

/** Card in both surface roles, with and without padding. */
export function CardSpecimen() {
  return (
    <div className="pg-stack">
      <Card
        data-testid="card-raised"
        className="pg-custom-card"
        data-analytics-id="card-specimen"
        style={{ maxWidth: "22rem" }}
      >
        <strong>Raised surface</strong>
        <p style={{ margin: 0 }}>
          Content shows through the chrome. The blur, the tint and the scrim are all tokens.
        </p>
        <Button size="sm" variant="soft">
          Act on it
        </Button>
      </Card>

      <Card data-testid="card-overlay" surface="overlay" style={{ maxWidth: "22rem" }}>
        <strong>Overlay surface</strong>
        <p style={{ margin: 0 }}>Floats higher, so it carries more scrim.</p>
      </Card>

      <Card data-testid="card-flush" padding="none" style={{ maxWidth: "22rem" }}>
        <div style={{ padding: "var(--ui-space-4)" }}>Padding: none</div>
      </Card>
    </div>
  );
}
