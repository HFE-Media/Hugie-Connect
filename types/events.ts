import type { Database } from "@/types/database";

export type EventCategory =
  Database["public"]["Tables"]["event_categories"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventTicketType =
  Database["public"]["Tables"]["event_ticket_types"]["Row"];
export type EventTicket =
  Database["public"]["Tables"]["event_tickets"]["Row"];

export type EventStatus = Event["status"];
export type EventVisibility = Event["visibility"];
export type EventTicketStatus = EventTicket["status"];

export type EventWithCategory = Event & {
  category: EventCategory | null;
};

export type EventTicketTypeWithAvailability = EventTicketType & {
  issued_count: number;
  remaining_quantity: number | null;
};

export type SafeEventTicket = Omit<EventTicket, "qr_token"> & {
  qr_value: string | null;
  event: Event | null;
  ticket_type: EventTicketType | null;
};

export type AdminEventTicket = Omit<EventTicket, "qr_token"> & {
  ticket_type: EventTicketType | null;
};

export type EventsAdminPage = {
  events: EventWithCategory[];
  categories: EventCategory[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PublicEventsPage = {
  events: EventWithCategory[];
  categories: EventCategory[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PortalTicketsPage = {
  tickets: SafeEventTicket[];
};
