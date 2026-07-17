"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelTicketSchema,
  issueTicketsSchema,
  ticketTypeEditorSchema,
  updateTicketTypeActiveSchema,
} from "@/features/events/schemas";
import { getSafeErrorMessage } from "@/lib/errors";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function eventPath(eventId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/events/${eventId}?${searchParams.toString()}`;
}

async function getTicketAdminContext() {
  const profile = await requirePermission("events:tickets:manage");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  return { service, appUser };
}

function revalidateTicketPaths(eventId: string, eventSlug?: string) {
  try {
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/events");
    revalidatePath("/portal/tickets");
    revalidatePath("/events");
    if (eventSlug) {
      revalidatePath(`/events/${eventSlug}`);
    }
  } catch {
    // Ticket mutations should still redirect if cache invalidation fails.
  }
}

export async function saveTicketTypeAdminAction(formData: FormData) {
  const eventId = readString(formData, "eventId");
  const { service, appUser } = await getTicketAdminContext();
  const result = ticketTypeEditorSchema.safeParse({
    organisationId: appUser.organisation_id,
    reviewedByUserId: appUser.id,
    eventId,
    ticketTypeId: readString(formData, "ticketTypeId") || undefined,
    name: readString(formData, "name"),
    description: readString(formData, "description"),
    price: readString(formData, "price"),
    currency: readString(formData, "currency") || "ZAR",
    quantityAvailable: readString(formData, "quantityAvailable"),
    salesStartAt: readString(formData, "salesStartAt"),
    salesEndAt: readString(formData, "salesEndAt"),
    sortOrder: readString(formData, "sortOrder") || "0",
  });

  if (!result.success) {
    redirect(
      eventPath(eventId, {
        error:
          result.error.issues[0]?.message ?? "Check the ticket type details.",
      }),
    );
  }

  try {
    await service.saveTicketType(result.data);
    const event = await service.getEventForAdmin({
      organisationId: appUser.organisation_id,
      eventId,
    });
    revalidateTicketPaths(eventId, event.slug);
  } catch (error) {
    redirect(eventPath(eventId, { error: getSafeErrorMessage(error) }));
  }

  redirect(eventPath(eventId, { success: "Ticket type saved." }));
}

export async function updateTicketTypeActiveAdminAction(formData: FormData) {
  const eventId = readString(formData, "eventId");
  const ticketTypeId = readString(formData, "ticketTypeId");
  const active = readString(formData, "active") === "true";
  const { service, appUser } = await getTicketAdminContext();
  const result = updateTicketTypeActiveSchema.safeParse({
    organisationId: appUser.organisation_id,
    reviewedByUserId: appUser.id,
    eventId,
    ticketTypeId,
    active,
  });

  if (!result.success) {
    redirect(eventPath(eventId, { error: "Check the ticket type action." }));
  }

  try {
    await service.updateTicketTypeActive(result.data);
    const event = await service.getEventForAdmin({
      organisationId: appUser.organisation_id,
      eventId,
    });
    revalidateTicketPaths(eventId, event.slug);
  } catch (error) {
    redirect(eventPath(eventId, { error: getSafeErrorMessage(error) }));
  }

  redirect(
    eventPath(eventId, {
      success: active ? "Ticket type activated." : "Ticket type deactivated.",
    }),
  );
}

export async function issueTicketsAdminAction(formData: FormData) {
  const eventId = readString(formData, "eventId");
  const { service, appUser } = await getTicketAdminContext();
  const result = issueTicketsSchema.safeParse({
    organisationId: appUser.organisation_id,
    reviewedByUserId: appUser.id,
    eventId,
    ticketTypeId: readString(formData, "ticketTypeId"),
    quantity: readString(formData, "quantity"),
    holderName: readString(formData, "holderName"),
    holderEmail: readString(formData, "holderEmail"),
    linkedUserEmail: readString(formData, "linkedUserEmail"),
    internalNote: readString(formData, "internalNote"),
  });

  if (!result.success) {
    redirect(
      eventPath(eventId, {
        error: result.error.issues[0]?.message ?? "Check the ticket details.",
      }),
    );
  }

  try {
    await service.issueTickets(result.data);
    const event = await service.getEventForAdmin({
      organisationId: appUser.organisation_id,
      eventId,
    });
    revalidateTicketPaths(eventId, event.slug);
  } catch (error) {
    redirect(eventPath(eventId, { error: getSafeErrorMessage(error) }));
  }

  redirect(eventPath(eventId, { success: "Tickets issued." }));
}

export async function cancelTicketAdminAction(formData: FormData) {
  const eventId = readString(formData, "eventId");
  const { service, appUser } = await getTicketAdminContext();
  const result = cancelTicketSchema.safeParse({
    organisationId: appUser.organisation_id,
    reviewedByUserId: appUser.id,
    eventId,
    ticketId: readString(formData, "ticketId"),
  });

  if (!result.success) {
    redirect(eventPath(eventId, { error: "Check the ticket cancellation." }));
  }

  try {
    await service.cancelTicket(result.data);
    const event = await service.getEventForAdmin({
      organisationId: appUser.organisation_id,
      eventId,
    });
    revalidateTicketPaths(eventId, event.slug);
  } catch (error) {
    redirect(eventPath(eventId, { error: getSafeErrorMessage(error) }));
  }

  redirect(eventPath(eventId, { success: "Ticket cancelled." }));
}
