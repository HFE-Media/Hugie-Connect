import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure password reset link for your Hugie Connect account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email. For your privacy, the confirmation is the same whether or not an account is found."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
