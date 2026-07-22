import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { EventStatusBadge, EventVisibilityBadge } from "@/components/events/event-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EventCategory, EventsAdminPage, EventStatus } from "@/types/events";

type AdminEventsTableProps = {
  data: EventsAdminPage;
  status?: EventStatus;
  categoryId?: string;
  dateFilter: "upcoming" | "past" | "all";
  search?: string;
};

const statusFilters: Array<{ label: string; value?: EventStatus }> = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildHref(params: {
  status?: EventStatus;
  categoryId?: string;
  dateFilter?: string;
  search?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.categoryId) searchParams.set("category", params.categoryId);
  if (params.dateFilter && params.dateFilter !== "upcoming") {
    searchParams.set("date", params.dateFilter);
  }
  if (params.search) searchParams.set("q", params.search);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));

  const query = searchParams.toString();

  return query ? `/admin/events?${query}` : "/admin/events";
}

function CategoryFilter({
  categories,
  categoryId,
}: {
  categories: EventCategory[];
  categoryId?: string;
}) {
  return (
    <select
      name="category"
      defaultValue={categoryId ?? ""}
      className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

export function AdminEventsTable({
  data,
  status,
  categoryId,
  dateFilter,
  search,
}: AdminEventsTableProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Link
                key={filter.label}
                href={buildHref({
                  status: filter.value,
                  categoryId,
                  dateFilter,
                  search,
                })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  status === filter.value ||
                    (!status && filter.value === undefined)
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-input bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <form className="grid gap-2 lg:grid-cols-[1fr_180px_150px_auto]">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Search event title"
                className="pl-9"
              />
            </div>
            <CategoryFilter
              categories={data.categories}
              categoryId={categoryId}
            />
            <select
              name="date"
              defaultValue={dateFilter}
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All dates</option>
            </select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </div>
      </div>

      {data.events.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
          <p className="text-base font-semibold">No events found</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Create an event or adjust the filters to find existing events.
          </p>
          <Button asChild className="mt-5">
            <Link href="/admin/events/new">Create event</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="hidden grid-cols-[1.4fr_1fr_.8fr_.8fr_auto] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground lg:grid">
            <span>Event</span>
            <span>Date</span>
            <span>Status</span>
            <span>Visibility</span>
            <span className="sr-only">Open</span>
          </div>
          <div className="divide-y">
            {data.events.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/40 lg:grid-cols-[1.4fr_1fr_.8fr_.8fr_auto] lg:items-center"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.category?.name ?? "No category"} - {event.venue ?? "Venue not set"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.starts_at)}
                </p>
                <EventStatusBadge status={event.status} />
                <EventVisibilityBadge visibility={event.visibility} />
                <ChevronRight
                  className="hidden h-4 w-4 text-muted-foreground lg:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 text-sm text-muted-foreground shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing page {data.page} of {data.pageCount} - {data.totalCount} total
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={buildHref({
                status,
                categoryId,
                dateFilter,
                search,
                page: Math.max(1, data.page - 1),
              })}
              className={data.page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link
              href={buildHref({
                status,
                categoryId,
                dateFilter,
                search,
                page: Math.min(data.pageCount, data.page + 1),
              })}
              className={
                data.page >= data.pageCount
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
