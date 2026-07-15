import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminShellPage() {
  const profile = await requirePermission("admin:shell:view");
  const showMembershipApplications = hasPermission(
    profile.roles,
    "membership:applications:manage",
  );

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Admin shell</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          This route verifies administrator access and protected navigation.
          Operational dashboards and business modules are intentionally outside
          Sprint 01.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {showMembershipApplications ? (
            <Button asChild>
              <Link href="/admin/membership/applications">
                Membership applications
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin/users">Role foundation</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
