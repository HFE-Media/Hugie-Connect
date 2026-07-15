import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { AdminApplicationsTable } from "@/components/membership/admin-applications-table";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";
import type { MembershipApplicationStatus } from "@/types/membership";

export const dynamic = "force-dynamic";

type AdminMembershipApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses: MembershipApplicationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value?: string) {
  return statuses.includes(value as MembershipApplicationStatus)
    ? (value as MembershipApplicationStatus)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminMembershipApplicationsPage({
  searchParams,
}: AdminMembershipApplicationsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = parseStatus(readParam(resolvedSearchParams, "status"));
  const search = readParam(resolvedSearchParams, "q")?.trim() || undefined;
  const page = parsePage(readParam(resolvedSearchParams, "page"));
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:applications:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const data = await service.listMembershipApplicationsForAdmin({
    organisationId: appUser.organisation_id,
    status,
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
            <ClipboardList className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">
            Membership applications
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review submitted applications for your organisation. Segment-specific
            OHB/HOK restrictions are not modelled yet, so access is currently
            organisation-scoped.
          </p>
        </div>
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

      <AdminApplicationsTable data={data} status={status} search={search} />
    </main>
  );
}
