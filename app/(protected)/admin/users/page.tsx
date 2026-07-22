import { Users } from "lucide-react";

import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePermission("users:roles:manage");

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Users and roles"
        description="Organisation access is managed by authorised administrators."
        icon={Users}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">No user management tools available</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          User and role changes are not available from this workspace.
        </p>
      </section>
    </main>
  );
}
