import type { User } from "@supabase/supabase-js";

import { getDefaultAuthenticatedRole } from "@/lib/auth/permissions";
import { resolveUserRoles } from "@/lib/auth/roles";
import type { AuthProfile } from "@/types/auth";

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function mapUserToAuthProfile(user: User): AuthProfile {
  const metadata = user.user_metadata;
  const roles = resolveUserRoles(user.app_metadata, metadata);

  return {
    id: user.id,
    email: user.email ?? "",
    firstName: readString(metadata.first_name),
    lastName: readString(metadata.last_name),
    organisationId: readString(metadata.organisation_id),
    roles: roles.length > 0 ? roles : [getDefaultAuthenticatedRole()],
  };
}
