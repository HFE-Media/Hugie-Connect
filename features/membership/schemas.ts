import { z } from "zod";

export const membershipTypeStatusSchema = z.enum([
  "active",
  "inactive",
  "archived",
]);

export const membershipBillingCycleSchema = z.enum([
  "once_off",
  "monthly",
  "annual",
]);

export const membershipApplicationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const memberStatusSchema = z.enum([
  "pending",
  "active",
  "suspended",
  "expired",
  "cancelled",
]);

export const createMembershipApplicationSchema = z.object({
  organisationId: z.string().uuid(),
  membershipTypeId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  mobile: z.string().trim().max(40).optional().nullable(),
  applicationData: z.record(z.unknown()).optional(),
});

export const listMembershipApplicationsSchema = z.object({
  organisationId: z.string().uuid(),
  status: membershipApplicationStatusSchema.optional(),
});

export const updateMembershipApplicationReviewSchema = z
  .object({
    organisationId: z.string().uuid(),
    applicationId: z.string().uuid(),
    reviewedByUserId: z.string().uuid(),
    status: z.enum(["rejected", "cancelled"]),
    rejectionReason: z.string().trim().max(500).optional().nullable(),
  })
  .superRefine((value, context) => {
    if (value.status === "rejected" && !value.rejectionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A rejection reason is required when rejecting an application.",
        path: ["rejectionReason"],
      });
    }
  });

export const approveMembershipApplicationSchema = z
  .object({
    organisationId: z.string().uuid(),
    applicationId: z.string().uuid(),
    reviewedByUserId: z.string().uuid(),
    memberNumber: z.string().trim().min(1).max(80),
    periodStartsAt: z.coerce.date(),
    periodEndsAt: z.coerce.date(),
  })
  .superRefine((value, context) => {
    if (value.periodEndsAt <= value.periodStartsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Membership period end must be after the start date.",
        path: ["periodEndsAt"],
      });
    }
  });

export type CreateMembershipApplicationValues = z.infer<
  typeof createMembershipApplicationSchema
>;

export type ListMembershipApplicationsValues = z.infer<
  typeof listMembershipApplicationsSchema
>;

export type UpdateMembershipApplicationReviewValues = z.infer<
  typeof updateMembershipApplicationReviewSchema
>;

export type ApproveMembershipApplicationValues = z.infer<
  typeof approveMembershipApplicationSchema
>;
