import Link from "next/link";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { EventVisibilityBadge } from "@/components/events/event-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicEventsPage } from "@/types/events";

type PublicEventsListProps = {
  data: PublicEventsPage;
  categoryId?: string;
  search?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildHref(params: {
  categoryId?: string;
  search?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.categoryId) searchParams.set("category", params.categoryId);
  if (params.search) searchParams.set("q", params.search);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));

  const query = searchParams.toString();

  return query ? `/events?${query}` : "/events";
}

export function PublicEventsList({
  data,
  categoryId,
  search,
}: PublicEventsListProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
        <form className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="q"
              defaultValue={search}
              placeholder="Search events"
              className="pl-9"
            />
          </div>
          <select
            name="category"
            defaultValue={categoryId ?? ""}
            className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
          >
            <option value="">All categories</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </div>

      {data.events.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
          <p className="text-base font-semibold">No upcoming events found</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Published public events will appear here as soon as they are ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-colors hover:bg-muted/30"
            >
              {event.featured_image_url ? (
                <div
                  className="h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.featured_image_url})` }}
                  aria-hidden="true"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-muted text-muted-foreground">
                  <CalendarDays className="h-10 w-10" aria-hidden="true" />
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {event.category?.name ?? "Event"}
                  </span>
                  <EventVisibilityBadge visibility={event.visibility} />
                </div>
                <h2 className="mt-4 text-lg font-semibold group-hover:underline">
                  {event.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {event.summary ?? event.description ?? "Event details coming soon."}
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {formatDate(event.starts_at)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {event.venue ?? "Venue to be confirmed"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
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
                categoryId,
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
                categoryId,
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
