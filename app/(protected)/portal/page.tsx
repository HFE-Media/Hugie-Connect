import Link from "next/link";
import { UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const profile = await requirePermission("portal:view");

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <UserCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold">Your portal</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This protected area confirms session handling, profile mapping,
              and role-aware navigation. Business modules begin in later
              sprints.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/portal/profile">View profile</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium">Signed in as</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium">Roles</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.roles.join(", ")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
