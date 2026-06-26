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
  email: z.string().trim().email().max(255),
  mobile: z.string().trim().max(40).optional().nullable(),
  applicationData: z.record(z.unknown()).optional(),
});

export const listMembershipApplicationsSchema = z.object({
  organisationId: z.string().uuid(),
  status: membershipApplicationStatusSchema.optional(),
});

export type CreateMembershipApplicationValues = z.infer<
  typeof createMembershipApplicationSchema
>;

export type ListMembershipApplicationsValues = z.infer<
  typeof listMembershipApplicationsSchema
>;
