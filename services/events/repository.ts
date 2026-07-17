import type { SupabaseClient } from "@supabase/supabase-js";

import type { EventStatus } from "@/types/events";
import type { Database, Json } from "@/types/database";

export type EventsRepositoryClient = SupabaseClient<Database>;

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
type EventTicketTypeInsert =
  Database["public"]["Tables"]["event_ticket_types"]["Insert"];
type EventTicketTypeUpdate =
  Database["public"]["Tables"]["event_ticket_types"]["Update"];
type EventTicketInsert =
  Database["public"]["Tables"]["event_tickets"]["Insert"];
type EventTicketUpdate =
  Database["public"]["Tables"]["event_tickets"]["Update"];

export function createEventsRepository(client: EventsRepositoryClient) {
  return {
    async listCategories(params?: { organisationId?: string }) {
      let query = client
        .from("event_categories")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (params?.organisationId) {
        query = query.eq("organisation_id", params.organisationId);
      }

      return query;
    },

    async getCategoryById(params: { organisationId: string; categoryId: string }) {
      return client
        .from("event_categories")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("id", params.categoryId)
        .maybeSingle();
    },

    async getEventById(params: { organisationId: string; eventId: string }) {
      return client
        .from("events")
        .select("*, category:event_categories!events_category_organisation_fk(*)")
        .eq("organisation_id", params.organisationId)
        .eq("id", params.eventId)
        .maybeSingle();
    },

    async getEventBySlug(slug: string) {
      return client
        .from("events")
        .select("*, category:event_categories!events_category_organisation_fk(*)")
        .eq("slug", slug)
        .maybeSingle();
    },

    async slugExists(params: {
      organisationId: string;
      slug: string;
      excludeEventId?: string;
    }) {
      let query = client
        .from("events")
        .select("id")
        .eq("organisation_id", params.organisationId)
        .eq("slug", params.slug)
        .limit(1);

      if (params.excludeEventId) {
        query = query.neq("id", params.excludeEventId);
      }

      return query.maybeSingle();
    },

    async listAdminEvents(params: {
      organisationId: string;
      search?: string;
      status?: EventStatus;
      categoryId?: string;
      endsFrom?: string;
      endsBefore?: string;
      rangeFrom: number;
      rangeTo: number;
    }) {
      let query = client
        .from("events")
        .select("*, category:event_categories!events_category_organisation_fk(*)", {
          count: "exact",
        })
        .eq("organisation_id", params.organisationId)
        .order("starts_at", { ascending: true })
        .range(params.rangeFrom, params.rangeTo);

      if (params.search) {
        query = query.ilike("title", `%${params.search}%`);
      }

      if (params.status) {
        query = query.eq("status", params.status);
      }

      if (params.categoryId) {
        query = query.eq("category_id", params.categoryId);
      }

      if (params.endsFrom) {
        query = query.gte("ends_at", params.endsFrom);
      }

      if (params.endsBefore) {
        query = query.lt("ends_at", params.endsBefore);
      }

      return query;
    },

    async listPublicEvents(params: {
      search?: string;
      categoryId?: string;
      endsFrom: string;
      rangeFrom: number;
      rangeTo: number;
    }) {
      let query = client
        .from("events")
        .select("*, category:event_categories!events_category_organisation_fk(*)", {
          count: "exact",
        })
        .eq("status", "published")
        .gte("ends_at", params.endsFrom)
        .order("starts_at", { ascending: true })
        .range(params.rangeFrom, params.rangeTo);

      if (params.search) {
        query = query.ilike("title", `%${params.search}%`);
      }

      if (params.categoryId) {
        query = query.eq("category_id", params.categoryId);
      }

      return query;
    },

    async createEvent(input: EventInsert) {
      return client.from("events").insert(input).select("*").single();
    },

    async updateEvent(params: {
      organisationId: string;
      eventId: string;
      values: EventUpdate;
    }) {
      return client
        .from("events")
        .update(params.values)
        .eq("organisation_id", params.organisationId)
        .eq("id", params.eventId)
        .select("*")
        .single();
    },

    async listPublicTicketTypes(params: { eventId: string }) {
      return client
        .from("event_ticket_types")
        .select("*")
        .eq("event_id", params.eventId)
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
    },

    async listTicketTypesForEvent(params: {
      organisationId: string;
      eventId: string;
    }) {
      return client
        .from("event_ticket_types")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
    },

    async getTicketTypeById(params: {
      organisationId: string;
      eventId: string;
      ticketTypeId: string;
    }) {
      return client
        .from("event_ticket_types")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .eq("id", params.ticketTypeId)
        .maybeSingle();
    },

    async createTicketType(input: EventTicketTypeInsert) {
      return client.from("event_ticket_types").insert(input).select("*").single();
    },

    async updateTicketType(params: {
      organisationId: string;
      eventId: string;
      ticketTypeId: string;
      values: EventTicketTypeUpdate;
    }) {
      return client
        .from("event_ticket_types")
        .update(params.values)
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .eq("id", params.ticketTypeId)
        .select("*")
        .single();
    },

    async countIssuedTicketsForType(params: {
      organisationId: string;
      ticketTypeId: string;
    }) {
      return client
        .from("event_tickets")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", params.organisationId)
        .eq("ticket_type_id", params.ticketTypeId)
        .in("status", ["issued", "used"]);
    },

    async createTickets(input: EventTicketInsert[]) {
      return client.from("event_tickets").insert(input).select("*");
    },

    async getTicketById(params: {
      organisationId: string;
      eventId: string;
      ticketId: string;
    }) {
      return client
        .from("event_tickets")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .eq("id", params.ticketId)
        .maybeSingle();
    },

    async updateTicket(params: {
      organisationId: string;
      eventId: string;
      ticketId: string;
      values: EventTicketUpdate;
    }) {
      return client
        .from("event_tickets")
        .update(params.values)
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .eq("id", params.ticketId)
        .select("*")
        .single();
    },

    async listTicketsForEvent(params: {
      organisationId: string;
      eventId: string;
    }) {
      return client
        .from("event_tickets")
        .select("*, ticket_type:event_ticket_types!event_tickets_ticket_type_event_organisation_fk(*)")
        .eq("organisation_id", params.organisationId)
        .eq("event_id", params.eventId)
        .order("created_at", { ascending: false });
    },

    async listTicketsForUser(params: {
      organisationId: string;
      userId: string;
      email: string;
    }) {
      return client
        .from("event_tickets")
        .select("*, event:events!event_tickets_event_organisation_fk(*), ticket_type:event_ticket_types!event_tickets_ticket_type_event_organisation_fk(*)")
        .eq("organisation_id", params.organisationId)
        .or(
          `purchaser_user_id.eq.${params.userId},holder_email.ilike.${params.email}`,
        )
        .order("issued_at", { ascending: false });
    },

    async getTicketForUser(params: {
      organisationId: string;
      ticketId: string;
      userId: string;
      email: string;
    }) {
      return client
        .from("event_tickets")
        .select("*, event:events!event_tickets_event_organisation_fk(*), ticket_type:event_ticket_types!event_tickets_ticket_type_event_organisation_fk(*)")
        .eq("organisation_id", params.organisationId)
        .eq("id", params.ticketId)
        .or(
          `purchaser_user_id.eq.${params.userId},holder_email.ilike.${params.email}`,
        )
        .maybeSingle();
    },

    async findUserByEmail(params: { organisationId: string; email: string }) {
      return client
        .from("users")
        .select("id, email")
        .eq("organisation_id", params.organisationId)
        .ilike("email", params.email)
        .maybeSingle();
    },

    async createAuditLog(input: {
      organisationId: string;
      userId: string | null;
      action: string;
      entityType: string;
      entityId: string;
      oldValues?: Json | null;
      newValues?: Json | null;
    }) {
      return client
        .from("audit_logs")
        .insert({
          organisation_id: input.organisationId,
          user_id: input.userId,
          action: input.action,
          entity_type: input.entityType,
          entity_id: input.entityId,
          old_values: input.oldValues ?? null,
          new_values: input.newValues ?? null,
        })
        .select("id")
        .single();
    },
  };
}
