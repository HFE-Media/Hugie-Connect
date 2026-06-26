"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

import { submitMembershipApplicationAction } from "@/features/membership/actions";
import { getInitialMembershipApplicationState } from "@/features/membership/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MembershipType } from "@/types/membership";
import { cn } from "@/lib/utils";

type PublicMembershipApplicationFormProps = {
  organisationId: string;
  membershipTypes: MembershipType[];
};

function formatMembershipPrice(price: number | null) {
  if (price === null) {
    return "Price confirmed by organisation";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(price);
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="text-sm text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function PublicMembershipApplicationForm({
  organisationId,
  membershipTypes,
}: PublicMembershipApplicationFormProps) {
  const [state, formAction, pending] = useActionState(
    submitMembershipApplicationAction,
    getInitialMembershipApplicationState(),
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="organisationId" value={organisationId} />

      {state.message ? (
        <div
          className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Choose your membership</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Select the option that best matches how you want to participate.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {membershipTypes.map((membershipType, index) => (
            <label
              key={membershipType.id}
              className={cn(
                "group cursor-pointer rounded-2xl border bg-card p-4 shadow-sm transition hover:border-secondary/60 hover:shadow-soft",
                "has-[:checked]:border-secondary has-[:checked]:ring-2 has-[:checked]:ring-secondary/20",
              )}
            >
              <input
                className="sr-only"
                type="radio"
                name="membershipTypeId"
                value={membershipType.id}
                defaultChecked={index === 0}
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{membershipType.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMembershipPrice(membershipType.price)}
                  </p>
                </div>
                <CheckCircle2
                  className="h-5 w-5 text-muted-foreground transition group-has-[:checked]:text-secondary"
                  aria-hidden="true"
                />
              </div>
              {membershipType.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {membershipType.description}
                </p>
              ) : null}
            </label>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.membershipTypeId} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Your details</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These details help the organisation review and contact you about
            your application.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" />
            <FieldError errors={state.fieldErrors?.firstName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" />
            <FieldError errors={state.fieldErrors?.lastName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" />
            <FieldError errors={state.fieldErrors?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" name="mobile" type="tel" autoComplete="tel" />
            <FieldError errors={state.fieldErrors?.mobile} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-background p-4">
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            name="termsAccepted"
            className="mt-1 h-4 w-4 rounded border-input text-secondary focus:ring-secondary"
          />
          <span>
            I confirm that the information provided is accurate and may be used
            to process this membership application.
          </span>
        </label>
        <FieldError errors={state.fieldErrors?.termsAccepted} />
      </section>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting application..." : "Submit application"}
      </Button>
    </form>
  );
}
