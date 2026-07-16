import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminMemberDetail } from "@/components/membership/admin-member-detail";
import { AdminRenewalForm } from "@/components/membership/admin-renewal-form";
import { AdminRenewalStatusBadge } from "@/components/membership/admin-renewal-status-badge";
import { Button } from "@/components/ui/button";
import { toAppError } from "@/lib/errors";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";

export const dynamic = "force-dynamic";

type AdminMembershipRenewalDetailPageProps = {
  params: Promise<{ memberId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminMembershipRenewalDetailPage({
  params,
  searchParams,
}: AdminMembershipRenewalDetailPageProps) {
  const { memberId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:renew");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  let member;

  try {
    member = await service.getRenewalForAdmin({
      id: memberId,
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
          <Link href="/admin/membership/renewals">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Renewals
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

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Renewal status
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{member.memberName}</h1>
          </div>
          <AdminRenewalStatusBadge status={member.renewalStatus} />
        </div>
      </section>

      <AdminRenewalForm member={member} />
      <AdminMemberDetail member={member} />
    </main>
  );
}
