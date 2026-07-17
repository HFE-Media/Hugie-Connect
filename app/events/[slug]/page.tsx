import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { EventVisibilityBadge } from "@/components/events/event-status-badge";
import { PublicEventTicketTypes } from "@/components/events/public-event-ticket-types";
import { Button } from "@/components/ui/button";
import { createEventsService } from "@/services/events/service";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDateRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startsAt))} - ${formatter.format(
    new Date(endsAt),
  )}`;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const service = createEventsService(await createSupabaseServerClient());
  const event = await service.getPublicEventBySlug(slug);

  if (!event || event.status !== "published") {
    notFound();
  }

  const ticketTypes = await service.listPublicTicketTypes(event.id);

  return (
    <main className="min-h-screen bg-background">
      {event.featured_image_url ? (
        <div
          className="h-64 bg-cover bg-center sm:h-80"
          style={{ backgroundImage: `url(${event.featured_image_url})` }}
          aria-hidden="true"
        />
      ) : null}

      <div className="container py-8">
        <Button asChild variant="ghost" className="-ml-3 mb-6">
          <Link href="/events">Events</Link>
        </Button>

        <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {event.category?.name ?? "Event"}
              </span>
              <EventVisibilityBadge visibility={event.visibility} />
            </div>

            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              {event.title}
            </h1>
            {event.summary ? (
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {event.summary}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Date and time
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDateRange(event.starts_at, event.ends_at)}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Venue
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.venue ?? "Venue to be confirmed"}
                </p>
              </div>
            </div>

            <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
              <p className="whitespace-pre-line">
                {event.description ?? "More event details will be added soon."}
              </p>
            </div>
          </section>

          <PublicEventTicketTypes
            ticketTypes={ticketTypes}
            capacity={event.capacity}
          />
        </article>
      </div>
    </main>
  );
}
