import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";

import { AdminMemberActions } from "@/components/membership/admin-member-actions";
import { AdminMemberDetail } from "@/components/membership/admin-member-detail";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { toAppError } from "@/lib/errors";
import { hasPermission } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";

export const dynamic = "force-dynamic";

type AdminMembershipMemberDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminMembershipMemberDetailPage({
  params,
  searchParams,
}: AdminMembershipMemberDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:members:manage");
  const canManageCards = hasPermission(profile.roles, "membership:cards:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  let member;

  try {
    member = await service.getMemberForAdmin({
      id,
      organisationId: appUser.organisation_id,
    });
  } catch (caughtError) {
    const appError = toAppError(caughtError);

    if (appError.code === "NOT_FOUND") {
      notFound();
    }

    throw caughtError;
  }

  return (
    <main className="container space-y-6 py-6 sm:py-8">
      <ProtectedPageHeader
        title={member.memberName}
        description={`Member ${member.member_number}`}
        icon={UserRound}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Membership" }, { label: "Members", href: "/admin/membership/members" }, { label: "Member" }]}
      />

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <AdminMemberActions member={member} />
      <AdminMemberDetail member={member} canManageCards={canManageCards} />
    </main>
  );
}
