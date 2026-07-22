import { Ticket } from "lucide-react";

import type { EventTicketType } from "@/types/events";

type PublicEventTicketTypesProps = {
  ticketTypes: EventTicketType[];
  capacity: number | null;
  available?: boolean;
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(value);
}

function salesLabel(ticketType: EventTicketType) {
  const now = new Date();

  if (ticketType.sales_start_at && now < new Date(ticketType.sales_start_at)) {
    return "Sales opening soon";
  }

  if (ticketType.sales_end_at && now > new Date(ticketType.sales_end_at)) {
    return "Sales closed";
  }

  return "Available";
}

export function PublicEventTicketTypes({
  ticketTypes,
  capacity,
  available = true,
}: PublicEventTicketTypesProps) {
  return (
    <aside className="rounded-lg border bg-card p-5 shadow-soft sm:p-6 lg:self-start">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Ticket className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Tickets</h2>

      {!available ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Ticket information could not be loaded right now. Please try again shortly.
        </p>
      ) : ticketTypes.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {capacity ? `${capacity} capacity. ` : ""}
          Ticket types will appear here once they are available.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {ticketTypes.map((ticketType) => (
            <div
              key={ticketType.id}
              className="rounded-xl border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{ticketType.name}</p>
                  {ticketType.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticketType.description}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold">
                  {money(ticketType.price, ticketType.currency)}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {salesLabel(ticketType)}
              </p>
            </div>
          ))}
        </div>
      )}

      {ticketTypes.length > 0 ? (
        <p className="mt-5 border-t pt-4 text-xs leading-5 text-muted-foreground">
          Tickets are issued securely through the event organising team.
        </p>
      ) : null}
    </aside>
  );
}
