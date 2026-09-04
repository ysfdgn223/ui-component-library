"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../../lib/cn";
import styles from "./Field.module.css";

export interface FieldProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The control's accessible name. */
  label: React.ReactNode;
  /** Helper text, announced with the control. */
  description?: React.ReactNode;
  /** Error text. Shown, and announced with the control, while `invalid`. */
  error?: React.ReactNode;
  /** Marks the field invalid. Reaches the control as `aria-invalid`. */
  invalid?: boolean;
  /** Disables the field and, with it, its control. */
  disabled?: boolean;
  /** Submitted name for the control. */
  name?: string;
  /** The control — typically an `Input`. */
  children?: React.ReactNode;
}

/**
 * Wires a label, a description and an error message to one control, so the
 * accessible version of a form field is the one you get by default.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, invalid = false, disabled = false, name, className, children, ...rest },
  ref,
) {
  const showError = invalid && error !== undefined && error !== null;

  return (
    <BaseField.Root
      ref={ref}
      className={cn(styles.root, className)}
      invalid={invalid}
      disabled={disabled}
      {...(name === undefined ? {} : { name })}
      {...rest}
    >
      <BaseField.Label className={styles.label}>{label}</BaseField.Label>
      {children}
      {description === undefined ? null : (
        <BaseField.Description className={styles.description}>{description}</BaseField.Description>
      )}
      {showError ? (
        <BaseField.Error className={styles.error} match>
          {error}
        </BaseField.Error>
      ) : null}
    </BaseField.Root>
  );
});
