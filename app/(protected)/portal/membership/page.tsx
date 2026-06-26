import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  EmptyMembershipState,
  MemberMembershipSummaryCard,
} from "@/components/membership/member-membership-summary";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createMembershipService } from "@/services/membership/service";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyMembershipPage() {
  const profile = await requirePermission("membership:view_own");
  const membershipService = createMembershipService(
    await createSupabaseServerClient(),
  );
  const summary = await membershipService.getOwnMembershipSummary(profile.id);

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

      {summary ? (
        <MemberMembershipSummaryCard summary={summary} />
      ) : (
        <EmptyMembershipState />
      )}
    </main>
  );
}
