"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSafeErrorMessage } from "@/lib/errors";
import { createMembershipAdminService } from "@/services/membership/service";
import { requirePermission } from "@/services/auth/server";

const approveApplicationFormSchema = z
  .object({
    applicationId: z.string().uuid(),
    memberNumber: z.string().trim().min(1, "Member number is required.").max(80),
    periodStartsAt: z.coerce.date({
      required_error: "Start date is required.",
      invalid_type_error: "Enter a valid start date.",
    }),
    periodEndsAt: z.coerce.date({
      required_error: "End date is required.",
      invalid_type_error: "Enter a valid end date.",
    }),
  })
  .superRefine((value, context) => {
    if (value.periodEndsAt <= value.periodStartsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after the start date.",
        path: ["periodEndsAt"],
      });
    }
  });

const reviewApplicationFormSchema = z.object({
  applicationId: z.string().uuid(),
  rejectionReason: z.string().trim().max(500).optional(),
});

const updateMemberStatusFormSchema = z.object({
  memberId: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
});

const renewMemberFormSchema = z
  .object({
    memberId: z.string().uuid(),
    periodStartsAt: z.coerce.date({
      required_error: "Renewal start date is required.",
      invalid_type_error: "Enter a valid renewal start date.",
    }),
    periodEndsAt: z.coerce.date({
      required_error: "Renewal end date is required.",
      invalid_type_error: "Enter a valid renewal end date.",
    }),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, context) => {
    if (value.periodStartsAt >= value.periodEndsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Renewal end date must be after the start date.",
        path: ["periodEndsAt"],
      });
    }
  });

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function detailPath(applicationId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/membership/applications/${applicationId}?${searchParams.toString()}`;
}

function memberDetailPath(memberId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/membership/members/${memberId}?${searchParams.toString()}`;
}

