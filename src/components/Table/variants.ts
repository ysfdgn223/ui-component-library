import { type ClassMap } from "../../lib/cn";
import styles from "./Table.module.css";

/** Horizontal alignment of a cell's content. */
export type TableAlign = "start" | "center" | "end";

export const ALIGN_CLASS: ClassMap<TableAlign> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};
