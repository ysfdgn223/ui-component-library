import { Table } from "../../src";

const ROWS = [
  { sku: "AX-1042", name: "Anodised bracket", warehouse: "Rotterdam", count: 1284 },
  { sku: "AX-2210", name: "Hex driver, 4mm", warehouse: "Leeds", count: 96 },
  { sku: "BR-0071", name: "Sealing washer", warehouse: "Ostrava", count: 40320 },
];

/** The hard case: dense data, legible through glass. */
export function TableSpecimen() {
  return (
    <Table.Root
      caption="Inventory by warehouse"
      containerProps={{ "data-testid": "table-surface" }}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>SKU</Table.HeaderCell>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>Warehouse</Table.HeaderCell>
          <Table.HeaderCell align="end">On hand</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {ROWS.map((row) => (
          <Table.Row key={row.sku}>
            <Table.Cell>{row.sku}</Table.Cell>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.warehouse}</Table.Cell>
            <Table.Cell align="end" data-testid="table-numeric">
              {row.count.toLocaleString("en-GB")}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
