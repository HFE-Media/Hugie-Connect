import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

import { TicketQrCode } from "@/components/events/ticket-qr-code";
import { Button } from "@/components/ui/button";
import type { SafeEventTicket } from "@/types/events";

type MemberTicketsListProps = {
  tickets: SafeEventTicket[];
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

function statusTone(status: SafeEventTicket["status"]) {
  if (status === "issued") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "used") return "border-blue-200 bg-blue-50 text-blue-700";

  return "border-muted bg-muted text-muted-foreground";
}

export function MemberTicketsList({ tickets }: MemberTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Ticket className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">No tickets yet</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Tickets linked to your account or verified account email will appear
          here after they are issued.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <Link href="/events">Browse events</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {tickets.map((ticket) => (
        <article
          key={ticket.id}
          className="grid gap-5 rounded-2xl border bg-card p-5 shadow-soft md:grid-cols-[1fr_220px]"
        >
          <div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {ticket.ticket_type?.name ?? "Ticket"}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {ticket.event?.title ?? "Event"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ticket {ticket.ticket_number} for {ticket.holder_name}
            </p>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {formatDate(ticket.event?.starts_at)}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {ticket.event?.venue ?? "Venue to be confirmed"}
              </p>
            </div>

            <Button asChild className="mt-5" variant="outline" size="sm">
              <Link href={`/portal/tickets/${ticket.id}`}>View ticket</Link>
            </Button>
          </div>

          <TicketQrCode
            value={ticket.qr_value}
            label={`Ticket ${ticket.ticket_number}`}
          />
        </article>
      ))}
    </section>
  );
}
