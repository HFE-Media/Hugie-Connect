import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { AdminApplicationsTable } from "@/components/membership/admin-applications-table";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Button } from "@/components/ui/button";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
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
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Membership applications"
        description="Review submitted applications for your organisation."
        icon={ClipboardList}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Membership" }, { label: "Applications" }]}
      />

      <FeedbackAlert tone="success" message={success} className="mb-5" />
      <FeedbackAlert tone="error" message={error ? `${error} Please review the application and try again.` : null} className="mb-5" />

      <AdminApplicationsTable data={data} status={status} search={search} />
    </main>
  );
}
