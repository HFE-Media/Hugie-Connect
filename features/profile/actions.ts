"use server";

import { revalidatePath } from "next/cache";

import {
  changePasswordSchema,
  profileUpdateSchema,
} from "@/features/profile/schemas";
import { logger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import { createSupabaseServerClient } from "@/services/supabase/server";

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function firstValidationMessage(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null };
  }

  return { supabase, user: data.user };
}

export async function updateOwnProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileUpdateSchema.safeParse({
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    mobile: readString(formData, "mobile"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: firstValidationMessage(parsed.error),
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session has expired. Sign in again to update your profile.",
    };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: existingUser, error: existingUserError } = await adminClient
    .from("users")
    .select("id, organisation_id, first_name, last_name, mobile")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingUserError || !existingUser) {
    logger.warn("Profile update could not load app user", {
      authUserId: user.id,
      error: existingUserError?.message,
    });

    return {
      status: "error",
      message: "Your profile could not be updated. Please contact support.",
    };
  }

  const values = parsed.data;
  const { error: updateError } = await adminClient
    .from("users")
    .update({
      first_name: values.firstName,
      last_name: values.lastName,
      mobile: values.mobile,
    })
    .eq("auth_user_id", user.id)
    .select("id")
    .single();

  if (updateError) {
    logger.warn("Profile update failed", {
      authUserId: user.id,
      appUserId: existingUser.id,
      error: updateError.message,
    });

    return {
      status: "error",
      message: "Your profile could not be updated. Please try again.",
    };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      first_name: values.firstName,
      last_name: values.lastName,
      name: `${values.firstName} ${values.lastName}`,
    },
  });

  if (metadataError) {
    logger.warn("Profile metadata sync failed", {
      authUserId: user.id,
      appUserId: existingUser.id,
      error: metadataError.message,
    });
  }

  const { error: auditError } = await adminClient.from("audit_logs").insert({
    organisation_id: existingUser.organisation_id,
    user_id: existingUser.id,
    action: "profile_updated",
    entity_type: "user",
    entity_id: existingUser.id,
    old_values: {
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      mobile: existingUser.mobile,
    },
    new_values: {
      first_name: values.firstName,
      last_name: values.lastName,
      mobile: values.mobile,
    },
  });

  if (auditError) {
    logger.warn("Profile update audit log failed", {
      authUserId: user.id,
      appUserId: existingUser.id,
      error: auditError.message,
    });
  }

  revalidatePath("/portal");
  revalidatePath("/portal/profile");
  revalidatePath("/portal/membership");

  return {
    status: "success",
    message: "Your profile has been updated.",
  };
}

export async function changeOwnPasswordAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = changePasswordSchema.safeParse({
    password: readString(formData, "password"),
    confirmPassword: readString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: firstValidationMessage(parsed.error),
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session has expired. Sign in again to change your password.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    logger.warn("Authenticated password change failed", {
      authUserId: user.id,
      error: error.message,
    });

    return {
      status: "error",
      message: "Your password could not be changed. Please try again.",
    };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: appUser } = await adminClient
    .from("users")
    .select("id, organisation_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (appUser) {
    const { error: auditError } = await adminClient.from("audit_logs").insert({
      organisation_id: appUser.organisation_id,
      user_id: appUser.id,
      action: "password_changed",
      entity_type: "user",
      entity_id: appUser.id,
      old_values: null,
      new_values: null,
    });

    if (auditError) {
      logger.warn("Password change audit log failed", {
        authUserId: user.id,
        appUserId: appUser.id,
        error: auditError.message,
      });
    }
  }

  return {
    status: "success",
    message: "Your password has been changed.",
  };
}
