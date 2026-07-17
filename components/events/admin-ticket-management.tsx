import {
  CircleDollarSign,
  ClipboardList,
  Ticket,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import {
  cancelTicketAdminAction,
  issueTicketsAdminAction,
  saveTicketTypeAdminAction,
  updateTicketTypeActiveAdminAction,
} from "@/features/events/ticket-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AdminEventTicket,
  EventTicketTypeWithAvailability,
} from "@/types/events";

type AdminTicketManagementProps = {
  eventId: string;
  ticketTypes: EventTicketTypeWithAvailability[];
  tickets: AdminEventTicket[];
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(value);
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

function availabilityLabel(ticketType: EventTicketTypeWithAvailability) {
  if (ticketType.quantity_available === null) {
    return "Unlimited";
  }

  return `${ticketType.remaining_quantity} of ${ticketType.quantity_available} left`;
}

export function AdminTicketManagement({
  eventId,
  ticketTypes,
  tickets,
}: AdminTicketManagementProps) {
  const activeTicketTypes = ticketTypes.filter((ticketType) => ticketType.active);

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Ticket types</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure pricing, availability and sales windows for this event.
            </p>
          </div>
        </div>

        <form
          action={saveTicketTypeAdminAction}
          className="mt-5 grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-2"
        >
          <input type="hidden" name="eventId" value={eventId} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ticket-name">Name</Label>
            <Input id="ticket-name" name="name" placeholder="Adult" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-price">Price</Label>
            <Input
              id="ticket-price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-currency">Currency</Label>
            <Input
              id="ticket-currency"
              name="currency"
              defaultValue="ZAR"
              maxLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-quantity">Quantity available</Label>
            <Input
              id="ticket-quantity"
              name="quantityAvailable"
              type="number"
              min={1}
              step={1}
              placeholder="Unlimited"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-sort">Sort order</Label>
            <Input
              id="ticket-sort"
              name="sortOrder"
              type="number"
              step={1}
              defaultValue={ticketTypes.length + 1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-sales-start">Sales start</Label>
            <Input id="ticket-sales-start" name="salesStartAt" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-sales-end">Sales end</Label>
            <Input id="ticket-sales-end" name="salesEndAt" type="datetime-local" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Input
              id="ticket-description"
              name="description"
              maxLength={500}
              placeholder="Optional short description"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Add ticket type</Button>
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {ticketTypes.length === 0 ? (
            <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
              No ticket types have been configured yet.
            </div>
          ) : (
            ticketTypes.map((ticketType) => (
              <div
                key={ticketType.id}
                className="rounded-xl border bg-background p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{ticketType.name}</p>
                      <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                        {money(ticketType.price, ticketType.currency)}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                        {ticketType.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {ticketType.description ?? "No description"} ·{" "}
                      {availabilityLabel(ticketType)}
                    </p>
                  </div>
                  <form action={updateTicketTypeActiveAdminAction}>
                    <input type="hidden" name="eventId" value={eventId} />
                    <input
                      type="hidden"
                      name="ticketTypeId"
                      value={ticketType.id}
                    />
                    <input
                      type="hidden"
                      name="active"
                      value={ticketType.active ? "false" : "true"}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {ticketType.active ? (
                        <ToggleLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ToggleRight className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      {ticketType.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Edit ticket type
                  </summary>
                  <form
                    action={saveTicketTypeAdminAction}
                    className="mt-4 grid gap-3 md:grid-cols-2"
                  >
                    <input type="hidden" name="eventId" value={eventId} />
                    <input
                      type="hidden"
                      name="ticketTypeId"
                      value={ticketType.id}
                    />
                    <Input name="name" defaultValue={ticketType.name} required />
                    <Input
                      name="price"
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={ticketType.price}
                      required
                    />
                    <Input
                      name="currency"
                      defaultValue={ticketType.currency}
                      maxLength={3}
                      required
                    />
                    <Input
                      name="quantityAvailable"
                      type="number"
                      min={1}
                      step={1}
                      defaultValue={ticketType.quantity_available ?? ""}
                      placeholder="Unlimited"
                    />
                    <Input
                      name="salesStartAt"
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(ticketType.sales_start_at)}
                    />
                    <Input
                      name="salesEndAt"
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(ticketType.sales_end_at)}
                    />
                    <Input
                      name="sortOrder"
                      type="number"
                      step={1}
                      defaultValue={ticketType.sort_order}
                    />
                    <Input
                      name="description"
                      defaultValue={ticketType.description ?? ""}
                      maxLength={500}
                    />
                    <div className="md:col-span-2">
                      <Button type="submit" variant="outline">
                        Save ticket type
                      </Button>
                    </div>
                  </form>
                </details>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Issue tickets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Issue manual tickets without sending emails or taking payments.
            </p>
          </div>
        </div>

        <form
          action={issueTicketsAdminAction}
          className="mt-5 grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-2"
        >
          <input type="hidden" name="eventId" value={eventId} />
          <div className="space-y-2">
            <Label htmlFor="issue-ticket-type">Ticket type</Label>
            <select
              id="issue-ticket-type"
              name="ticketTypeId"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
              required
            >
              <option value="">Choose ticket type</option>
              {activeTicketTypes.map((ticketType) => (
                <option key={ticketType.id} value={ticketType.id}>
                  {ticketType.name} · {money(ticketType.price, ticketType.currency)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-quantity">Quantity</Label>
            <Input
              id="issue-quantity"
              name="quantity"
              type="number"
              min={1}
              max={50}
              step={1}
              defaultValue={1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holder-name">Holder name</Label>
            <Input id="holder-name" name="holderName" required maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holder-email">Holder email</Label>
            <Input id="holder-email" name="holderEmail" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linked-user-email">Linked user email</Label>
            <Input id="linked-user-email" name="linkedUserEmail" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internal-note">Internal note</Label>
            <Input id="internal-note" name="internalNote" maxLength={500} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={activeTicketTypes.length === 0}>
              Issue tickets
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Issued tickets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              QR tokens are intentionally hidden from this admin view.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border">
          {tickets.length === 0 ? (
            <div className="bg-background p-4 text-sm text-muted-foreground">
              No tickets have been issued for this event.
            </div>
          ) : (
            <div className="divide-y">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="grid gap-2 bg-background p-4 text-sm md:grid-cols-[1fr_160px_120px_auto]"
                >
                  <div>
                    <p className="font-medium">{ticket.holder_name}</p>
                    <p className="text-muted-foreground">
                      {ticket.holder_email ?? "No email"} ·{" "}
                      {ticket.ticket_type?.name ?? "Ticket"}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{ticket.ticket_number}</p>
                  <p className="capitalize text-muted-foreground">
                    {ticket.status}
                  </p>
                  {ticket.status === "issued" ? (
                    <form action={cancelTicketAdminAction}>
                      <input type="hidden" name="eventId" value={eventId} />
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
