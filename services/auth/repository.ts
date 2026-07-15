import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type AuthRepositoryClient = SupabaseClient<Database>;

export function createAuthRepository(client: AuthRepositoryClient) {
  return {
    async getUserByAuthUserId(authUserId: string) {
      return client
        .from("users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();
    },

    async listRoleNamesForUser(params: {
      userId: string;
      organisationId: string | null;
    }) {
      let userRolesQuery = client
        .from("user_roles")
        .select("role_id")
        .eq("user_id", params.userId);

      userRolesQuery = params.organisationId
        ? userRolesQuery.or(
            `organisation_id.is.null,organisation_id.eq.${params.organisationId}`,
          )
        : userRolesQuery.is("organisation_id", null);

      const { data: userRoles, error: userRolesError } = await userRolesQuery;

      if (userRolesError) {
        return { data: null, error: userRolesError };
      }

      const roleIds = Array.from(
        new Set(userRoles.map((assignment) => assignment.role_id)),
      );

      if (roleIds.length === 0) {
        return { data: [], error: null };
      }

      const { data: roles, error: rolesError } = await client
        .from("roles")
        .select("name")
        .in("id", roleIds);

      if (rolesError) {
        return { data: null, error: rolesError };
      }

      return {
        data: roles.map((role) => role.name),
        error: null,
      };
    },
  };
}
