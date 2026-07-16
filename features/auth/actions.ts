"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getPostLoginPath } from "@/lib/auth/permissions";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { mapUserToAuthProfile } from "@/services/auth/profile";
import { createSupabaseServerClient } from "@/services/supabase/server";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const passwordRecoverySchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter the email address linked to your account.")
    .email("Enter a valid email address."),
});

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter your email address and password.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    logger.warn("Login failed", { email });
    return {
      status: "error",
      message: "We could not sign you in with those details.",
    };
  }

  const profile = mapUserToAuthProfile(data.user);
  logger.info("Login succeeded", { userId: profile.id });
  redirect(getPostLoginPath(profile.roles));
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = passwordRecoverySchema.safeParse({
    email: readRequiredString(formData, "email"),
  });

  if (!result.success) {
    return {
      status: "error",
      message:
        result.error.issues[0]?.message ??
        "Enter the email address linked to your account.",
    };
  }

  const env = getServerEnv();

  if (!env.PASSWORD_RESET_REDIRECT_URL) {
    logger.error("Password reset redirect URL is not configured");
    return {
      status: "error",
      message: "Password recovery is not configured. Please contact support.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: env.PASSWORD_RESET_REDIRECT_URL,
  });

  if (error) {
    logger.warn("Password reset request failed", {
      email: result.data.email,
      error: error.message,
    });
  } else {
    logger.info("Password reset requested", { email: result.data.email });
  }

  return {
    status: "success",
    message:
      "If an account exists for that email address, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readRequiredString(formData, "password");
  const confirmPassword = readRequiredString(formData, "confirmPassword");

  if (password.length < 8) {
    return {
      status: "error",
      message: "Use at least 8 characters for your new password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "The password confirmation does not match.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      status: "error",
      message: "Your invite link is invalid or expired. Request a new link.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: "Your password could not be updated. Request a new reset link.",
    };
  }

  logger.info("Password reset completed");

  redirect("/portal/membership?password=updated");
}
