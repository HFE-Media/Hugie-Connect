import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { getOptionalCurrentProfile } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Securely choose a new password for your Hugie Connect account.",
};

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const profile = await getOptionalCurrentProfile();
  const resolvedSearchParams = await searchParams;
  const hasInvalidLink = resolvedSearchParams?.error === "invalid_link";

  if (!profile) {
    return (
      <AuthCard
        title="Password link expired"
        description={
          hasInvalidLink
            ? "This password setup link is invalid or has expired."
            : "Open the latest invitation or password reset email to continue."
        }
      >
        <div className="space-y-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            No valid password setup session was found. Request a new invitation
            or reset link before choosing a password.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Create a strong password to continue using your account securely."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
