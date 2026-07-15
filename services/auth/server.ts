import { redirect } from "next/navigation";

import { hasPermission } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger";
import type { Permission } from "@/types/auth";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { mapUserToAuthProfile } from "@/services/auth/profile";
import { createAuthRepository } from "@/services/auth/repository";

export async function getCurrentProfile() {
  let user;

  try {
    const supabase = await createSupabaseServerClient();
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch (error) {
    logger.warn("Unable to resolve current auth profile", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }

  if (!user) {
    return null;
  }

  const repository = createAuthRepository(await createSupabaseServerClient());
  const { data: appUser, error: appUserError } =
    await repository.getUserByAuthUserId(user.id);

  if (appUserError) {
    logger.warn("Unable to load app user profile", {
      error: appUserError.message,
      authUserId: user.id,
    });

    return mapUserToAuthProfile(user);
  }

  if (!appUser) {
    return mapUserToAuthProfile(user);
  }

  const { data: roleNames, error: roleError } =
    await repository.listRoleNamesForUser({
      userId: appUser.id,
      organisationId: appUser.organisation_id,
    });

  if (roleError) {
    logger.warn("Unable to load app user roles", {
      error: roleError.message,
      authUserId: user.id,
      appUserId: appUser.id,
    });

    return mapUserToAuthProfile(user, appUser);
  }

  return mapUserToAuthProfile(user, appUser, roleNames ?? []);
}

export async function getOptionalCurrentProfile() {
  try {
    return await getCurrentProfile();
  } catch {
    return null;
  }
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requirePermission(permission: Permission) {
  const profile = await requireProfile();

  if (!hasPermission(profile.roles, permission)) {
    redirect("/forbidden");
  }

  return profile;
}
