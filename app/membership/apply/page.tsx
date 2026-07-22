import type { Metadata } from "next";
import { ClipboardCheck, LockKeyhole, Users } from "lucide-react";

import { PublicMembershipApplicationForm } from "@/components/membership/public-membership-application-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { PublicServiceState } from "@/components/public/public-service-state";
import { logger } from "@/lib/logger";
import { createMembershipAdminService } from "@/services/membership/service";
import type { MembershipOrganisation, MembershipType } from "@/types/membership";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply for membership",
  description:
    "Choose a membership option and submit a secure application through Hugie Connect.",
  openGraph: {
    title: "Apply for membership | Hugie Connect",
    description: "Join your community with a simple, secure online application.",
  },
};

export default async function MembershipApplicationPage() {
  const membershipService = createMembershipAdminService();
  let organisation: MembershipOrganisation | null = null;
  let membershipTypes: MembershipType[] = [];
  let loadFailed = false;

  try {
    organisation = await membershipService.getDefaultPublicOrganisation();
    membershipTypes = organisation
      ? (await membershipService.listMembershipTypes(organisation.id)).filter(
          (membershipType) => membershipType.status === "active",
        )
      : [];
  } catch (error) {
    loadFailed = true;
    logger.warn("Public membership application unavailable", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return (
    <PublicPageShell>
      <main>
        <section className="border-b bg-card">
          <div className="container grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Membership application
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">
                Join your community with confidence.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Choose the membership that suits you, share your contact details
                and submit your application securely for review.
              </p>
            </div>

            <div className="border-l-2 border-accent pl-5">
              <p className="text-sm font-semibold">What happens next</p>
              <ol className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                <li>1. Your organisation reviews the application.</li>
                <li>2. You receive an email when your account is ready.</li>
                <li>3. Your digital membership becomes available after approval.</li>
              </ol>
            </div>
          </div>
        </section>

        {loadFailed ? (
          <PublicServiceState
            title="Applications are temporarily unavailable"
            description="We could not load the membership options right now. Please try again shortly or contact us for help with your application."
          />
        ) : (
        <section className="container py-10 sm:py-12">
          <div className="mx-auto max-w-3xl rounded-lg border bg-card p-5 shadow-soft sm:p-7">
          {!organisation ? (
            <EmptyApplicationState
              title="Applications are not available yet"
              description="Online applications are currently closed. Please contact the organisation for membership assistance."
            />
          ) : membershipTypes.length === 0 ? (
            <EmptyApplicationState
              title="No membership types are available"
              description="Applications will open once the organisation has published active membership types."
            />
          ) : (
            <PublicMembershipApplicationForm
              organisationId={organisation.id}
              membershipTypes={membershipTypes}
            />
          )}
          </div>

          <div id="privacy" className="mx-auto mt-6 flex max-w-3xl items-start gap-3 border-t pt-5 text-sm text-muted-foreground">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
            <p id="privacy-note" className="leading-6">
              Your details are used only to review and administer your membership.
              Access is limited to authorised organisation administrators, and your
              information is not displayed publicly.
            </p>
          </div>
        </section>
        )}
      </main>
    </PublicPageShell>
  );
}

function EmptyApplicationState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Users className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
