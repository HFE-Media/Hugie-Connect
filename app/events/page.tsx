import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { PublicEventsList } from "@/components/events/public-events-list";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { PublicServiceState } from "@/components/public/public-service-state";
import { logger } from "@/lib/logger";
import { createEventsService } from "@/services/events/service";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { PublicEventsPage } from "@/types/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming school and community events available through Hugie Connect.",
  openGraph: {
    title: "Community events | Hugie Connect",
    description: "Find upcoming events, dates, venues and ticket information.",
  },
};

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
  let data: PublicEventsPage | null = null;

  try {
    data = await service.listPublicEvents({
      search,
      categoryId,
      page,
      pageSize: 9,
    });
  } catch (error) {
    logger.warn("Public events page unavailable", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return (
    <PublicPageShell>
      <main>
        <section className="border-b bg-card">
          <div className="container py-10 sm:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-secondary">Community calendar</p>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarDays className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Upcoming events</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Find the next opportunity to gather, take part and stay connected.
                Event times are shown in South African Standard Time.
              </p>
            </div>
          </div>
        </section>

        {data ? (
          <div className="container py-10 sm:py-12">
            <PublicEventsList data={data} categoryId={categoryId} search={search} />
          </div>
        ) : (
          <PublicServiceState
            title="Events are temporarily unavailable"
            description="We could not load the event calendar right now. Please try again shortly or contact us if you need event information today."
          />
        )}
      </main>
    </PublicPageShell>
  );
}
