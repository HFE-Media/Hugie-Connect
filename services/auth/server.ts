import { redirect } from "next/navigation";

import { hasPermission } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger";
import type { Permission } from "@/types/auth";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { mapUserToAuthProfile } from "@/services/auth/profile";

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

  return mapUserToAuthProfile(user);
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
