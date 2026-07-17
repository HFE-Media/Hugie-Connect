import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { PublicEventsList } from "@/components/events/public-events-list";
import { Button } from "@/components/ui/button";
import { createEventsService } from "@/services/events/service";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = readParam(resolvedSearchParams, "q")?.trim() || undefined;
  const categoryId = readParam(resolvedSearchParams, "category") || undefined;
  const page = parsePage(readParam(resolvedSearchParams, "page"));
  const service = createEventsService(await createSupabaseServerClient());
  const data = await service.listPublicEvents({
    search,
    categoryId,
    page,
    pageSize: 9,
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card">
        <div className="container py-8">
          <nav className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold">
              Hugie Connect
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarDays className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Events</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Browse published events. Ticket purchasing is coming in the next
              ticketing sprint.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <PublicEventsList data={data} categoryId={categoryId} search={search} />
      </div>
    </main>
  );
}
