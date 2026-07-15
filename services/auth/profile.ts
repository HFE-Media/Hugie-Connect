import type { User } from "@supabase/supabase-js";

import { getDefaultAuthenticatedRole } from "@/lib/auth/permissions";
import { resolveUserRoles } from "@/lib/auth/roles";
import type { Database } from "@/types/database";
import type { AuthProfile } from "@/types/auth";

type AppUser = Database["public"]["Tables"]["users"]["Row"];

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function mergeRoles(...roleSets: string[][]) {
  return Array.from(new Set(roleSets.flat()));
}

export function mapUserToAuthProfile(
  user: User,
  appUser?: AppUser | null,
  databaseRoleNames: string[] = [],
): AuthProfile {
  const metadata = user.user_metadata;
  const roles = resolveUserRoles(
    {
      ...(user.app_metadata ?? {}),
      roles: mergeRoles(
        databaseRoleNames,
        resolveUserRoles(user.app_metadata, metadata),
      ),
    },
    metadata,
  );

  return {
    id: user.id,
    email: appUser?.email ?? user.email ?? "",
    firstName: appUser?.first_name ?? readString(metadata.first_name),
    lastName: appUser?.last_name ?? readString(metadata.last_name),
    organisationId:
      appUser?.organisation_id ?? readString(metadata.organisation_id),
    roles: roles.length > 0 ? roles : [getDefaultAuthenticatedRole()],
  };
}
