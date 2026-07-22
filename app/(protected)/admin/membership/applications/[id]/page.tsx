import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";

import { AdminApplicationDetail } from "@/components/membership/admin-application-detail";
import { AdminApplicationReviewForms } from "@/components/membership/admin-application-review-forms";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
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
    <main className="container space-y-6 py-6 sm:py-8">
      <ProtectedPageHeader
        title={`${application.first_name} ${application.last_name}`}
        description="Review the application details and record a decision."
        icon={ClipboardList}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Membership" }, { label: "Applications", href: "/admin/membership/applications" }, { label: "Application" }]}
      />

      <FeedbackAlert tone="success" message={success} />
      <FeedbackAlert tone="error" message={error ? `${error} Review the decision details and try again.` : null} />

      <AdminApplicationDetail application={application} />
      <AdminApplicationReviewForms application={application} />
    </main>
  );
}
