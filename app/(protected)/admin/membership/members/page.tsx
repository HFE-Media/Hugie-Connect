import Link from "next/link";
import { UsersRound } from "lucide-react";

import { AdminMembersTable } from "@/components/membership/admin-members-table";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";
import type { MemberAdminStatusFilter } from "@/types/membership";

export const dynamic = "force-dynamic";

type AdminMembershipMembersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses: MemberAdminStatusFilter[] = [
  "active",
  "pending",
  "suspended",
  "inactive",
  "expired",
];

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value?: string) {
  return statuses.includes(value as MemberAdminStatusFilter)
    ? (value as MemberAdminStatusFilter)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminMembershipMembersPage({
  searchParams,
}: AdminMembershipMembersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = parseStatus(readParam(resolvedSearchParams, "status"));
  const search = readParam(resolvedSearchParams, "q")?.trim() || undefined;
  const page = parsePage(readParam(resolvedSearchParams, "page"));
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:members:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);
  const data = await service.listMembersForAdmin({
    organisationId: appUser.organisation_id,
    status,
    search,
    page,
    pageSize: 10,
  });

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Members"
        description="Manage active members and their membership records."
        icon={UsersRound}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Membership" }, { label: "Members" }]}
      />

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

      <AdminMembersTable data={data} status={status} search={search} />
    </main>
  );
}
