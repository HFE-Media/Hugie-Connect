import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { AdminEventForm } from "@/components/events/admin-event-form";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
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
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Create event"
        description="Start with a draft and publish when every detail is ready."
        icon={CalendarPlus}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Events", href: "/admin/events" }, { label: "Create event" }]}
      />
      <section className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
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
