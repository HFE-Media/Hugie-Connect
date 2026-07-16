import type { Database } from "@/types/database";

export type EventCategory =
  Database["public"]["Tables"]["event_categories"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];

export type EventStatus = Event["status"];
export type EventVisibility = Event["visibility"];

export type EventWithCategory = Event & {
  category: EventCategory | null;
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
