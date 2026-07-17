import Link from "next/link";
import { ArrowLeft, TicketCheck } from "lucide-react";

import { EventTicketScanner } from "@/components/events/event-ticket-scanner";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

export default async function EventTicketScannerPage() {
  const profile = await requirePermission("events:tickets:scan");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const events = await service.listEventsForTicketScanner(appUser.organisation_id);

  return (
    <main className="container py-6 sm:py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/scanner">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Scanner
          </Link>
        </Button>
      </div>

      <section className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <TicketCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal sm:text-3xl">
          Event ticket scanner
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Scan event ticket QR codes for the selected event. This does not
          verify membership cards or process payments.
        </p>
      </section>

      <EventTicketScanner events={events} />
    </main>
  );
}
