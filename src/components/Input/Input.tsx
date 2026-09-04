"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "../../lib/cn";
import styles from "./Input.module.css";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

/**
 * A text control. Dropped inside a `Field`, it picks up that field's label,
 * description, error and disabled state without being told about any of them.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return <BaseInput ref={ref} className={cn(styles.root, className)} {...rest} />;
});
