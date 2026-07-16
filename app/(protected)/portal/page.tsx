import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  ShoppingBag,
  Sparkles,
  Ticket,
  UserCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/services/auth/server";
import { createMembershipService } from "@/services/membership/service";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database } from "@/types/database";
import type {
  MemberMembershipSummary,
  MemberStatus,
  MembershipCardStatus,
} from "@/types/membership";

export const dynamic = "force-dynamic";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

const memberStatusLabels = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  cancelled: "Cancelled",
} satisfies Record<MemberStatus, string>;

const cardStatusLabels = {
  active: "Active",
  expired: "Expired",
  revoked: "Revoked",
} satisfies Record<MembershipCardStatus, string>;

const activityLabels: Record<string, string> = {
  membership_application_approved: "Membership application approved",
  member_account_created: "Member account created",
  member_account_linked: "Member account linked",
  member_renewed: "Membership renewed",
  member_suspended: "Membership suspended",
  member_reactivated: "Membership reactivated",
  membership_card_revoked: "Membership card revoked",
  membership_card_reissued: "Membership card reissued",
  profile_updated: "Profile updated",
  password_changed: "Password changed",
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getDisplayName(params: {
  appUserFirstName?: string | null;
  membershipSummary: MemberMembershipSummary | null;
  profileFirstName?: string | null;
  profileLastName?: string | null;
}) {
  const appUserFirstName = params.appUserFirstName?.trim();

  if (appUserFirstName) {
    return appUserFirstName;
  }

  const applicationFirstName =
    params.membershipSummary?.membershipApplication?.first_name?.trim();

  if (applicationFirstName) {
    return applicationFirstName;
  }

  const memberWithOptionalName = params.membershipSummary?.member as
    | (NonNullable<MemberMembershipSummary["member"]> & {
        display_name?: string | null;
        full_name?: string | null;
        name?: string | null;
      })
    | undefined;
  const memberDisplayName =
    memberWithOptionalName?.display_name?.trim() ||
    memberWithOptionalName?.full_name?.trim() ||
    memberWithOptionalName?.name?.trim();

  if (memberDisplayName) {
    return memberDisplayName;
  }

  const profileName = [params.profileFirstName, params.profileLastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return profileName || null;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeActivityDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDaysRemaining(expiresAt: string | null) {
  if (!expiresAt) {
    return "Expiry not set";
  }

  const end = new Date(expiresAt);
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);

  if (Number.isNaN(days)) {
    return "Expiry not set";
  }

  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

function getStatusTone(status: MemberStatus | MembershipCardStatus | null) {
  if (status === "active") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "suspended" || status === "expired" || status === "revoked") {
    return "danger";
  }

  return "muted";
}

function StatusBadge({
  children,
  tone,
}: {
  children: string;
  tone: "success" | "warning" | "danger" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  disabled = false,
}: {
  href?: string;
  icon: typeof CreditCard;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "flex h-full items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-soft transition-colors",
        href && "hover:bg-muted/40",
        disabled && "bg-muted/40 opacity-70",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  if (!href || disabled) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

function MembershipSummaryCard({
  summary,
}: {
  summary: MemberMembershipSummary | null;
}) {
  if (!summary) {
    return (
      <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold">No membership linked yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Once your approved membership is connected to this account, your
              status, card and validity details will appear here.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/membership/apply">Apply for Membership</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/portal/membership">Link Existing Membership</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const expiryDate =
    summary.currentPeriod?.ends_at ?? summary.member.expires_at ?? null;
  const cardStatus = summary.membershipCard?.status ?? null;

  return (
    <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold">Membership summary</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your current membership status and card readiness at a glance.
          </p>
        </div>
        <StatusBadge tone={getStatusTone(summary.member.status)}>
          {memberStatusLabels[summary.member.status]}
        </StatusBadge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryMetric label="Member number" value={summary.member.member_number} />
        <SummaryMetric label="Membership type" value={summary.membershipType.name} />
        <SummaryMetric label="Organisation" value={summary.organisation.name} />
        <SummaryMetric label="Expiry date" value={formatDate(expiryDate)} />
        <SummaryMetric label="Validity" value={getDaysRemaining(expiryDate)} />
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Card status
          </p>
          <div className="mt-2">
            <StatusBadge tone={getStatusTone(cardStatus)}>
              {cardStatus ? cardStatusLabels[cardStatus] : "Not issued"}
            </StatusBadge>
          </div>
        </div>
      </div>

      <Button asChild className="mt-6">
        <Link href="/portal/membership">View Membership Card</Link>
      </Button>
    </section>
  );
}

async function loadRecentActivity(params: {
  appUserId: string | null;
  organisationId: string | null;
  memberId: string | null;
}) {
  if (!params.appUserId || !params.organisationId) {
    return [];
  }

  const adminClient = createSupabaseAdminClient();
  const scopedFilters = [`user_id.eq.${params.appUserId}`];

  if (params.memberId) {
    scopedFilters.push(`and(entity_type.eq.member,entity_id.eq.${params.memberId})`);
  }

  const { data, error } = await adminClient
    .from("audit_logs")
    .select("action, created_at")
    .eq("organisation_id", params.organisationId)
    .or(scopedFilters.join(","))
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return [];
  }

  return (data ?? [])
    .filter((log): log is Pick<AuditLog, "action" | "created_at"> =>
      Boolean(activityLabels[log.action]),
    )
    .slice(0, 5);
}

function RecentActivity({ activity }: { activity: Pick<AuditLog, "action" | "created_at">[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="text-sm text-muted-foreground">
            Account and membership updates from your own record.
          </p>
        </div>
      </div>

      {activity.length ? (
        <ol className="space-y-3">
          {activity.map((item) => (
            <li
              key={`${item.action}-${item.created_at}`}
              className="flex items-start gap-3 rounded-lg border bg-background p-4"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">
                  {activityLabels[item.action]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeActivityDate(item.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            No recent account or membership activity is available yet.
          </p>
        </div>
      )}
    </section>
  );
}

export default async function PortalPage() {
  const profile = await requirePermission("portal:view");
  const supabase = await createSupabaseServerClient();
  const membershipService = createMembershipService(supabase);

  const [{ data: appUser }, membershipSummary] = await Promise.all([
    supabase
      .from("users")
      .select("id, first_name, last_name, email, organisation_id")
      .eq("auth_user_id", profile.id)
      .maybeSingle(),
    membershipService.getOwnMembershipSummary(profile.id).catch(() => null),
  ]);

  const displayName = getDisplayName({
    appUserFirstName: appUser?.first_name,
    membershipSummary,
    profileFirstName: profile.firstName,
    profileLastName: profile.lastName,
  });

  const recentActivity = await loadRecentActivity({
    appUserId: appUser?.id ?? null,
    organisationId:
      appUser?.organisation_id ?? membershipSummary?.organisation.id ?? null,
    memberId: membershipSummary?.member.id ?? null,
  });

  return (
    <main className="container py-8">
      <section className="mb-6 rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-semibold">
              {displayName ? `${getGreeting()}, ${displayName}` : "Welcome back"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Welcome back to Hugie Connect. Your membership, profile and next
              useful actions are gathered here.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/portal/profile">View Profile</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <MembershipSummaryCard summary={membershipSummary} />

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Shortcuts for the member tasks available today.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction
                href={membershipSummary ? "/portal/membership" : undefined}
                icon={CreditCard}
                title="View Membership Card"
                description={
                  membershipSummary
                    ? "Open your digital card and membership details."
                    : "Available once a membership is linked."
                }
                disabled={!membershipSummary}
              />
              <QuickAction
                href="/portal/profile"
                icon={UserCircle}
                title="View Profile"
                description="Update your personal details and contact number."
              />
              <QuickAction
                href="/portal/profile"
                icon={LockKeyhole}
                title="Change Password"
                description="Manage your account password from your profile."
              />
              {!membershipSummary ? (
                <QuickAction
                  href="/membership/apply"
                  icon={CalendarClock}
                  title="Apply for Membership"
                  description="Start a public membership application."
                />
              ) : null}
              <QuickAction
                icon={CalendarClock}
                title="Events"
                description="Coming in a future sprint."
                disabled
              />
              <QuickAction
                icon={Ticket}
                title="Tickets"
                description="Coming in a future sprint."
                disabled
              />
              <QuickAction
                icon={ShoppingBag}
                title="Shop"
                description="Coming in a future sprint."
                disabled
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <RecentActivity activity={recentActivity} />

          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {membershipSummary?.member.status === "active" ? (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Access status</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {membershipSummary
                    ? "Your portal only shows records linked to this signed-in account."
                    : "No membership data is shown unless it belongs to this signed-in account."}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
