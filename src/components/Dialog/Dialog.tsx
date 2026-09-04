"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { COLOR_SCHEME_ATTRIBUTE, PROVIDER_SELECTOR, THEME_ATTRIBUTE } from "../../lib/axes";
import { cn } from "../../lib/cn";
import type { DataAttributes } from "../../lib/dataAttributes";
import { toPrimitiveRender, type RenderProp } from "../../lib/render";
import styles from "./Dialog.module.css";

export interface DialogRootProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export type DialogTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  /** Render as a different element — a `Button`, a menu item, anything. */
  render?: RenderProp;
};

export type DialogCloseProps = DialogTriggerProps;

export type DialogContentProps = React.ComponentPropsWithoutRef<"div"> &
  DataAttributes & {
    /** Props for the backdrop behind the dialog. */
    backdropProps?: React.ComponentPropsWithoutRef<"div"> & DataAttributes;
    /**
     * Where to portal to. Defaults to `<body>`, with the theme attributes
     * copied onto the portal element — see the note on `Content` below.
     */
    container?: HTMLElement | null;
  };

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & DataAttributes;
export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & DataAttributes;

/** The two axis attributes, copied onto the portal element. */
type ThemeAxes = Partial<Record<typeof THEME_ATTRIBUTE | typeof COLOR_SCHEME_ATTRIBUTE, string>>;

const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? React.useEffect : React.useLayoutEffect;

function DialogRoot({ children, ...rest }: DialogRootProps) {
  return <BaseDialog.Root {...rest}>{children}</BaseDialog.Root>;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(
  { render, ...rest },
  ref,
) {
  return <BaseDialog.Trigger ref={ref} render={toPrimitiveRender(render)} {...rest} />;
});

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { render, ...rest },
  ref,
) {
  return <BaseDialog.Close ref={ref} render={toPrimitiveRender(render)} {...rest} />;
});

/**
 * Backdrop and popup, portalled together.
 *
 * Portalling to `<body>` takes the dialog out of the token cascade, so the
 * portal element carries a copy of the two axis attributes read off the
 * nearest themed ancestor — a DOM query, not React context, so the provider
 * stays a plain element with two attributes. An attribute observer keeps the
 * copy current if the consumer switches theme while a dialog is open.
 *
 * Portalling into the provider itself was tried first and rejected: the
 * primitive's focus trap only holds when the portal is a child of `<body>`,
 * and a modal that leaks focus is worse than one that has to copy two
 * attributes.
 *
 * Known limit: token overrides a consumer writes on their own provider (an
 * inline style, or a class on that element) are not copied, because only the
 * two axis attributes are. Pass `container` to portal somewhere those
 * overrides still apply.
 */
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { className, children, backdropProps, container, ...rest },
  ref,
) {
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const [axes, setAxes] = React.useState<ThemeAxes>({});

  useIsomorphicLayoutEffect(() => {
    const provider = anchorRef.current?.closest<HTMLElement>(PROVIDER_SELECTOR);
    if (provider === null || provider === undefined) return;

    const read = () =>
      setAxes({
        [THEME_ATTRIBUTE]: provider.getAttribute(THEME_ATTRIBUTE) ?? undefined,
        [COLOR_SCHEME_ATTRIBUTE]: provider.getAttribute(COLOR_SCHEME_ATTRIBUTE) ?? undefined,
      });

    read();
    const observer = new MutationObserver(read);
    observer.observe(provider, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE, COLOR_SCHEME_ATTRIBUTE],
    });
    return () => observer.disconnect();
  }, []);

  const { className: backdropClassName, ...backdropRest } = backdropProps ?? {};

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      <BaseDialog.Portal {...axes} {...(container === undefined || container === null ? {} : { container })}>
        <BaseDialog.Backdrop className={cn(styles.backdrop, backdropClassName)} {...backdropRest} />
        <BaseDialog.Popup ref={ref} className={cn(styles.popup, className)} {...rest}>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </>
  );
});

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { className, ...rest },
  ref,
) {
  return <BaseDialog.Title ref={ref} className={cn(styles.title, className)} {...rest} />;
});

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...rest }, ref) {
    return <BaseDialog.Description ref={ref} className={cn(styles.description, className)} {...rest} />;
  },
);

/**
 * A modal dialog: portalled, focus-trapped, closed on Escape, animated
 * entirely in CSS from the state attributes on the popup.
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
};
