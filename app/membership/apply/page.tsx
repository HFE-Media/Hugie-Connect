import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Users } from "lucide-react";

import { PublicMembershipApplicationForm } from "@/components/membership/public-membership-application-form";
import { Button } from "@/components/ui/button";
import { createMembershipAdminService } from "@/services/membership/service";

export const dynamic = "force-dynamic";

export default async function MembershipApplicationPage() {
  const membershipService = createMembershipAdminService();
  const organisation = await membershipService.getDefaultPublicOrganisation();
  const membershipTypes = organisation
    ? (await membershipService.listMembershipTypes(organisation.id)).filter(
        (membershipType) => membershipType.status === "active",
      )
    : [];

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card">
        <div className="container py-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>

          <div className="grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                <ClipboardCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                Membership application
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
                Apply to join the community.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                Choose a membership type and submit your details. The
                organisation will review your application and contact you about
                next steps.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-5 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold">
                What happens next
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your application is saved as pending. Approval, payment
                confirmation, membership numbers, and digital cards are handled
                by the organisation in later workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
          {!organisation ? (
            <EmptyApplicationState
              title="Applications are not available yet"
              description="No active organisation has been configured for public membership applications."
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
      </section>
    </main>
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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Users className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
