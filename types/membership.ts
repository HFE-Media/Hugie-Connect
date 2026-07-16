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
export type MembershipAuditLog =
  Database["public"]["Tables"]["audit_logs"]["Row"];

export type MembershipCardDisplay = {
  status: MembershipCardStatus;
  qrValue: string | null;
  issuedAt: string | null;
};

export type MemberMembershipSummary = {
  member: Member;
  memberUser: MembershipUser;
  organisation: MembershipOrganisation;
  membershipType: MembershipType;
  currentPeriod: MembershipPeriod | null;
  membershipCard: MembershipCardDisplay | null;
};

export type LinkOwnMembershipResult =
  | { status: "linked"; memberId: string }
  | { status: "already_linked"; memberId: string }
  | { status: "no_match" }
  | { status: "multiple_matches" };

export type MembershipVerificationTone = "valid" | "warning" | "invalid";

export type MembershipVerificationResult = {
  tone: MembershipVerificationTone;
  title: string;
  message: string;
  memberName?: string;
  membershipTypeName?: string;
  memberNumber?: string;
  memberStatus?: MemberStatus;
  expiresAt?: string | null;
  organisationName?: string;
};

export type MemberAdminStatusFilter =
  | "active"
  | "pending"
  | "suspended"
  | "inactive"
  | "expired";
export type MembershipRenewalFilter =
  | "active"
  | "expiring_soon"
  | "expired"
  | "renewed_recently";

export type MembershipApplicationAdminSummary = MembershipApplication & {
  membershipTypeName: string;
  membershipTypeCode: string;
  reviewedByName: string | null;
  reviewedByEmail: string | null;
};

export type MembershipApplicationAdminDetail =
  MembershipApplicationAdminSummary & {
    membershipTypeDescription: string | null;
  };

export type MembershipApplicationsAdminPage = {
  applications: MembershipApplicationAdminSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type MemberAdminSummary = Member & {
  memberName: string;
  memberEmail: string | null;
  memberMobile: string | null;
  membershipTypeName: string;
  membershipTypeCode: string;
  linkedAccountEmail: string | null;
  currentCardStatus: MembershipCardStatus | null;
  currentPeriodStatus: MembershipPeriodStatus | null;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  derivedStatus: MemberAdminStatusFilter;
};

export type MembersAdminPage = {
  members: MemberAdminSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type MemberAdminDetail = MemberAdminSummary & {
  application: MembershipApplication | null;
  linkedAccountFirstName: string | null;
  linkedAccountLastName: string | null;
  linkedAccountStatus: string | null;
  membershipPeriods: MembershipPeriod[];
  membershipCards: Omit<MembershipCard, "qr_token">[];
  auditLogs: MembershipAuditLog[];
};

export type MemberRenewalSummary = MemberAdminSummary & {
  renewalStatus: MembershipRenewalFilter;
};

export type MemberRenewalsAdminPage = {
  members: MemberRenewalSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
  expiringSoonDays: number;
};

export type MemberRenewalDetail = MemberAdminDetail & {
  renewalStatus: MembershipRenewalFilter;
};

export type UpdateMemberStatusInput = {
  organisationId: string;
  memberId: string;
  reviewedByUserId: string;
  status: "active" | "suspended";
};

export type RenewMemberInput = {
  organisationId: string;
  memberId: string;
  reviewedByUserId: string;
  periodStartsAt: Date;
  periodEndsAt: Date;
  notes?: string | null;
};

export type RevokeMembershipCardInput = {
  organisationId: string;
  memberId: string;
  reviewedByUserId: string;
  reason: string;
};

export type ReissueMembershipCardInput = {
  organisationId: string;
  memberId: string;
  reviewedByUserId: string;
  reason: string;
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
