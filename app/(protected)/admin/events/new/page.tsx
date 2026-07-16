import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { AdminEventForm } from "@/components/events/admin-event-form";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";

export const dynamic = "force-dynamic";

type NewEventPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("events:manage");
  const service = createEventsAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const categories = await service.listCategories(appUser.organisation_id);

  return (
    <main className="container py-8">
      <Button asChild variant="ghost" className="-ml-3 mb-4">
        <Link href="/admin/events">Events</Link>
      </Button>
      <section className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CalendarPlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Create event</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Start with a draft. Publish only when the details are ready.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <AdminEventForm categories={categories} />
      </section>
    </main>
  );
}
