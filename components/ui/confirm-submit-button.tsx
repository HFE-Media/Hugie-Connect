"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmSubmitButtonProps = Omit<ButtonProps, "type"> & {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
};

export function ConfirmSubmitButton({
  children,
  title,
  description,
  confirmLabel,
  pendingLabel,
  disabled,
  variant = "destructive",
  ...props
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <Button type="button" disabled={disabled || pending} variant={variant} onClick={() => setOpen(true)} {...props}>
        {children}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2rem)] max-w-md rounded-lg border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/60"
        onCancel={(event) => {
          event.preventDefault();
          if (!pending) setOpen(false);
        }}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Keep current state
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              <span aria-live="polite">{pending ? pendingLabel : confirmLabel}</span>
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
