import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email address and we will send reset instructions if an account exists."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
