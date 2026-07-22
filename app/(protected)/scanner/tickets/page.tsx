import { TicketCheck } from "lucide-react";

import { EventTicketScanner } from "@/components/events/event-ticket-scanner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

export default async function EventTicketScannerPage() {
  const profile = await requirePermission("events:tickets:scan");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const events = await service.listEventsForTicketScanner(appUser.organisation_id);

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Ticket Scanner"
        description="Scan and validate event tickets for the selected event."
        icon={TicketCheck}
        breadcrumbs={[{ label: "Scanner", href: "/scanner" }, { label: "Ticket Scanner" }]}
      />

      <EventTicketScanner events={events} />
    </main>
  );
}
