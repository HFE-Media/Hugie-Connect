"use server";

import { z } from "zod";

import { requirePermission } from "@/services/auth/server";
import { createMembershipAdminService } from "@/services/membership/service";
import type { MembershipVerificationResult } from "@/types/membership";

const verifyMembershipQrSchema = z.object({
  payload: z.string().trim().min(1).max(512),
});

export async function verifyMembershipQrAction(
  payload: string,
): Promise<MembershipVerificationResult> {
  const profile = await requirePermission("membership:verify");
  const result = verifyMembershipQrSchema.safeParse({ payload });

  if (!result.success) {
    return {
      tone: "invalid",
      title: "Invalid QR",
      message: "Enter or scan a membership QR code.",
    };
  }

  return createMembershipAdminService().verifyMembershipQrPayload({
    payload: result.data.payload,
    verifierAuthUserId: profile.id,
    canVerifyAllOrganisations: profile.roles.includes("super_admin"),
  });
}
