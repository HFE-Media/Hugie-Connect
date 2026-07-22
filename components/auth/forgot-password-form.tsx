"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction } from "@/features/auth/actions";
import { getInitialAuthActionState } from "@/features/auth/state";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    getInitialAuthActionState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <SubmitButton size="lg" className="w-full" pendingLabel="Sending reset link...">Send reset link</SubmitButton>

      <p className="text-center text-sm">
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-secondary hover:underline">
          Return to login
        </Link>
      </p>
    </form>
  );
}
