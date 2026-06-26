import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await requirePermission("profile:view_own");

  const fields = [
    ["Email", profile.email],
    ["First name", profile.firstName ?? "Not set"],
    ["Last name", profile.lastName ?? "Not set"],
    ["Organisation", profile.organisationId ?? "Not assigned"],
    ["Roles", profile.roles.join(", ")],
  ];

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Profile foundation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Profile data is currently read from Supabase Auth metadata. Editable
          profile fields will be backed by application tables in the relevant
          future milestone.
        </p>

        <dl className="mt-6 grid gap-3">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border bg-background p-4 sm:grid sm:grid-cols-[180px_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium">{label}</dt>
              <dd className="mt-1 text-sm text-muted-foreground sm:mt-0">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
