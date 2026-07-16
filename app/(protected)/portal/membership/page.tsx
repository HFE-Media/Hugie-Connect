import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  EmptyMembershipState,
  MemberMembershipSummaryCard,
} from "@/components/membership/member-membership-summary";
import { Button } from "@/components/ui/button";
import { linkOwnMembershipAction } from "@/features/membership/actions";
import { requireProfile } from "@/services/auth/server";
import { createMembershipService } from "@/services/membership/service";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MyMembershipPageProps = {
  searchParams?: Promise<{
    link?: string;
    password?: string;
  }>;
};

const linkMessages = {
  linked: {
    tone: "success",
    message: "Your membership has been linked to this account.",
  },
  already_linked: {
    tone: "info",
    message: "Your membership is already linked to this account.",
  },
  no_match: {
    tone: "info",
    message:
      "No approved unlinked membership was found for this account email.",
  },
  multiple_matches: {
    tone: "warning",
    message:
      "More than one possible membership was found. Please contact the organisation to link it safely.",
  },
  error: {
    tone: "warning",
    message: "Your membership could not be linked. Please try again.",
  },
} as const;

function getLinkMessageClass(tone: (typeof linkMessages)[keyof typeof linkMessages]["tone"]) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-border bg-card text-muted-foreground";
}

export default async function MyMembershipPage({
  searchParams,
}: MyMembershipPageProps) {
  const profile = await requireProfile();
  const membershipService = createMembershipService(
    await createSupabaseServerClient(),
  );
  const summary = await membershipService.getOwnMembershipSummary(profile.id);
  const resolvedSearchParams = await searchParams;
  const linkStatus = resolvedSearchParams?.link;
  const passwordUpdated = resolvedSearchParams?.password === "updated";
  const linkMessage =
    linkStatus && linkStatus in linkMessages
      ? linkMessages[linkStatus as keyof typeof linkMessages]
      : null;
  const shouldShowLinkMessage =
    linkMessage &&
    (!summary || linkStatus === "linked" || linkStatus === "already_linked");

  return (
    <main className="container py-8">
      <div className="mb-5">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portal">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Portal
          </Link>
        </Button>
      </div>

      {shouldShowLinkMessage ? (
        <div
          className={cn(
            "mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm",
            getLinkMessageClass(linkMessage.tone),
          )}
          role="status"
        >
          {linkMessage.message}
        </div>
      ) : null}

      {passwordUpdated ? (
        <div
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm"
          role="status"
        >
          Your password has been updated. You can now access your membership.
        </div>
      ) : null}

      {summary ? (
        <MemberMembershipSummaryCard summary={summary} />
      ) : (
        <EmptyMembershipState linkAction={linkOwnMembershipAction} />
      )}
    </main>
  );
}
