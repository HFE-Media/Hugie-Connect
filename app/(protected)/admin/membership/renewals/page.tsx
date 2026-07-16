import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { AdminRenewalsTable } from "@/components/membership/admin-renewals-table";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";
import type { MembershipRenewalFilter } from "@/types/membership";

export const dynamic = "force-dynamic";

type AdminMembershipRenewalsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const filters: MembershipRenewalFilter[] = [
  "active",
  "expiring_soon",
  "expired",
  "renewed_recently",
];

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parseFilter(value?: string) {
  return filters.includes(value as MembershipRenewalFilter)
    ? (value as MembershipRenewalFilter)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminMembershipRenewalsPage({
  searchParams,
}: AdminMembershipRenewalsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filter = parseFilter(readParam(resolvedSearchParams, "filter"));
  const search = readParam(resolvedSearchParams, "q")?.trim() || undefined;
  const page = parsePage(readParam(resolvedSearchParams, "page"));
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:renew");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const data = await service.listRenewalsForAdmin({
    organisationId: appUser.organisation_id,
    filter,
    search,
    page,
    pageSize: 10,
    expiringSoonDays: 30,
  });

  return (
    <main className="container py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-3 mb-3">
          <Link href="/admin">Admin</Link>
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <RefreshCw className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">
          Membership renewals
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Extend existing memberships without creating duplicate members,
          applications, cards, or QR codes. Expiring soon means within{" "}
          {data.expiringSoonDays} days.
        </p>
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

      <AdminRenewalsTable data={data} filter={filter} search={search} />
    </main>
  );
}
