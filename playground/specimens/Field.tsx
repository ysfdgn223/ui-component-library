import { Field, Input } from "../../src";

/** Field and Input in their notable states: plain, described, invalid, disabled. */
export function FieldSpecimen() {
  return (
    <div className="pg-stack" style={{ maxWidth: "22rem", width: "100%" }}>
      <Field label="Email">
        <Input placeholder="you@example.com" />
      </Field>

      <Field
        label="Work email"
        description="We only use this to sign you in."
        error="Enter an address that ends in a domain we recognise."
        invalid
      >
        <Input defaultValue="not-an-email" />
      </Field>

      <Field label="Locked" description="Managed by your administrator." disabled>
        <Input defaultValue="admin@example.com" />
      </Field>
    </div>
  );
}
