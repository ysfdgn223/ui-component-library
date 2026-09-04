import { Button, Dialog } from "../../src";

/** A modal in its open state, reached the way a user reaches it. */
export function DialogSpecimen() {
  return (
    <div className="pg-row">
      <Dialog.Root>
        <Dialog.Trigger render={<Button tone="danger">Open dialog</Button>} />
        <Dialog.Content backdropProps={{ "data-testid": "dialog-backdrop" }}>
          <Dialog.Title>Delete this item?</Dialog.Title>
          <Dialog.Description>
            The item leaves the inventory immediately. This cannot be undone.
          </Dialog.Description>
          <div className="pg-row" style={{ justifyContent: "flex-end" }}>
            <Dialog.Close render={<Button variant="ghost" tone="neutral">Cancel</Button>} />
            <Dialog.Close render={<Button tone="danger">Delete</Button>} />
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
