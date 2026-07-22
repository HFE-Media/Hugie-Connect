import Link from "next/link";
import { CalendarDays, ClipboardList, RefreshCw, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { hasPermission } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

function AdminDestination({ href, icon: Icon, title, description }: { href: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <Link href={href} className="group flex min-h-36 flex-col rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-semibold group-hover:text-secondary">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </Link>
  );
}

export default async function AdminPage() {
  const profile = await requirePermission("admin:shell:view");
  const showMembershipApplications = hasPermission(
    profile.roles,
    "membership:applications:manage",
  );
  const showMembers = hasPermission(profile.roles, "membership:members:manage");
  const showRenewals = hasPermission(profile.roles, "membership:renew");
  const showEvents = hasPermission(profile.roles, "events:manage");

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Administration"
        description="Manage memberships, renewals and community events from one place."
        icon={ShieldCheck}
      />
      <section aria-label="Administration modules" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {showMembershipApplications ? (
            <AdminDestination href="/admin/membership/applications" icon={ClipboardList} title="Applications" description="Review and decide submitted membership applications." />
          ) : null}
          {showMembers ? (
            <AdminDestination href="/admin/membership/members" icon={UsersRound} title="Members" description="View member records and manage membership status." />
          ) : null}
          {showRenewals ? (
            <AdminDestination href="/admin/membership/renewals" icon={RefreshCw} title="Renewals" description="Review validity and extend eligible memberships." />
          ) : null}
          {showEvents ? (
            <AdminDestination href="/admin/events" icon={CalendarDays} title="Events" description="Create, publish and manage community events." />
          ) : null}
      </section>
    </main>
  );
}
