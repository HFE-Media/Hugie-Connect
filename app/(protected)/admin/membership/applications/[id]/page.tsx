import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminApplicationDetail } from "@/components/membership/admin-application-detail";
import { AdminApplicationReviewForms } from "@/components/membership/admin-application-review-forms";
import { Button } from "@/components/ui/button";
import { toAppError } from "@/lib/errors";
import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";

export const dynamic = "force-dynamic";

type AdminMembershipApplicationDetailPageProps = {
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

export default async function AdminMembershipApplicationDetailPage({
  params,
  searchParams,
}: AdminMembershipApplicationDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readParam(resolvedSearchParams, "success");
  const error = readParam(resolvedSearchParams, "error");
  const profile = await requirePermission("membership:applications:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  let application;

  try {
    application = await service.getMembershipApplicationForAdmin({
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
          <Link href="/admin/membership/applications">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Applications
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

      <AdminApplicationDetail application={application} />
      <AdminApplicationReviewForms application={application} />
    </main>
  );
}
