import { AuthCard } from "@/components/auth/auth-card";

export default function AuthenticationLoading() {
  return (
    <AuthCard
      title="Secure access"
      description="Preparing your account experience."
    >
      <div className="space-y-5" aria-busy="true" aria-label="Loading secure access">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-11 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-11 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
      </div>
    </AuthCard>
  );
}
