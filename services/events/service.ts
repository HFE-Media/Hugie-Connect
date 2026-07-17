import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  eventEditorSchema,
  listAdminEventsSchema,
  listPublicEventsSchema,
  updateEventStatusSchema,
  type EventEditorValues,
  type ListAdminEventsValues,
  type ListPublicEventsValues,
  type UpdateEventStatusValues,
} from "@/features/events/schemas";
import {
  createEventsRepository,
  type EventsRepositoryClient,
} from "@/services/events/repository";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import type { Database } from "@/types/database";
import type {
  Event,
  EventsAdminPage,
  EventWithCategory,
  PublicEventsPage,
} from "@/types/events";

type AppUser = Database["public"]["Tables"]["users"]["Row"] & {
  organisation_id: string;
};

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: unknown;
  hint?: string;
};

function logSupabaseError(scope: string, error: SupabaseLikeError) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  logger.warn(scope, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toEventWithCategory(value: unknown) {
  return value as EventWithCategory;
}

function safeEventSnapshot(event: Event) {
  return {
    title: event.title,
    status: event.status,
    visibility: event.visibility,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    capacity: event.capacity,
    category_id: event.category_id,
  };
}

async function createEventAuditLog(params: {
  repository: ReturnType<typeof createEventsRepository>;
  organisationId: string;
  userId: string;
  action: string;
  entityId: string;
  oldValues?: ReturnType<typeof safeEventSnapshot> | null;
  newValues?: ReturnType<typeof safeEventSnapshot> | null;
}) {
  const { error } = await params.repository.createAuditLog({
    organisationId: params.organisationId,
    userId: params.userId,
    action: params.action,
    entityType: "event",
    entityId: params.entityId,
    oldValues: params.oldValues,
    newValues: params.newValues,
  });

  if (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Event audit log could not be created.",
      500,
      error,
    );
  }
}

function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;

  return { from, to: from + pageSize - 1 };
}

function eventDateWindow(
  dateFilter: "upcoming" | "past" | "all",
  nowIso: string,
) {
  if (dateFilter === "upcoming") {
    return { endsFrom: nowIso };
  }

  if (dateFilter === "past") {
    return { endsBefore: nowIso };
  }

  return {};
}

async function ensureUniqueSlug(params: {
  repository: ReturnType<typeof createEventsRepository>;
  organisationId: string;
  title: string;
}) {
  const baseSlug = slugify(params.title) || "event";

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const { data, error } = await params.repository.slugExists({
      organisationId: params.organisationId,
      slug: candidate,
    });

    if (error) {
      throw new AppError(
        "INTERNAL_ERROR",
        "Event slug could not be checked.",
        500,
        error,
      );
    }

    if (!data) {
      return candidate;
    }
  }

  throw new AppError(
    "CONFLICT",
    "An event with a similar title already exists. Change the title and try again.",
    409,
  );
}

export function createEventsService(client: EventsRepositoryClient) {
  const repository = createEventsRepository(client);

  return {
    async listCategories(organisationId?: string) {
      const { data, error } = await repository.listCategories({ organisationId });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event categories could not be loaded.",
          500,
          error,
        );
      }

      return data ?? [];
    },

    async listPublicEvents(input: ListPublicEventsValues): Promise<PublicEventsPage> {
      const values = listPublicEventsSchema.parse(input);
      const { from, to } = pageRange(values.page, values.pageSize);
      const [eventsResult, categoriesResult] = await Promise.all([
        repository.listPublicEvents({
          search: values.search,
          categoryId: values.categoryId,
          endsFrom: new Date().toISOString(),
          rangeFrom: from,
          rangeTo: to,
        }),
        repository.listCategories(),
      ]);

      if (eventsResult.error) {
        logSupabaseError("Public events query failed", eventsResult.error);
        throw new AppError(
          "INTERNAL_ERROR",
          "Events could not be loaded.",
          500,
          eventsResult.error,
        );
      }

      if (categoriesResult.error) {
        logSupabaseError("Public event categories query failed", categoriesResult.error);
        throw new AppError(
          "INTERNAL_ERROR",
          "Event categories could not be loaded.",
          500,
          categoriesResult.error,
        );
      }

      const totalCount = eventsResult.count ?? 0;

      return {
        events: (eventsResult.data ?? []).map(toEventWithCategory),
        categories: categoriesResult.data ?? [],
        totalCount,
        page: values.page,
        pageSize: values.pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / values.pageSize)),
      };
    },

    async getPublicEventBySlug(slug: string) {
      const { data, error } = await repository.getEventBySlug(slug);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event could not be loaded.",
          500,
          error,
        );
      }

      return data ? toEventWithCategory(data) : null;
    },
  };
}

