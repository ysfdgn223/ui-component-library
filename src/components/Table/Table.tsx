"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import type { DataAttributes } from "../../lib/dataAttributes";
import { ALIGN_CLASS, type TableAlign } from "./variants";
import styles from "./Table.module.css";

export interface TableRootProps extends React.ComponentPropsWithoutRef<"table"> {
  /** The table's accessible name, rendered as a `<caption>`. */
  caption?: React.ReactNode;
  /**
   * Props for the scroll container the table sits in. The container is the
   * surface — it carries the background, border and elevation — so styling or
   * targeting the surface goes through here.
   */
  containerProps?: React.ComponentPropsWithoutRef<"div"> & DataAttributes;
}

/** `align` is ours: the legacy HTML attribute of that name is replaced. */
export interface TableCellProps extends Omit<React.ComponentPropsWithoutRef<"td">, "align"> {
  /** @default "start" */
  align?: TableAlign;
}

export interface TableHeaderCellProps extends Omit<React.ComponentPropsWithoutRef<"th">, "align"> {
  /** @default "start" */
  align?: TableAlign;
}

export type TableSectionProps = React.ComponentPropsWithoutRef<"thead">;
export type TableRowProps = React.ComponentPropsWithoutRef<"tr">;

/**
 * The table itself, inside a scroll container so a wide table stays on the
 * page at a narrow viewport instead of stretching it. The container is
 * keyboard-focusable, because a region that scrolls has to be scrollable
 * without a pointer. Everything a consumer passes goes to the `<table>`; the
 * container has its own escape hatch.
 */
const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  { caption, className, children, containerProps, ...rest },
  ref,
) {
  const { className: containerClassName, ...containerRest } = containerProps ?? {};

  return (
    // tabIndex makes the scroll container reachable from the keyboard. A
    // region that scrolls but cannot be scrolled without a pointer is one of
    // the ways a responsive table locks people out.
    <div tabIndex={0} className={cn(styles.container, containerClassName)} {...containerRest}>
      <table ref={ref} className={cn(styles.root, className)} {...rest}>
        {caption === undefined ? null : <caption className={styles.caption}>{caption}</caption>}
        {children}
      </table>
    </div>
  );
});

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableHeader(props, ref) {
    return <thead ref={ref} {...props} />;
  },
);

const TableBody = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableBody(props, ref) {
    return <tbody ref={ref} {...props} />;
  },
);

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr ref={ref} className={cn(styles.row, className)} {...rest} />;
});

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ align = "start", className, ...rest }, ref) {
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(styles.headerCell, ALIGN_CLASS[align], className)}
        {...rest}
      />
    );
  },
);

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = "start", className, ...rest },
  ref,
) {
  return <td ref={ref} className={cn(styles.cell, ALIGN_CLASS[align], className)} {...rest} />;
});

/**
 * A presentational table. No sorting, selection, pagination, resizing or
 * virtualization — those are state management, not styling, and belong to a
 * headless table library in the consumer's app, wired to these parts.
 *
 * `Header` and `Body` exist alongside `Row` and `Cell` because a semantic
 * `<table>` needs `<thead>`/`<tbody>`, and `HeaderCell` is separate from
 * `Cell` because a cell cannot know which section it is in without context.
 */
export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
};
