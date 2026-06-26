import Link from "next/link";
import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { hasPermission } from "@/lib/auth/permissions";
import { requireProfile } from "@/services/auth/server";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const profile = await requireProfile();
  const showAdmin = hasPermission(profile.roles, "admin:shell:view");
  const showScanner = hasPermission(profile.roles, "scanner:shell:view");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">
                Hugie Connect
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Authenticated area
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Portal
            </Link>
            {showAdmin ? (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Admin
              </Link>
            ) : null}
            {showScanner ? (
              <Link
                href="/scanner"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Scanner
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
