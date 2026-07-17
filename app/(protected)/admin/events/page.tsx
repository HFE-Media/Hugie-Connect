import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { AdminEventsTable } from "@/components/events/admin-events-table";
import { Button } from "@/components/ui/button";
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
    <main className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-3">
            <Link href="/admin">Admin</Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CalendarDays className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">Events</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create, publish and manage organisation-scoped events. Ticket sales
            are intentionally deferred to the ticketing sprint.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">Create event</Link>
        </Button>
      </div>

      {success ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

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