function renewalDetailPath(memberId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/membership/renewals/${memberId}?${searchParams.toString()}`;
}

async function getAdminReviewContext() {
  const profile = await requirePermission("membership:applications:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  return { service, appUser };
}

async function getMemberAdminContext() {
  const profile = await requirePermission("membership:members:manage");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  return { service, appUser };
}

async function getRenewalAdminContext() {
  const profile = await requirePermission("membership:renew");
  const service = createMembershipAdminService();
  const appUser = await service.getAppUserByAuthUserId(profile.id);

  return { service, appUser };
}

export async function renewMemberAdminAction(formData: FormData) {
  const result = renewMemberFormSchema.safeParse({
    memberId: readString(formData, "memberId"),
    periodStartsAt: readString(formData, "periodStartsAt"),
    periodEndsAt: readString(formData, "periodEndsAt"),
    notes: readString(formData, "notes"),
  });

  if (!result.success) {
    const memberId = readString(formData, "memberId");
    const message =
      result.error.issues[0]?.message ?? "Check the renewal details.";
    redirect(renewalDetailPath(memberId, { error: message }));
  }

  const { service, appUser } = await getRenewalAdminContext();

  try {
    await service.renewMember({
      organisationId: appUser.organisation_id,
      memberId: result.data.memberId,
      reviewedByUserId: appUser.id,
      periodStartsAt: result.data.periodStartsAt,
      periodEndsAt: result.data.periodEndsAt,
      notes: result.data.notes || null,
    });

    revalidatePath("/admin/membership/renewals");
    revalidatePath(`/admin/membership/renewals/${result.data.memberId}`);
    revalidatePath("/admin/membership/members");
    revalidatePath(`/admin/membership/members/${result.data.memberId}`);
  } catch (error) {
    redirect(
      renewalDetailPath(result.data.memberId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    renewalDetailPath(result.data.memberId, {
      success: "Membership renewed.",
    }),
  );
}

export async function updateMemberStatusAdminAction(formData: FormData) {
  const result = updateMemberStatusFormSchema.safeParse({
    memberId: readString(formData, "memberId"),
    status: readString(formData, "status"),
  });

  if (!result.success) {
    const memberId = readString(formData, "memberId");
    redirect(memberDetailPath(memberId, { error: "Check the member action." }));
  }

  const { service, appUser } = await getMemberAdminContext();

  try {
    await service.updateMemberStatus({
      organisationId: appUser.organisation_id,
      memberId: result.data.memberId,
      reviewedByUserId: appUser.id,
      status: result.data.status,
    });

    revalidatePath("/admin/membership/members");
    revalidatePath(`/admin/membership/members/${result.data.memberId}`);
  } catch (error) {
    redirect(
      memberDetailPath(result.data.memberId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    memberDetailPath(result.data.memberId, {
      success:
        result.data.status === "suspended"
          ? "Member suspended."
          : "Member reactivated.",
    }),
  );
}

export async function approveMembershipApplicationAdminAction(
  formData: FormData,
) {
  const result = approveApplicationFormSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    memberNumber: readString(formData, "memberNumber"),
    periodStartsAt: readString(formData, "periodStartsAt"),
    periodEndsAt: readString(formData, "periodEndsAt"),
  });

  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Check the approval fields.";
    const applicationId = readString(formData, "applicationId");
    redirect(detailPath(applicationId, { error: message }));
  }

  const { service, appUser } = await getAdminReviewContext();

  try {
    await service.approveMembershipApplication({
      organisationId: appUser.organisation_id,
      applicationId: result.data.applicationId,
      reviewedByUserId: appUser.id,
      memberNumber: result.data.memberNumber,
      periodStartsAt: result.data.periodStartsAt,
      periodEndsAt: result.data.periodEndsAt,
    });

    revalidatePath("/admin/membership/applications");
    revalidatePath(`/admin/membership/applications/${result.data.applicationId}`);
  } catch (error) {
    redirect(
      detailPath(result.data.applicationId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    detailPath(result.data.applicationId, {
      success: "Membership application approved.",
    }),
  );
}

export async function rejectMembershipApplicationAdminAction(
  formData: FormData,
) {
  const result = reviewApplicationFormSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    rejectionReason: readString(formData, "rejectionReason"),
  });

  if (!result.success) {
    const applicationId = readString(formData, "applicationId");
    redirect(detailPath(applicationId, { error: "Enter a rejection reason." }));
  }

  const { service, appUser } = await getAdminReviewContext();

  try {
    await service.updateMembershipApplicationReview({
      organisationId: appUser.organisation_id,
      applicationId: result.data.applicationId,
      reviewedByUserId: appUser.id,
      status: "rejected",
      rejectionReason: result.data.rejectionReason,
    });

    revalidatePath("/admin/membership/applications");
    revalidatePath(`/admin/membership/applications/${result.data.applicationId}`);
  } catch (error) {
    redirect(
      detailPath(result.data.applicationId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    detailPath(result.data.applicationId, {
      success: "Membership application rejected.",
    }),
  );
}

export async function cancelMembershipApplicationAdminAction(
  formData: FormData,
) {
  const result = reviewApplicationFormSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    rejectionReason: readString(formData, "rejectionReason"),
  });

  if (!result.success) {
    const applicationId = readString(formData, "applicationId");
    redirect(detailPath(applicationId, { error: "Check the cancellation form." }));
  }

  const { service, appUser } = await getAdminReviewContext();

  try {
    await service.updateMembershipApplicationReview({
      organisationId: appUser.organisation_id,
      applicationId: result.data.applicationId,
      reviewedByUserId: appUser.id,
      status: "cancelled",
      rejectionReason: result.data.rejectionReason || null,
    });

    revalidatePath("/admin/membership/applications");
    revalidatePath(`/admin/membership/applications/${result.data.applicationId}`);
  } catch (error) {
    redirect(
      detailPath(result.data.applicationId, {
        error: getSafeErrorMessage(error),
      }),
    );
  }

  redirect(
    detailPath(result.data.applicationId, {
      success: "Membership application cancelled.",
    }),
  );
}
