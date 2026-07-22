import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { AdminEventForm } from "@/components/events/admin-event-form";
import { AdminTicketManagement } from "@/components/events/admin-ticket-management";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import {
  EventStatusBadge,
  EventVisibilityBadge,
} from "@/components/events/event-status-badge";
import { updateEventStatusAdminAction } from "@/features/events/admin-actions";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

type AdminEventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminEventDetailPage({
  params,
  searchParams,
}: AdminEventDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("events:manage");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const [event, categories, ticketTypes, tickets] = await Promise.all([
    service.getEventForAdmin({
      organisationId: appUser.organisation_id,
      eventId: id,
    }),
    service.listCategories(appUser.organisation_id),
    service.listTicketTypesForAdmin({
      organisationId: appUser.organisation_id,
      eventId: id,
    }),
    service.listTicketsForAdmin({
      organisationId: appUser.organisation_id,
      eventId: id,
    }),
  ]);

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title={event.title}
        description="Edit event details, publishing status and ticket configuration."
        icon={CalendarDays}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Events", href: "/admin/events" }, { label: event.title }]}
        actions={event.status === "published" ? <Button asChild variant="outline"><Link href={`/events/${event.slug}`}>View public page</Link></Button> : undefined}
      />

      <section className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Event status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <EventStatusBadge status={event.status} />
              <EventVisibilityBadge visibility={event.visibility} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.status !== "published" && event.status !== "cancelled" ? (
              <form action={updateEventStatusAdminAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="status" value="published" />
                <SubmitButton pendingLabel="Publishing event...">Publish event</SubmitButton>
              </form>
            ) : null}
            {event.status !== "cancelled" ? (
              <form action={updateEventStatusAdminAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="status" value="cancelled" />
                <ConfirmSubmitButton
                  title="Cancel this event?"
                  description="The event will be marked as cancelled and ticket issuance will stop. Existing event and ticket records will be preserved."
                  confirmLabel="Cancel event"
                  pendingLabel="Cancelling event..."
                >
                  Cancel event
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </div>
        </div>

        <FeedbackAlert tone="success" message={success} className="mb-5" />
        <FeedbackAlert tone="error" message={error ? `${error} Review the event information and try again.` : null} className="mb-5" />

        <AdminEventForm categories={categories} event={event} />
      </section>

      <AdminTicketManagement
        eventId={event.id}
        ticketTypes={ticketTypes}
        tickets={tickets}
      />
    </main>
  );
}
