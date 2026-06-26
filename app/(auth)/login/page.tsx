import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getPostLoginPath } from "@/lib/auth/permissions";
import { getOptionalCurrentProfile } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getOptionalCurrentProfile();

  if (profile) {
    redirect(getPostLoginPath(profile.roles));
  }

  return (
    <AuthCard
      title="Sign in"
      description="Use your secure account to access the right portal for your role."
    >
      <LoginForm />
    </AuthCard>
  );
}
