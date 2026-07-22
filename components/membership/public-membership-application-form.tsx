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

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-destructive" role="alert">
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

      <section className="space-y-4" aria-labelledby="membership-step-title">
        <div>
          <p className="text-xs font-semibold uppercase text-secondary">Step 1 of 2</p>
          <h2 id="membership-step-title" className="mt-1 text-xl font-semibold">Choose your membership</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Select the option that best matches how you want to participate.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {membershipTypes.map((membershipType, index) => (
            <label
              key={membershipType.id}
              className={cn(
                "group cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition hover:border-secondary/60 hover:shadow-soft",
                "has-[:checked]:border-secondary has-[:checked]:ring-2 has-[:checked]:ring-secondary/20",
              )}
            >
              <input
                className="sr-only"
                type="radio"
                name="membershipTypeId"
                value={membershipType.id}
                defaultChecked={index === 0}
                aria-describedby="membership-type-error"
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
        <FieldError id="membership-type-error" errors={state.fieldErrors?.membershipTypeId} />
      </section>

      <section className="space-y-4" aria-labelledby="details-step-title">
        <div>
          <p className="text-xs font-semibold uppercase text-secondary">Step 2 of 2</p>
          <h2 id="details-step-title" className="mt-1 text-xl font-semibold">Your details</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These details help the organisation review and contact you about
            your application.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" required aria-invalid={Boolean(state.fieldErrors?.firstName)} aria-describedby="first-name-error" />
            <FieldError id="first-name-error" errors={state.fieldErrors?.firstName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" required aria-invalid={Boolean(state.fieldErrors?.lastName)} aria-describedby="last-name-error" />
            <FieldError id="last-name-error" errors={state.fieldErrors?.lastName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email)} aria-describedby="email-error" />
            <FieldError id="email-error" errors={state.fieldErrors?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" name="mobile" type="tel" autoComplete="tel" />
            <FieldError id="mobile-error" errors={state.fieldErrors?.mobile} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-4" aria-labelledby="consent-title">
        <div>
          <h2 id="consent-title" className="text-sm font-semibold">Privacy and consent</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Review how your information is used before submitting.
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            name="termsAccepted"
            className="mt-1 h-4 w-4 rounded border-input text-secondary focus:ring-secondary"
            aria-describedby="terms-error privacy-note"
          />
          <span>
            I confirm that the information provided is accurate and consent to
            its use for reviewing and administering my membership application.
            <a href="#privacy" className="ml-1 font-medium text-secondary hover:underline">
              Read the privacy note.
            </a>
          </span>
        </label>
        <FieldError id="terms-error" errors={state.fieldErrors?.termsAccepted} />
      </section>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting application..." : "Submit application"}
      </Button>
    </form>
  );
}
