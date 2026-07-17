import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MemberTicketsList } from "@/components/events/member-tickets-list";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

export default async function PortalTicketsPage() {
  const profile = await requirePermission("events:tickets:view");
  const service = createEventsAdminService();
  const data = await service.listTicketsForAuthenticatedUser(profile.id);

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

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Tickets</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tickets linked to your Hugie Connect account.
        </p>
      </div>

      <MemberTicketsList tickets={data.tickets} />
    </main>
  );
}
