import { Ticket } from "lucide-react";

import { MemberTicketsList } from "@/components/events/member-tickets-list";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

export default async function PortalTicketsPage() {
  const profile = await requirePermission("events:tickets:view");
  const service = createEventsAdminService();
  const data = await service.listTicketsForAuthenticatedUser(profile.id);

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="My Tickets"
        description="View your issued event tickets and entry details."
        icon={Ticket}
        breadcrumbs={[{ label: "Portal", href: "/portal" }, { label: "Tickets" }]}
      />

      <MemberTicketsList tickets={data.tickets} />
    </main>
  );
}
