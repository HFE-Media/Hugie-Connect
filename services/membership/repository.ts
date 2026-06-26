import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type {
  ApprovedMembershipApplicationResult,
  ApproveMembershipApplicationInput,
  CreateMembershipApplicationInput,
  MembershipApplicationStatus,
  UpdateMembershipApplicationReviewInput,
} from "@/types/membership";

export type MembershipRepositoryClient = SupabaseClient<Database>;

export function createMembershipRepository(client: MembershipRepositoryClient) {
  return {
    async getUserByAuthUserId(authUserId: string) {
      return client
        .from("users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();
    },

    async listActiveOrganisations() {
      return client
        .from("organisations")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true });
    },

    async getActiveOrganisationById(id: string) {
      return client
        .from("organisations")
        .select("*")
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle();
    },

    async listMembershipTypes(organisationId: string) {
      return client
        .from("membership_types")
        .select("*")
        .eq("organisation_id", organisationId)
        .order("name", { ascending: true });
    },

    async getMembershipTypeById(params: {
      id: string;
      organisationId: string;
    }) {
      return client
        .from("membership_types")
        .select("*")
        .eq("id", params.id)
        .eq("organisation_id", params.organisationId)
        .maybeSingle();
    },

    async createMembershipApplication(input: CreateMembershipApplicationInput) {
      return client
        .from("membership_applications")
        .insert({
          organisation_id: input.organisationId,
          membership_type_id: input.membershipTypeId,
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          mobile: input.mobile ?? null,
          application_data: (input.applicationData ?? {}) as Json,
        })
        .select("*")
        .single();
    },

    async getMembershipApplicationById(params: {
      id: string;
      organisationId: string;
    }) {
      return client
        .from("membership_applications")
        .select("*")
        .eq("id", params.id)
        .eq("organisation_id", params.organisationId)
        .maybeSingle();
    },

    async listMembershipApplications(params: {
      organisationId: string;
      status?: MembershipApplicationStatus;
    }) {
      let query = client
        .from("membership_applications")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .order("created_at", { ascending: false });

      if (params.status) {
        query = query.eq("status", params.status);
      }

      return query;
    },

    async updateMembershipApplicationReview(
      input: UpdateMembershipApplicationReviewInput,
    ) {
      return client
        .from("membership_applications")
        .update({
          status: input.status,
          reviewed_by: input.reviewedByUserId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: input.rejectionReason ?? null,
        })
        .eq("id", input.applicationId)
        .eq("organisation_id", input.organisationId)
        .eq("status", "pending")
        .select("*")
        .single();
    },

    async approveMembershipApplication(
      input: ApproveMembershipApplicationInput & { qrToken?: string | null },
    ) {
      return client.rpc("approve_membership_application", {
        p_application_id: input.applicationId,
        p_organisation_id: input.organisationId,
        p_reviewed_by: input.reviewedByUserId,
        p_member_number: input.memberNumber,
        p_period_starts_at: input.periodStartsAt.toISOString(),
        p_period_ends_at: input.periodEndsAt.toISOString(),
        p_qr_token: input.qrToken ?? null,
      });
    },

    async createAuditLog(input: {
      organisationId: string;
      userId: string | null;
      action: string;
      entityType: string;
      entityId: string;
      oldValues?: Json | null;
      newValues?: Json | null;
    }) {
      return client.from("audit_logs").insert({
        organisation_id: input.organisationId,
        user_id: input.userId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        old_values: input.oldValues ?? null,
        new_values: input.newValues ?? null,
      });
    },

    async getMemberById(params: { id: string; organisationId: string }) {
      return client
        .from("members")
        .select("*")
        .eq("id", params.id)
        .eq("organisation_id", params.organisationId)
        .maybeSingle();
    },

    async getMemberByUserId(params: {
      userId: string;
      organisationId: string;
    }) {
      return client
        .from("members")
        .select("*")
        .eq("user_id", params.userId)
        .eq("organisation_id", params.organisationId)
        .order("created_at", { ascending: false });
    },

    async listOwnVisibleMembers(params: {
      userId: string;
      organisationId: string;
    }) {
      return client
        .from("members")
        .select("*")
        .eq("user_id", params.userId)
        .eq("organisation_id", params.organisationId)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false });
    },

    async listMembershipPeriodsByMemberId(params: {
      memberId: string;
      organisationId: string;
    }) {
      return client
        .from("membership_periods")
        .select("*")
        .eq("member_id", params.memberId)
        .eq("organisation_id", params.organisationId)
        .order("starts_at", { ascending: false });
    },
  };
}

export function mapApprovedMembershipApplicationResult(
  rows:
    | Database["public"]["Functions"]["approve_membership_application"]["Returns"]
    | null,
): ApprovedMembershipApplicationResult | null {
  const row = rows?.[0];

  if (!row) {
    return null;
  }

  return {
    applicationId: row.application_id,
    memberId: row.member_id,
    membershipPeriodId: row.membership_period_id,
    membershipCardId: row.membership_card_id,
  };
}
