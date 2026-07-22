import type { ReactNode } from "react";

import { ProtectedShell } from "@/components/layout/protected-shell";
import { hasPermission } from "@/lib/auth/permissions";
import { requireProfile } from "@/services/auth/server";
import { createMembershipService } from "@/services/membership/service";
import { createSupabaseServerClient } from "@/services/supabase/server";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const profile = await requireProfile();
  const showAdmin = hasPermission(profile.roles, "admin:shell:view");
  const showScanner = hasPermission(profile.roles, "scanner:shell:view");
  const showEventAdmin = hasPermission(profile.roles, "events:manage");
  const showTickets = hasPermission(profile.roles, "events:tickets:view");
  const showApplications = hasPermission(profile.roles, "membership:applications:manage");
  const showMembers = hasPermission(profile.roles, "membership:members:manage");
  const showRenewals = hasPermission(profile.roles, "membership:renew");
  const showMembershipScanner = hasPermission(profile.roles, "membership:verify");
  const showTicketScanner = hasPermission(profile.roles, "events:tickets:scan");
  const membershipService = createMembershipService(
    await createSupabaseServerClient(),
  );
  const hasMembership = await membershipService
    .getOwnMembershipSummary(profile.id)
    .then(Boolean)
    .catch(() => false);

  return (
    <ProtectedShell
      user={{
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: profile.roles,
      }}
      access={{
        hasMembership,
        showAdmin,
        showApplications,
        showMembers,
        showRenewals,
        showEventAdmin,
        showTickets,
        showScanner,
        showMembershipScanner,
        showTicketScanner,
      }}
    >
      {children}
    </ProtectedShell>
  );
}
