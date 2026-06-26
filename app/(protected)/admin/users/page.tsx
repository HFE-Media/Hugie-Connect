import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function UsersFoundationPage() {
  await requirePermission("users:roles:manage");

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Role management foundation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Role assignment requires the future application user tables and audit
          logging. Sprint 01 provides permission boundaries only, with no user
          management mutations.
        </p>
      </section>
    </main>
  );
}
