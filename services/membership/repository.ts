import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type {
  CreateMembershipApplicationInput,
  MembershipApplicationStatus,
} from "@/types/membership";

export type MembershipRepositoryClient = SupabaseClient<Database>;

export function createMembershipRepository(client: MembershipRepositoryClient) {
  return {
    async listMembershipTypes(organisationId: string) {
      return client
        .from("membership_types")
        .select("*")
        .eq("organisation_id", organisationId)
        .order("name", { ascending: true });
    },

    async getMembershipTypeById(id: string) {
      return client
        .from("membership_types")
        .select("*")
        .eq("id", id)
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

    async getMemberById(id: string) {
      return client.from("members").select("*").eq("id", id).maybeSingle();
    },

    async getMemberByUserId(userId: string) {
      return client
        .from("members")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    },
  };
}