export function createEventsAdminService() {
  const repository = createEventsRepository(createSupabaseAdminClient());

  return {
    async getAppUserByAuthUserId(authUserId: string): Promise<AppUser> {
      const { data, error } = await createSupabaseAdminClient()
        .from("users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Admin profile could not be loaded.",
          500,
          error,
        );
      }

      if (!data?.organisation_id) {
        throw new AppError(
          "FORBIDDEN",
          "Your account is not assigned to an organisation.",
          403,
        );
      }

      return { ...data, organisation_id: data.organisation_id };
    },

    async listCategories(organisationId: string) {
      const { data, error } = await repository.listCategories({ organisationId });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event categories could not be loaded.",
          500,
          error,
        );
      }

      return data ?? [];
    },

    async listEventsForAdmin(input: ListAdminEventsValues): Promise<EventsAdminPage> {
      const values = listAdminEventsSchema.parse(input);
      const { from, to } = pageRange(values.page, values.pageSize);
      const now = new Date().toISOString();
      const dateWindow = eventDateWindow(values.dateFilter, now);
      const [eventsResult, categoriesResult] = await Promise.all([
        repository.listAdminEvents({
          organisationId: values.organisationId,
          search: values.search,
          status: values.status,
          categoryId: values.categoryId,
          ...dateWindow,
          rangeFrom: from,
          rangeTo: to,
        }),
        repository.listCategories({ organisationId: values.organisationId }),
      ]);

      if (eventsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Events could not be loaded.",
          500,
          eventsResult.error,
        );
      }

      if (categoriesResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event categories could not be loaded.",
          500,
          categoriesResult.error,
        );
      }

      const totalCount = eventsResult.count ?? 0;

      return {
        events: (eventsResult.data ?? []).map(toEventWithCategory),
        categories: categoriesResult.data ?? [],
        totalCount,
        page: values.page,
        pageSize: values.pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / values.pageSize)),
      };
    },

    async getEventForAdmin(params: { organisationId: string; eventId: string }) {
      const { data, error } = await repository.getEventById(params);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event could not be loaded.",
          500,
          error,
        );
      }

      if (!data) {
        throw new AppError("NOT_FOUND", "Event was not found.", 404);
      }

      return toEventWithCategory(data);
    },

    async saveEvent(input: EventEditorValues) {
      const values = input;

      if (values.categoryId) {
        const { data: category, error: categoryError } =
          await repository.getCategoryById({
            organisationId: values.organisationId,
            categoryId: values.categoryId,
          });

        if (categoryError) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Event category could not be checked.",
            500,
            categoryError,
          );
        }

        if (!category) {
          throw new AppError(
            "BAD_REQUEST",
            "Choose a valid event category.",
            400,
          );
        }
      }

      if (!values.eventId) {
        const slug = await ensureUniqueSlug({
          repository,
          organisationId: values.organisationId,
          title: values.title,
        });
        const insertPayload = {
          organisation_id: values.organisationId,
          category_id: values.categoryId,
          title: values.title,
          slug,
          summary: values.summary,
          description: values.description,
          venue: values.venue,
          starts_at: values.startsAt.toISOString(),
          ends_at: values.endsAt.toISOString(),
          capacity: values.capacity,
          visibility: values.visibility,
          featured_image_url: values.featuredImageUrl,
          created_by: values.reviewedByUserId,
          status: "draft",
        } as const;

        const { data, error } = await repository.createEvent(insertPayload);

        if (error) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Event could not be created.",
            500,
            error,
          );
        }

        await createEventAuditLog({
          repository,
          organisationId: values.organisationId,
          userId: values.reviewedByUserId,
          action: "event_created",
          entityId: data.id,
          newValues: safeEventSnapshot(data),
        });

        return data;
      }

      const existing = await this.getEventForAdmin({
        organisationId: values.organisationId,
        eventId: values.eventId,
      });

      if (existing.status === "cancelled") {
        throw new AppError(
          "CONFLICT",
          "Cancelled events cannot be edited.",
          409,
        );
      }

      const { data, error } = await repository.updateEvent({
        organisationId: values.organisationId,
        eventId: values.eventId,
        values: {
          category_id: values.categoryId,
          title: values.title,
          summary: values.summary,
          description: values.description,
          venue: values.venue,
          starts_at: values.startsAt.toISOString(),
          ends_at: values.endsAt.toISOString(),
          capacity: values.capacity,
          visibility: values.visibility,
          featured_image_url: values.featuredImageUrl,
        },
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event could not be updated.",
          500,
          error,
        );
      }

      await createEventAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "event_updated",
        entityId: values.eventId,
        oldValues: safeEventSnapshot(existing),
        newValues: safeEventSnapshot(data),
      });

      return data;
    },

    async updateEventStatus(input: UpdateEventStatusValues) {
      const values = updateEventStatusSchema.parse(input);
      const existing = await this.getEventForAdmin({
        organisationId: values.organisationId,
        eventId: values.eventId,
      });

      if (existing.status === values.status) {
        return existing;
      }

      if (existing.status === "cancelled") {
        throw new AppError(
          "CONFLICT",
          "Cancelled events cannot be changed.",
          409,
        );
      }

      const { data, error } = await repository.updateEvent({
        organisationId: values.organisationId,
        eventId: values.eventId,
        values: {
          status: values.status,
          published_at:
            values.status === "published"
              ? existing.published_at ?? new Date().toISOString()
              : existing.published_at,
        },
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Event status could not be updated.",
          500,
          error,
        );
      }

      await createEventAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action:
          values.status === "published" ? "event_published" : "event_cancelled",
        entityId: values.eventId,
        oldValues: safeEventSnapshot(existing),
        newValues: safeEventSnapshot(data),
      });

      return data;
    },
  };
}
