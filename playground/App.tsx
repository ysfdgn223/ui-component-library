import * as React from "react";
import { UIProvider, type ColorScheme } from "../src";
import { specimens } from "./specimens";

const SCHEMES: ColorScheme[] = ["light", "dark"];

// A simulation of the degraded state, for eyes only: it turns the same two
// knobs the real @supports / @media blocks turn. Tests never use this — they
// drive the actual media features, because a test against a copy of an
// override block passes while the real rule is broken.
const DEGRADED: React.CSSProperties = {
  "--ui-surface-blur": "none",
  "--ui-surface-scrim-opacity": "1",
} as React.CSSProperties;

// The glass theme's base surface is a gradient, and an automated contrast
// check cannot resolve a colour behind a gradient — it reports "incomplete"
// rather than passing or failing. Overriding one token gives it a solid
// backdrop to work against, which is both the contrast harness and a
// demonstration of the escape hatch a Consumer has.
const SOLID_SURFACE: React.CSSProperties = {
  "--ui-surface-base": "var(--ui-color-bg)",
} as React.CSSProperties;

function initialFromQuery(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(key) === value;
}

/**
 * Every specimen, under both color schemes, on one page. The Playwright suite
 * drives this exact page, so the thing under review and the thing under test
 * cannot drift apart.
 */
export function App() {
  const [degraded, setDegraded] = React.useState(false);
  const [solidSurface, setSolidSurface] = React.useState(() =>
    initialFromQuery("surface", "solid"),
  );

  const style: React.CSSProperties = {
    ...(degraded ? DEGRADED : null),
    ...(solidSurface ? SOLID_SURFACE : null),
  };

  return (
    <>
      <div className="pg-toolbar">
        <strong>@ysfdgn223/ui — specimens</strong>
        <span>theme: glass</span>
        <label>
          <input
            type="checkbox"
            data-testid="degraded-toggle"
            checked={degraded}
            onChange={(event) => setDegraded(event.target.checked)}
          />
          Simulate degraded surfaces (opaque, no blur)
        </label>
        <label>
          <input
            type="checkbox"
            data-testid="solid-surface-toggle"
            checked={solidSurface}
            onChange={(event) => setSolidSurface(event.target.checked)}
          />
          Solid base surface (contrast checks)
        </label>
      </div>

      <div className="pg-layout">
        {SCHEMES.map((scheme) => (
          <UIProvider
            key={scheme}
            theme="glass"
            colorScheme={scheme}
            className="pg-region"
            data-scheme-region={scheme}
            style={style}
          >
            <h2 className="pg-region-title">{scheme}</h2>
            {specimens.map(({ id, title, Component }) => (
              <section key={id} className="pg-specimen" data-specimen={id}>
                <h3 className="pg-specimen-title">{title}</h3>
                <Component />
              </section>
            ))}
          </UIProvider>
        ))}
      </div>
    </>
  );
}
