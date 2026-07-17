import { randomBytes } from "node:crypto";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  cancelTicketSchema,
  listAdminEventsSchema,
  listPublicEventsSchema,
  updateTicketTypeActiveSchema,
  updateEventStatusSchema,
  type CancelTicketValues,
  type EventEditorValues,
  type IssueTicketsValues,
  type ListAdminEventsValues,
  type ListPublicEventsValues,
  type TicketTypeEditorValues,
  type UpdateTicketTypeActiveValues,
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
  AdminEventTicket,
  EventsAdminPage,
  EventTicketScanResult,
  EventTicket,
  EventTicketType,
  EventTicketTypeWithAvailability,
  EventWithCategory,
  PortalTicketsPage,
  PublicEventsPage,
  SafeEventTicket,
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

function safeTicketTypeSnapshot(ticketType: EventTicketType) {
  return {
    event_id: ticketType.event_id,
    name: ticketType.name,
    price: ticketType.price,
    currency: ticketType.currency,
    quantity_available: ticketType.quantity_available,
    sales_start_at: ticketType.sales_start_at,
    sales_end_at: ticketType.sales_end_at,
    active: ticketType.active,
    sort_order: ticketType.sort_order,
  };
}

function safeTicketSnapshot(ticket: EventTicket) {
  return {
    event_id: ticket.event_id,
    ticket_type_id: ticket.ticket_type_id,
    ticket_number: ticket.ticket_number,
    status: ticket.status,
    holder_email: ticket.holder_email,
    purchaser_user_id: ticket.purchaser_user_id,
  };
}

function createTicketQrValue(ticket: Pick<EventTicket, "status" | "qr_token">) {
  return ticket.status === "issued" ? `ticket:${ticket.qr_token}` : null;
}

function parseTicketQrPayload(payload: string) {
  const trimmed = payload.trim();

  if (!trimmed.startsWith("ticket:")) {
    return null;
  }

  const token = trimmed.slice("ticket:".length).trim();

  return token.length > 0 ? token : null;
}

function createTicketScanResult(input: EventTicketScanResult) {
  return input;
}

function isEventActiveForScanning(event: Event) {
  const now = new Date();

  return (
    event.status === "published" &&
    now >= new Date(event.starts_at) &&
    now <= new Date(event.ends_at)
  );
}

function generateQrToken() {
  return randomBytes(32).toString("hex");
}

function generateTicketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(4).toString("hex").toUpperCase();

  return `TKT-${timestamp}-${suffix}`;
}

function toTicketTypeWithAvailability(
  ticketType: EventTicketType,
  issuedCount: number,
): EventTicketTypeWithAvailability {
  return {
    ...ticketType,
    issued_count: issuedCount,
    remaining_quantity:
      ticketType.quantity_available === null
        ? null
        : Math.max(ticketType.quantity_available - issuedCount, 0),
  };
}

function toAdminEventTicket(value: EventTicket & { ticket_type?: EventTicketType | null }) {
  const { qr_token: _qrToken, ticket_type, ...ticket } = value;

  return {
    ...ticket,
    ticket_type: ticket_type ?? null,
  } as AdminEventTicket;
}

