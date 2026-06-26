"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPostLoginPath } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger";
import { mapUserToAuthProfile } from "@/services/auth/profile";
import { createSupabaseServerClient } from "@/services/supabase/server";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

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
  const email = readRequiredString(formData, "email");

  if (!email) {
    return {
      status: "error",
      message: "Enter the email address linked to your account.",
    };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  logger.info("Password reset requested", { email });

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
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: "Your password could not be updated. Request a new reset link.",
    };
  }

  logger.info("Password reset completed");

  return {
    status: "success",
    message: "Your password has been updated. You can continue securely.",
  };
}
