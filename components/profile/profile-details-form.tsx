"use client";

import { useActionState } from "react";

import {
  updateOwnProfileAction,
} from "@/features/profile/actions";
import { getInitialProfileActionState } from "@/features/profile/state";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileDetailsFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
};

export function ProfileDetailsForm({
  firstName,
  lastName,
  email,
  mobile,
}: ProfileDetailsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateOwnProfileAction,
    getInitialProfileActionState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={firstName}
            autoComplete="given-name"
            maxLength={80}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={lastName}
            autoComplete="family-name"
            maxLength={80}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" value={email} readOnly disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile number</Label>
        <Input
          id="mobile"
          name="mobile"
          type="tel"
          defaultValue={mobile}
          autoComplete="tel"
          maxLength={32}
          pattern="\\+?[0-9][0-9\\s().-]{6,24}"
          placeholder="+27 82 000 0000"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
