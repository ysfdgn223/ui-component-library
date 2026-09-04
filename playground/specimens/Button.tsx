import { Button } from "../../src";

function Dot() {
  return (
    <svg data-testid="button-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="5" fill="currentColor" />
    </svg>
  );
}

/** Every Button state worth looking at, in one render. */
export function ButtonSpecimen() {
  return (
    <div className="pg-stack">
      <div className="pg-row">
        <Button tone="accent">Solid accent</Button>
        <Button tone="neutral">Solid neutral</Button>
        <Button tone="danger">Solid danger</Button>
      </div>
      <div className="pg-row">
        <Button variant="soft">Soft accent</Button>
        <Button variant="outline">Outline accent</Button>
        <Button variant="ghost">Ghost accent</Button>
      </div>
      <div className="pg-row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="pg-row">
        <Button disabled>Disabled</Button>
        <Button render={<a href="#link-target" />}>Link button</Button>
        <Button className="pg-custom-class">Custom class</Button>
        <Button startIcon={<Dot />}>With icon</Button>
      </div>
    </div>
  );
}
