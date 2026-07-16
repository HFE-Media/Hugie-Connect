"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eventEditorSchema, updateEventStatusSchema } from "@/features/events/schemas";
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

async function getEventAdminContext() {
  const profile = await requirePermission("events:manage");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  return { service, appUser };
}

function revalidateSavedEventPaths(slug: string) {
  try {
    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${slug}`);
  } catch {
    // A saved event should still redirect successfully if cache invalidation fails.
  }
}

const eventStatusFormSchema = updateEventStatusSchema.omit({
  organisationId: true,
  reviewedByUserId: true,
});

export async function saveEventAdminAction(formData: FormData) {
  const { service, appUser } = await getEventAdminContext();
  const result = eventEditorSchema.safeParse({
    organisationId: appUser.organisation_id,
    reviewedByUserId: appUser.id,
    eventId: readString(formData, "eventId") || undefined,
    categoryId: readString(formData, "categoryId"),
    title: readString(formData, "title"),
    summary: readString(formData, "summary"),
    description: readString(formData, "description"),
    venue: readString(formData, "venue"),
    startsAt: readString(formData, "startsAt"),
    endsAt: readString(formData, "endsAt"),
    capacity: readString(formData, "capacity"),
    visibility: readString(formData, "visibility"),
    featuredImageUrl: readString(formData, "featuredImageUrl"),
  });

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Check the event details.";
    const eventId = readString(formData, "eventId");
    redirect(
      eventId
        ? eventPath(eventId, { error: message })
        : `/admin/events/new?error=${encodeURIComponent(message)}`,
    );
  }

  let savedEventId: string;
  let savedEventSlug: string;

  try {
    const event = await service.saveEvent({
      ...result.data,
      organisationId: appUser.organisation_id,
      reviewedByUserId: appUser.id,
    });
    savedEventId = event.id;
    savedEventSlug = event.slug;
  } catch (error) {
    const message = getSafeErrorMessage(error);

    redirect(
      result.data.eventId
        ? eventPath(result.data.eventId, { error: message })
        : `/admin/events/new?error=${encodeURIComponent(message)}`,
    );
  }

  revalidateSavedEventPaths(savedEventSlug);

  redirect(
    eventPath(savedEventId, {
      success: result.data.eventId ? "Event updated." : "Event created.",
    }),
  );
}

export async function updateEventStatusAdminAction(formData: FormData) {
  const result = eventStatusFormSchema.safeParse({
    eventId: readString(formData, "eventId"),
    status: readString(formData, "status"),
  });

  if (!result.success) {
    const eventId = readString(formData, "eventId");
    redirect(eventPath(eventId, { error: "Check the event status action." }));
  }

  const { service, appUser } = await getEventAdminContext();

  try {
    const event = await service.updateEventStatus({
      ...result.data,
      organisationId: appUser.organisation_id,
      reviewedByUserId: appUser.id,
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${event.id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
  } catch (error) {
    redirect(
      eventPath(result.data.eventId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    eventPath(result.data.eventId, {
      success:
        result.data.status === "published"
          ? "Event published."
          : "Event cancelled.",
    }),
  );
}
