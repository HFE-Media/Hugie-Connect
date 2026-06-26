"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createMembershipAdminService } from "@/services/membership/service";
import type { MembershipApplicationActionState } from "@/features/membership/state";

const publicMembershipApplicationFormSchema = z.object({
  organisationId: z.string().uuid(),
  membershipTypeId: z.string().uuid({
    message: "Select a membership type.",
  }),
  firstName: z.string().trim().min(1, "First name is required.").max(120),
  lastName: z.string().trim().min(1, "Last name is required.").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .max(255),
  mobile: z.string().trim().max(40).optional(),
  termsAccepted: z.literal("on", {
    errorMap: () => ({ message: "Accept the terms to submit your application." }),
  }),
});

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitMembershipApplicationAction(
  _state: MembershipApplicationActionState,
  formData: FormData,
): Promise<MembershipApplicationActionState> {
  const result = publicMembershipApplicationFormSchema.safeParse({
    organisationId: readString(formData, "organisationId"),
    membershipTypeId: readString(formData, "membershipTypeId"),
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    email: readString(formData, "email"),
    mobile: readString(formData, "mobile"),
    termsAccepted: readString(formData, "termsAccepted"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const values = result.data;
  const service = createMembershipAdminService();

  try {
    await service.createMembershipApplication({
      organisationId: values.organisationId,
      membershipTypeId: values.membershipTypeId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      mobile: values.mobile || null,
      applicationData: {
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        source: "public_membership_application",
      },
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Your application could not be submitted. Please try again.",
    };
  }

  redirect("/membership/apply/success");
}
