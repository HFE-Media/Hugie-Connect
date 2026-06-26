import type { Database } from "@/types/database";

export type MembershipTypeStatus = "active" | "inactive" | "archived";
export type MembershipBillingCycle = "once_off" | "monthly" | "annual";
export type MembershipApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
export type MemberStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled";
export type MembershipPeriodStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled";
export type MembershipCardStatus = "active" | "revoked" | "expired";

export type MembershipType =
  Database["public"]["Tables"]["membership_types"]["Row"];
export type MembershipOrganisation =
  Database["public"]["Tables"]["organisations"]["Row"];
export type MembershipApplication =
  Database["public"]["Tables"]["membership_applications"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type MembershipPeriod =
  Database["public"]["Tables"]["membership_periods"]["Row"];
export type MembershipCard =
  Database["public"]["Tables"]["membership_cards"]["Row"];
export type MembershipUser = Database["public"]["Tables"]["users"]["Row"];

export type MemberMembershipSummary = {
  member: Member;
  memberUser: MembershipUser;
  organisation: MembershipOrganisation;
  membershipType: MembershipType;
  currentPeriod: MembershipPeriod | null;
};

export type CreateMembershipApplicationInput = {
  organisationId: string;
  membershipTypeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string | null;
  applicationData?: Record<string, unknown>;
};

export type UpdateMembershipApplicationReviewInput = {
  organisationId: string;
  applicationId: string;
  reviewedByUserId: string;
  status: "rejected" | "cancelled";
  rejectionReason?: string | null;
};

export type ApproveMembershipApplicationInput = {
  organisationId: string;
  applicationId: string;
  reviewedByUserId: string;
  memberNumber: string;
  periodStartsAt: Date;
  periodEndsAt: Date;
};

export type ApprovedMembershipApplicationResult = {
  applicationId: string;
  memberId: string;
  membershipPeriodId: string;
  membershipCardId: string;
};
