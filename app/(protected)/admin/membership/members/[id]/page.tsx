import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminMemberActions } from "@/components/membership/admin-member-actions";
import { AdminMemberDetail } from "@/components/membership/admin-member-detail";
import { Button } from "@/components/ui/button";
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
    <main className="container space-y-6 py-8">
      <div>
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/admin/membership/members">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Members
          </Link>
        </Button>
      </div>

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
