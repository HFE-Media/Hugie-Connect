import type { SupabaseClient } from "@supabase/supabase-js";

import type { EventStatus } from "@/types/events";
import type { Database, Json } from "@/types/database";

export type EventsRepositoryClient = SupabaseClient<Database>;

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

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
      startsFrom?: string;
      startsBefore?: string;
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

      if (params.startsFrom) {
        query = query.gte("starts_at", params.startsFrom);
      }

      if (params.startsBefore) {
        query = query.lt("starts_at", params.startsBefore);
      }

      return query;
    },

    async listPublicEvents(params: {
      search?: string;
      categoryId?: string;
      startsFrom: string;
      rangeFrom: number;
      rangeTo: number;
    }) {
      let query = client
        .from("events")
        .select("*, category:event_categories!events_category_organisation_fk(*)", {
          count: "exact",
        })
        .eq("status", "published")
        .gte("ends_at", params.startsFrom)
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
