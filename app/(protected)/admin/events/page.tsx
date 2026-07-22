import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { AdminEventsTable } from "@/components/events/admin-events-table";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Button } from "@/components/ui/button";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";
import type { EventStatus } from "@/types/events";

export const dynamic = "force-dynamic";

type AdminEventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses: EventStatus[] = ["draft", "published", "cancelled", "completed"];
const dateFilters = ["upcoming", "past", "all"] as const;

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value?: string) {
  return statuses.includes(value as EventStatus)
    ? (value as EventStatus)
    : undefined;
}

function parseDateFilter(value?: string) {
  return dateFilters.includes(value as (typeof dateFilters)[number])
    ? (value as (typeof dateFilters)[number])
    : "upcoming";
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = parseStatus(readParam(resolvedSearchParams, "status"));
  const categoryId = readParam(resolvedSearchParams, "category") || undefined;
  const dateFilter = parseDateFilter(readParam(resolvedSearchParams, "date"));
  const search = readParam(resolvedSearchParams, "q")?.trim() || undefined;
  const page = parsePage(readParam(resolvedSearchParams, "page"));
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("events:manage");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const data = await service.listEventsForAdmin({
    organisationId: appUser.organisation_id,
    status,
    categoryId,
    dateFilter,
    search,
    page,
    pageSize: 10,
  });

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Events"
        description="Create, publish and manage community events."
        icon={CalendarDays}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Events" }]}
        actions={<Button asChild><Link href="/admin/events/new"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Create event</Link></Button>}
      />

      <FeedbackAlert tone="success" message={success} className="mb-5" />
      <FeedbackAlert tone="error" message={error ? `${error} Please review the event details and try again.` : null} className="mb-5" />

      <AdminEventsTable
        data={data}
        status={status}
        categoryId={categoryId}
        dateFilter={dateFilter}
        search={search}
      />
    </main>
  );
}
