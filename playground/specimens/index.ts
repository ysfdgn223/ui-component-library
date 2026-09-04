import type { ComponentType } from "react";
import { ButtonSpecimen } from "./Button";
import { CardSpecimen } from "./Card";
import { DialogSpecimen } from "./Dialog";
import { FieldSpecimen } from "./Field";
import { SplitSpecimen } from "./Split";
import { StackSpecimen } from "./Stack";
import { TableSpecimen } from "./Table";
import { SPECIMEN_IDS, type SpecimenId } from "./ids";

export interface SpecimenEntry {
  /** Stable id — the hook the Playwright suite locates the specimen by. */
  id: SpecimenId;
  title: string;
  Component: ComponentType;
}

const BY_ID: Record<SpecimenId, Omit<SpecimenEntry, "id">> = {
  button: { title: "Button", Component: ButtonSpecimen },
  card: { title: "Card", Component: CardSpecimen },
  field: { title: "Field + Input", Component: FieldSpecimen },
  dialog: { title: "Dialog", Component: DialogSpecimen },
  table: { title: "Table", Component: TableSpecimen },
  split: { title: "Split", Component: SplitSpecimen },
  stack: { title: "Stack", Component: StackSpecimen },
};

/**
 * One specimen per component, shared by the playground page and the test
 * suite so the two can never disagree about what "the component" looks like.
 */
export const specimens: SpecimenEntry[] = SPECIMEN_IDS.map((id) => ({ id, ...BY_ID[id] }));