function toSafeEventTicket(
  value: EventTicket & {
    event?: Event | null;
    ticket_type?: EventTicketType | null;
  },
): SafeEventTicket {
  const { qr_token: _qrToken, event, ticket_type, ...ticket } = value;

  return {
    ...ticket,
    qr_value: createTicketQrValue(value),
    event: event ?? null,
    ticket_type: ticket_type ?? null,
  } as SafeEventTicket;
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

async function createEventsAuditLog(params: {
  repository: ReturnType<typeof createEventsRepository>;
  organisationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Database["public"]["Tables"]["audit_logs"]["Insert"]["old_values"];
  newValues?: Database["public"]["Tables"]["audit_logs"]["Insert"]["new_values"];
}) {
  const { error } = await params.repository.createAuditLog({
    organisationId: params.organisationId,
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
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

    async listPublicTicketTypes(eventId: string) {
      const { data, error } = await repository.listPublicTicketTypes({ eventId });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket information could not be loaded.",
          500,
          error,
        );
      }

      return data ?? [];
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

    async listTicketTypesForAdmin(params: {
      organisationId: string;
      eventId: string;
    }): Promise<EventTicketTypeWithAvailability[]> {
      const { data, error } = await repository.listTicketTypesForEvent(params);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket types could not be loaded.",
          500,
          error,
        );
      }

      const ticketTypes = data ?? [];
      const counts = await Promise.all(
        ticketTypes.map(async (ticketType) => {
          const { count, error: countError } =
            await repository.countIssuedTicketsForType({
              organisationId: params.organisationId,
              ticketTypeId: ticketType.id,
            });

          if (countError) {
            throw new AppError(
              "INTERNAL_ERROR",
              "Ticket availability could not be loaded.",
              500,
              countError,
            );
          }

          return count ?? 0;
        }),
      );

      return ticketTypes.map((ticketType, index) =>
        toTicketTypeWithAvailability(ticketType, counts[index] ?? 0),
      );
    },

    async listTicketsForAdmin(params: {
      organisationId: string;
      eventId: string;
    }): Promise<AdminEventTicket[]> {
      const { data, error } = await repository.listTicketsForEvent(params);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Tickets could not be loaded.",
          500,
          error,
        );
      }

      return ((data ?? []) as unknown as Array<
        EventTicket & { ticket_type?: EventTicketType | null }
      >).map(toAdminEventTicket);
    },

    async listEventsForTicketScanner(organisationId: string) {
      const { data, error } = await repository.listScannerEvents({
        organisationId,
        endsFrom: new Date().toISOString(),
        rangeFrom: 0,
        rangeTo: 50,
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Scanner events could not be loaded.",
          500,
          error,
        );
      }

      return (data ?? []).map(toEventWithCategory);
    },

    async listTicketsForAuthenticatedUser(
      authUserId: string,
    ): Promise<PortalTicketsPage> {
      const appUser = await this.getAppUserByAuthUserId(authUserId);
      const { data, error } = await repository.listTicketsForUser({
        organisationId: appUser.organisation_id,
        userId: appUser.id,
        email: appUser.email,
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Your tickets could not be loaded.",
          500,
          error,
        );
      }

      return {
        tickets: ((data ?? []) as unknown as Array<
          EventTicket & {
            event?: Event | null;
            ticket_type?: EventTicketType | null;
          }
        >).map(toSafeEventTicket),
      };
    },

    async getTicketForAuthenticatedUser(params: {
      authUserId: string;
      ticketId: string;
    }): Promise<SafeEventTicket | null> {
      const appUser = await this.getAppUserByAuthUserId(params.authUserId);
      const { data, error } = await repository.getTicketForUser({
        organisationId: appUser.organisation_id,
        ticketId: params.ticketId,
        userId: appUser.id,
        email: appUser.email,
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Your ticket could not be loaded.",
          500,
          error,
        );
      }

      return data
        ? toSafeEventTicket(
            data as unknown as EventTicket & {
              event?: Event | null;
              ticket_type?: EventTicketType | null;
            },
          )
        : null;
    },

    async saveTicketType(input: TicketTypeEditorValues) {
      const values = input;
      const event = await this.getEventForAdmin({
        organisationId: values.organisationId,
        eventId: values.eventId,
      });

      if (event.status === "cancelled" || event.status === "completed") {
        throw new AppError(
          "CONFLICT",
          "Ticket types cannot be changed for cancelled or completed events.",
          409,
        );
      }

      const payload = {
        organisation_id: values.organisationId,
        event_id: values.eventId,
        name: values.name,
        description: values.description,
        price: values.price,
        currency: values.currency,
        quantity_available: values.quantityAvailable,
        sales_start_at: values.salesStartAt?.toISOString() ?? null,
        sales_end_at: values.salesEndAt?.toISOString() ?? null,
        sort_order: values.sortOrder,
      };

      if (!values.ticketTypeId) {
        const { data, error } = await repository.createTicketType(payload);

        if (error) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Ticket type could not be created.",
            500,
            error,
          );
        }

        await createEventsAuditLog({
          repository,
          organisationId: values.organisationId,
          userId: values.reviewedByUserId,
          action: "event_ticket_type_created",
          entityType: "event_ticket_type",
          entityId: data.id,
          newValues: safeTicketTypeSnapshot(data),
        });

        return data;
      }

      const { data: existing, error: existingError } =
        await repository.getTicketTypeById({
          organisationId: values.organisationId,
          eventId: values.eventId,
          ticketTypeId: values.ticketTypeId,
        });

      if (existingError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type could not be checked.",
          500,
          existingError,
        );
      }

      if (!existing) {
        throw new AppError("NOT_FOUND", "Ticket type was not found.", 404);
      }

      const { data, error } = await repository.updateTicketType({
        organisationId: values.organisationId,
        eventId: values.eventId,
        ticketTypeId: values.ticketTypeId,
        values: payload,
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type could not be updated.",
          500,
          error,
        );
      }

      await createEventsAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "event_ticket_type_updated",
        entityType: "event_ticket_type",
        entityId: data.id,
        oldValues: safeTicketTypeSnapshot(existing),
        newValues: safeTicketTypeSnapshot(data),
      });

      return data;
    },

    async updateTicketTypeActive(input: UpdateTicketTypeActiveValues) {
      const values = updateTicketTypeActiveSchema.parse(input);
      const { data: existing, error: existingError } =
        await repository.getTicketTypeById({
          organisationId: values.organisationId,
          eventId: values.eventId,
          ticketTypeId: values.ticketTypeId,
        });

      if (existingError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type could not be checked.",
          500,
          existingError,
        );
      }

      if (!existing) {
        throw new AppError("NOT_FOUND", "Ticket type was not found.", 404);
      }

      if (existing.active === values.active) {
        return existing;
      }

      const { data, error } = await repository.updateTicketType({
        organisationId: values.organisationId,
        eventId: values.eventId,
        ticketTypeId: values.ticketTypeId,
        values: { active: values.active },
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type status could not be updated.",
          500,
          error,
        );
      }

      await createEventsAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: values.active
          ? "event_ticket_type_activated"
          : "event_ticket_type_deactivated",
        entityType: "event_ticket_type",
        entityId: data.id,
        oldValues: safeTicketTypeSnapshot(existing),
        newValues: safeTicketTypeSnapshot(data),
      });

      return data;
    },

    async issueTickets(input: IssueTicketsValues) {
      const values = input;
      const event = await this.getEventForAdmin({
        organisationId: values.organisationId,
        eventId: values.eventId,
      });

      if (event.status === "cancelled" || event.status === "completed") {
        throw new AppError(
          "CONFLICT",
          "Tickets cannot be issued for cancelled or completed events.",
          409,
        );
      }

      const { data: ticketType, error: ticketTypeError } =
        await repository.getTicketTypeById({
          organisationId: values.organisationId,
          eventId: values.eventId,
          ticketTypeId: values.ticketTypeId,
        });

      if (ticketTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type could not be checked.",
          500,
          ticketTypeError,
        );
      }

      if (!ticketType) {
        throw new AppError("NOT_FOUND", "Ticket type was not found.", 404);
      }

      if (!ticketType.active) {
        throw new AppError(
          "CONFLICT",
          "Inactive ticket types cannot issue tickets.",
          409,
        );
      }

      const now = new Date();
      if (ticketType.sales_start_at && now < new Date(ticketType.sales_start_at)) {
        throw new AppError("CONFLICT", "Ticket sales have not opened yet.", 409);
      }

      if (ticketType.sales_end_at && now > new Date(ticketType.sales_end_at)) {
        throw new AppError("CONFLICT", "Ticket sales have closed.", 409);
      }

      const { count, error: countError } =
        await repository.countIssuedTicketsForType({
          organisationId: values.organisationId,
          ticketTypeId: values.ticketTypeId,
        });

      if (countError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket availability could not be checked.",
          500,
          countError,
        );
      }

      const issuedCount = count ?? 0;
      if (
        ticketType.quantity_available !== null &&
        issuedCount + values.quantity > ticketType.quantity_available
      ) {
        throw new AppError(
          "CONFLICT",
          "Not enough tickets are available for this ticket type.",
          409,
        );
      }

      let purchaserUserId: string | null = null;
      const userEmail = values.linkedUserEmail ?? values.holderEmail;

      if (userEmail) {
        const { data: user, error: userError } = await repository.findUserByEmail({
          organisationId: values.organisationId,
          email: userEmail,
        });

        if (userError) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Linked user could not be checked.",
            500,
            userError,
          );
        }

        purchaserUserId = user?.id ?? null;
      }

      const ticketsToCreate = Array.from({ length: values.quantity }, () => ({
        organisation_id: values.organisationId,
        event_id: values.eventId,
        ticket_type_id: values.ticketTypeId,
        purchaser_user_id: purchaserUserId,
        holder_name: values.holderName,
        holder_email: values.holderEmail,
        ticket_number: generateTicketNumber(),
        qr_token: generateQrToken(),
        status: "issued" as const,
        created_by: values.reviewedByUserId,
        internal_note: values.internalNote,
      }));

      const { data, error } = await repository.createTickets(ticketsToCreate);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Tickets could not be issued.",
          500,
          error,
        );
      }

      const tickets = data ?? [];
      await createEventsAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "event_ticket_issued",
        entityType: "event_ticket",
        entityId: tickets[0]?.id ?? values.eventId,
        newValues: {
          event_id: values.eventId,
          ticket_type_id: values.ticketTypeId,
          quantity: tickets.length,
          ticket_ids: tickets.map((ticket) => ticket.id),
          ticket_numbers: tickets.map((ticket) => ticket.ticket_number),
        },
      });

      return tickets.map(safeTicketSnapshot);
    },

    async cancelTicket(input: CancelTicketValues) {
      const values = cancelTicketSchema.parse(input);
      const { data: existing, error: existingError } =
        await repository.getTicketById({
          organisationId: values.organisationId,
          eventId: values.eventId,
          ticketId: values.ticketId,
        });

      if (existingError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket could not be checked.",
          500,
          existingError,
        );
      }

      if (!existing) {
        throw new AppError("NOT_FOUND", "Ticket was not found.", 404);
      }

      if (existing.status === "cancelled") {
        return existing;
      }

      if (existing.status !== "issued") {
        throw new AppError(
          "CONFLICT",
          "Only issued tickets can be cancelled.",
          409,
        );
      }

      const { data, error } = await repository.updateTicket({
        organisationId: values.organisationId,
        eventId: values.eventId,
        ticketId: values.ticketId,
        values: {
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        },
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket could not be cancelled.",
          500,
          error,
        );
      }

      await createEventsAuditLog({
        repository,
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "event_ticket_cancelled",
        entityType: "event_ticket",
        entityId: data.id,
        oldValues: safeTicketSnapshot(existing),
        newValues: safeTicketSnapshot(data),
      });

      return safeTicketSnapshot(data);
    },

    async scanEventTicket(input: {
      payload: string;
      eventId: string;
      verifierAuthUserId: string;
      canScanAllOrganisations: boolean;
    }): Promise<EventTicketScanResult> {
      const qrToken = parseTicketQrPayload(input.payload);

      if (!qrToken) {
        return createTicketScanResult({
          tone: "invalid",
          title: "Invalid ticket QR",
          message: "This is not a recognised event ticket QR code.",
        });
      }

      const verifier = await this.getAppUserByAuthUserId(input.verifierAuthUserId);
      const { data: selectedEvent, error: selectedEventError } =
        await repository.getEventById({
          organisationId: verifier.organisation_id,
          eventId: input.eventId,
        });

      if (selectedEventError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Selected event could not be checked.",
          500,
          selectedEventError,
        );
      }

      if (!selectedEvent) {
        return createTicketScanResult({
          tone: "invalid",
          title: "Wrong organisation",
          message: "This event is not available to this scanner account.",
        });
      }

      const { data: ticket, error: ticketError } =
        await repository.getTicketByQrToken(qrToken);

      if (ticketError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket could not be checked.",
          500,
          ticketError,
        );
      }

      if (!ticket) {
        return createTicketScanResult({
          tone: "invalid",
          title: "Invalid ticket",
          message: "No event ticket matched this QR code.",
        });
      }

      if (
        !input.canScanAllOrganisations &&
        ticket.organisation_id !== verifier.organisation_id
      ) {
        return createTicketScanResult({
          tone: "invalid",
          title: "Wrong organisation",
          message: "This ticket belongs to a different organisation.",
        });
      }

      if (ticket.event_id !== input.eventId) {
        return createTicketScanResult({
          tone: "invalid",
          title: "Wrong event",
          message: "This ticket is valid for a different event.",
          ticketNumber: ticket.ticket_number,
          holderName: ticket.holder_name,
          status: ticket.status,
        });
      }

      const event = toEventWithCategory(selectedEvent);
      const { data: ticketType, error: ticketTypeError } =
        await repository.getTicketTypeById({
          organisationId: ticket.organisation_id,
          eventId: ticket.event_id,
          ticketTypeId: ticket.ticket_type_id,
        });

      if (ticketTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket type could not be checked.",
          500,
          ticketTypeError,
        );
      }

      const baseResult = {
        eventName: event.title,
        eventDate: event.starts_at,
        venue: event.venue,
        ticketTypeName: ticketType?.name,
        ticketNumber: ticket.ticket_number,
        holderName: ticket.holder_name,
        status: ticket.status,
      };

      if (ticket.status === "used") {
        return createTicketScanResult({
          ...baseResult,
          tone: "warning",
          title: "Already used",
          message: ticket.checked_in_at
            ? `This ticket was already checked in at ${new Intl.DateTimeFormat(
                "en-ZA",
                {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ).format(new Date(ticket.checked_in_at))}.`
            : "This ticket has already been used.",
        });
      }

      if (ticket.status === "cancelled") {
        return createTicketScanResult({
          ...baseResult,
          tone: "invalid",
          title: "Cancelled ticket",
          message: "This ticket has been cancelled and cannot be admitted.",
        });
      }

      if (ticket.status === "refunded") {
        return createTicketScanResult({
          ...baseResult,
          tone: "invalid",
          title: "Refunded ticket",
          message: "This ticket has been refunded and cannot be admitted.",
        });
      }

      if (!isEventActiveForScanning(event)) {
        return createTicketScanResult({
          ...baseResult,
          tone: "warning",
          title: "Event not active",
          message: "Tickets can only be checked in while the event is active.",
        });
      }

      const { data: checkedInTicket, error: checkInError } =
        await repository.updateTicket({
          organisationId: ticket.organisation_id,
          eventId: ticket.event_id,
          ticketId: ticket.id,
          values: {
            status: "used",
            checked_in_at: new Date().toISOString(),
            checked_in_by: verifier.id,
          },
        });

      if (checkInError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Ticket could not be checked in.",
          500,
          checkInError,
        );
      }

      await createEventsAuditLog({
        repository,
        organisationId: ticket.organisation_id,
        userId: verifier.id,
        action: "event_ticket_checked_in",
        entityType: "event_ticket",
        entityId: ticket.id,
        oldValues: safeTicketSnapshot(ticket),
        newValues: safeTicketSnapshot(checkedInTicket),
      });

      return createTicketScanResult({
        ...baseResult,
        status: checkedInTicket.status,
        tone: "valid",
        title: "Valid ticket",
        message: "Ticket checked in successfully.",
      });
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
