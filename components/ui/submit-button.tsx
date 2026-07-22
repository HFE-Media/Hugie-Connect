"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  children: ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ children, pendingLabel, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} aria-disabled={disabled || pending} {...props}>
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </Button>
  );
}
