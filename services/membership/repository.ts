import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type {
  ApprovedMembershipApplicationResult,
  ApproveMembershipApplicationInput,
  CreateMembershipApplicationInput,
  MemberAdminStatusFilter,
  MembershipRenewalFilter,
  MembershipApplicationStatus,
  ReissueMembershipCardInput,
  RenewMemberInput,
  RevokeMembershipCardInput,
  UpdateMemberStatusInput,
  UpdateMembershipApplicationReviewInput,
} from "@/types/membership";

export type MembershipRepositoryClient = SupabaseClient<Database>;

export function createMembershipRepository(client: MembershipRepositoryClient) {
  return {
    async listActiveOrganisations() {
      return client
        .from("organisations")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true });
    },

    async getUserByAuthUserId(authUserId: string) {
      return client
        .from("users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();
    },

    async listUsersByEmail(email: string) {
      return client
        .from("users")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: true });
    },

    async createUser(input: {
      authUserId: string;
      organisationId: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
    }) {
      return client
        .from("users")
        .insert({
          auth_user_id: input.authUserId,
          organisation_id: input.organisationId,
          first_name: input.firstName ?? null,
          last_name: input.lastName ?? null,
          email: input.email,
          status: "active",
        })
        .select("*")
        .single();
    },

    async updateUserOrganisation(params: {
      userId: string;
      organisationId: string;
    }) {
      return client
        .from("users")
        .update({ organisation_id: params.organisationId })
        .eq("id", params.userId)
        .is("organisation_id", null)
        .select("*")
        .single();
    },

    async updateUserAuthIdentity(params: {
      userId: string;
      authUserId: string;
      organisationId: string;
    }) {
      return client
        .from("users")
        .update({ auth_user_id: params.authUserId })
        .eq("id", params.userId)
        .eq("organisation_id", params.organisationId)
        .or(`auth_user_id.is.null,auth_user_id.eq.${params.authUserId}`)
        .select("*")
        .single();
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

    async listMembershipApplicationsForAdmin(params: {
      organisationId: string;
      status?: MembershipApplicationStatus;
      search?: string;
      page: number;
      pageSize: number;
    }) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      let query = client
        .from("membership_applications")
        .select("*", { count: "exact" })
        .eq("organisation_id", params.organisationId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (params.status) {
        query = query.eq("status", params.status);
      }

      if (params.search) {
        const searchTerms = params.search
          .replaceAll(",", " ")
          .split(/\s+/)
          .map((term) => term.trim())
          .filter(Boolean);

        searchTerms.forEach((term) => {
          query = query.or(
            `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`,
          );
        });
      }

      return query;
    },

    async listMembershipTypesByIds(params: {
      organisationId: string;
      ids: string[];
    }) {
      if (params.ids.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("membership_types")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .in("id", params.ids);
    },

    async listUsersByIds(params: { organisationId: string; ids: string[] }) {
      if (params.ids.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("users")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .in("id", params.ids);
    },

    async listMembershipApplicationsBySearch(params: {
      organisationId: string;
      search: string;
    }) {
      return client
        .from("membership_applications")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .or(
          `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`,
        )
        .limit(100);
    },

    async listApprovedApplicationsByEmail(params: {
      email: string;
      organisationId: string;
    }) {
      return client
        .from("membership_applications")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("status", "approved")
        .eq("email", params.email)
        .order("reviewed_at", { ascending: false });
    },

    async listUnlinkedMembersByApplicationIds(params: {
      applicationIds: string[];
      organisationId: string;
    }) {
      if (params.applicationIds.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("members")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .is("user_id", null)
        .in("status", ["active", "pending"])
        .in("membership_application_id", params.applicationIds)
        .order("approved_at", { ascending: false });
    },

    async listUsersBySearch(params: { organisationId: string; search: string }) {
      return client
        .from("users")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .or(
          `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`,
        )
        .limit(100);
    },

    async listMembersForAdmin(params: {
      organisationId: string;
      status?: MemberAdminStatusFilter;
      search?: string;
      applicationIds?: string[];
      userIds?: string[];
      page: number;
      pageSize: number;
    }) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      const now = new Date().toISOString();
      let query = client
        .from("members")
        .select("*", { count: "exact" })
        .eq("organisation_id", params.organisationId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (params.status === "active") {
        query = query
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${now}`);
      } else if (params.status === "pending") {
        query = query.eq("status", "pending");
      } else if (params.status === "suspended") {
        query = query.eq("status", "suspended");
      } else if (params.status === "inactive") {
        query = query.eq("status", "cancelled");
      } else if (params.status === "expired") {
        query = query.or(`status.eq.expired,expires_at.lte.${now}`);
      }

      if (params.search) {
        const searchFilters = [`member_number.ilike.%${params.search}%`];

        if (params.applicationIds?.length) {
          searchFilters.push(
            `membership_application_id.in.(${params.applicationIds.join(",")})`,
          );
        }

        if (params.userIds?.length) {
          searchFilters.push(`user_id.in.(${params.userIds.join(",")})`);
        }

        query = query.or(searchFilters.join(","));
      }

      return query;
    },

    async listRenewedRecentlyMemberIds(params: {
      organisationId: string;
      since: string;
    }) {
      return client
        .from("audit_logs")
        .select("entity_id")
        .eq("organisation_id", params.organisationId)
        .eq("entity_type", "member")
        .eq("action", "member_renewed")
        .gte("created_at", params.since)
        .limit(500);
    },

    async listMembersForRenewalAdmin(params: {
      organisationId: string;
      filter?: MembershipRenewalFilter;
      search?: string;
      applicationIds?: string[];
      userIds?: string[];
      renewedMemberIds?: string[];
      expiringSoonDays: number;
      page: number;
      pageSize: number;
    }) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      const now = new Date();
      const nowIso = now.toISOString();
      const soon = new Date(now);
      soon.setDate(soon.getDate() + params.expiringSoonDays);

      let query = client
        .from("members")
        .select("*", { count: "exact" })
        .eq("organisation_id", params.organisationId)
        .neq("status", "cancelled")
        .order("expires_at", { ascending: true, nullsFirst: false })
        .range(from, to);

      if (params.filter === "active") {
        query = query
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
      } else if (params.filter === "expiring_soon") {
        query = query
          .eq("status", "active")
          .not("expires_at", "is", null)
          .gte("expires_at", nowIso)
          .lte("expires_at", soon.toISOString());
      } else if (params.filter === "expired") {
        query = query.or(`status.eq.expired,expires_at.lte.${nowIso}`);
      } else if (params.filter === "renewed_recently") {
        if (!params.renewedMemberIds?.length) {
          return { data: [], error: null, count: 0 };
        }

        query = query.in("id", params.renewedMemberIds);
      } else {
        query = query.in("status", ["active", "expired", "suspended"]);
      }

      if (params.search) {
        const searchFilters = [`member_number.ilike.%${params.search}%`];

        if (params.applicationIds?.length) {
          searchFilters.push(
            `membership_application_id.in.(${params.applicationIds.join(",")})`,
          );
        }

        if (params.userIds?.length) {
          searchFilters.push(`user_id.in.(${params.userIds.join(",")})`);
        }

        query = query.or(searchFilters.join(","));
      }

      return query;
    },

    async listMembershipApplicationsByIds(params: {
      organisationId: string;
      ids: string[];
    }) {
      if (params.ids.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("membership_applications")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .in("id", params.ids);
    },

    async listMembershipPeriodsByMemberIds(params: {
      organisationId: string;
      memberIds: string[];
    }) {
      if (params.memberIds.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("membership_periods")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .in("member_id", params.memberIds)
        .order("starts_at", { ascending: false });
    },

    async listMembershipCardsByMemberIds(params: {
      organisationId: string;
      memberIds: string[];
    }) {
      if (params.memberIds.length === 0) {
        return { data: [], error: null };
      }

      return client
        .from("membership_cards")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .in("member_id", params.memberIds)
        .order("issued_at", { ascending: false });
    },

    async getMembershipCardByQrToken(qrToken: string) {
      return client
        .from("membership_cards")
        .select("*")
        .eq("qr_token", qrToken)
        .maybeSingle();
    },

    async getActiveMembershipCardForMember(params: {
      organisationId: string;
      memberId: string;
    }) {
      return client
        .from("membership_cards")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("member_id", params.memberId)
        .eq("card_status", "active")
        .order("issued_at", { ascending: false });
    },

    async revokeActiveMembershipCard(input: RevokeMembershipCardInput & {
      cardId: string;
      revokedAt: string;
    }) {
      return client
        .from("membership_cards")
        .update({
          card_status: "revoked",
          revoked_at: input.revokedAt,
        })
        .eq("id", input.cardId)
        .eq("member_id", input.memberId)
        .eq("organisation_id", input.organisationId)
        .eq("card_status", "active")
        .select("*")
        .single();
    },

    async createReplacementMembershipCard(input: ReissueMembershipCardInput & {
      qrToken: string;
    }) {
      return client
        .from("membership_cards")
        .insert({
          organisation_id: input.organisationId,
          member_id: input.memberId,
          qr_token: input.qrToken,
          card_status: "active",
          regenerated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
    },

    async linkMemberToUser(params: {
      memberId: string;
      userId: string;
      organisationId: string;
    }) {
      return client
        .from("members")
        .update({ user_id: params.userId })
        .eq("id", params.memberId)
        .eq("organisation_id", params.organisationId)
        .is("user_id", null)
        .select("*")
        .single();
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
        .in("status", ["active", "pending", "suspended", "expired"])
        .order("created_at", { ascending: false });
    },

    async listAuditLogsForMember(params: {
      organisationId: string;
      memberId: string;
    }) {
      return client
        .from("audit_logs")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("entity_type", "member")
        .eq("entity_id", params.memberId)
        .order("created_at", { ascending: false })
        .limit(20);
    },

    async updateMemberStatus(input: UpdateMemberStatusInput) {
      return client
        .from("members")
        .update({
          status: input.status,
          cancelled_at: null,
        })
        .eq("id", input.memberId)
        .eq("organisation_id", input.organisationId)
        .select("*")
        .single();
    },

    async listOverlappingActiveMembershipPeriods(params: {
      organisationId: string;
      memberId: string;
      startsAt: string;
      endsAt: string;
    }) {
      return client
        .from("membership_periods")
        .select("*")
        .eq("organisation_id", params.organisationId)
        .eq("member_id", params.memberId)
        .eq("status", "active")
        .lt("starts_at", params.endsAt)
        .gt("ends_at", params.startsAt);
    },

    async createMembershipPeriod(input: {
      organisationId: string;
      memberId: string;
      startsAt: string;
      endsAt: string;
      source: string;
    }) {
      return client
        .from("membership_periods")
        .insert({
          organisation_id: input.organisationId,
          member_id: input.memberId,
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          status: "active",
          source: input.source,
        })
        .select("*")
        .single();
    },

    async updateMemberRenewal(input: RenewMemberInput & { status: "active" | "suspended" }) {
      return client
        .from("members")
        .update({
          expires_at: input.periodEndsAt.toISOString(),
          status: input.status,
        })
        .eq("id", input.memberId)
        .eq("organisation_id", input.organisationId)
        .select("*")
        .single();
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
