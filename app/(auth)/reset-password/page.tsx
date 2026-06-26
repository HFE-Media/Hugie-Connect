import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { requireProfile } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  await requireProfile();

  return (
    <AuthCard
      title="Choose a new password"
      description="Create a strong password to continue using your account securely."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
