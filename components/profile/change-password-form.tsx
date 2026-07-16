"use client";

import { useActionState } from "react";

import {
  changeOwnPasswordAction,
} from "@/features/profile/actions";
import { getInitialProfileActionState } from "@/features/profile/state";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changeOwnPasswordAction,
    getInitialProfileActionState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </div>

      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Changing password..." : "Change password"}
      </Button>
    </form>
  );
}
