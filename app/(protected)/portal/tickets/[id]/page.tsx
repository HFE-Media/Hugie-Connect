import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

import { TicketQrCode } from "@/components/events/ticket-qr-code";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

type PortalTicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: string | null) {
  if (!value) return "Date to be confirmed";

  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PortalTicketDetailPage({
  params,
}: PortalTicketDetailPageProps) {
  const { id } = await params;
  const profile = await requirePermission("events:tickets:view");
  const service = createEventsAdminService();
  const ticket = await service.getTicketForAuthenticatedUser({
    authUserId: profile.id,
    ticketId: id,
  });

  if (!ticket) {
    notFound();
  }

  return (
    <main className="container py-8">
      <div className="mb-5">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portal/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            My Tickets
          </Link>
        </Button>
      </div>

      <article className="grid gap-6 rounded-2xl border bg-card p-5 shadow-soft md:grid-cols-[1fr_260px]">
        <section>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
              {ticket.status}
            </span>
            <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {ticket.ticket_type?.name ?? "Ticket"}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            {ticket.event?.title ?? "Event ticket"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ticket {ticket.ticket_number} for {ticket.holder_name}
          </p>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(ticket.event?.starts_at)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {ticket.event?.venue ?? "Venue to be confirmed"}
            </p>
          </div>
        </section>

        <TicketQrCode
          value={ticket.qr_value}
          label={`Ticket ${ticket.ticket_number}`}
        />
      </article>
    </main>
  );
}
