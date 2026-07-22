import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getPostLoginPath } from "@/lib/auth/permissions";
import { getOptionalCurrentProfile } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in securely to your Hugie Connect portal.",
};

export default async function LoginPage() {
  const profile = await getOptionalCurrentProfile();

  if (profile) {
    redirect(getPostLoginPath(profile.roles));
  }

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to access your membership, tickets or administration tools."
    >
      <LoginForm />
    </AuthCard>
  );
}
