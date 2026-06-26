import { CalendarDays, Clock3, CreditCard, ShieldCheck } from "lucide-react";

import type {
  MemberMembershipSummary,
  MemberStatus,
  MembershipPeriodStatus,
} from "@/types/membership";
import { cn } from "@/lib/utils";

type MemberMembershipSummaryCardProps = {
  summary: MemberMembershipSummary;
};

const memberStatusLabels = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  cancelled: "Cancelled",
} satisfies Record<MemberStatus, string>;

const periodStatusLabels = {
  pending: "Pending",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
} satisfies Record<MembershipPeriodStatus, string>;

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

function formatBillingCycle(value: string | null) {
  if (!value) {
    return "Confirmed by organisation";
  }

  return value.replace("_", " ");
}

function StatusBadge({
  children,
  tone,
}: {
  children: string;
  tone: "success" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function getMemberStatusTone(status: MemberStatus) {
  if (status === "active") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  return "muted";
}

export function MemberMembershipSummaryCard({
  summary,
}: MemberMembershipSummaryCardProps) {
  const { member, membershipType, currentPeriod } = summary;
  const fields = [
    ["Membership type", membershipType.name],
    ["Member number", member.member_number],
    ["Billing cycle", formatBillingCycle(membershipType.billing_cycle)],
    ["Joined", formatDate(member.joined_at)],
    ["Approved", formatDate(member.approved_at)],
    ["Expires", formatDate(member.expires_at)],
  ];

  return (
    <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">My Membership</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your current membership record, status, and validity details.
          </p>
        </div>
        <StatusBadge tone={getMemberStatusTone(member.status)}>
          {memberStatusLabels[member.status]}
        </StatusBadge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Current period</h2>
            <p className="text-sm text-muted-foreground">
              The active or pending period linked to this membership.
            </p>
          </div>
        </div>

        {currentPeriod ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Starts
              </p>
              <p className="mt-1 text-sm font-semibold">
                {formatDate(currentPeriod.starts_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Ends
              </p>
              <p className="mt-1 text-sm font-semibold">
                {formatDate(currentPeriod.ends_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Period status
              </p>
              <div className="mt-1">
                <StatusBadge tone={getMemberStatusTone(currentPeriod.status)}>
                  {periodStatusLabels[currentPeriod.status]}
                </StatusBadge>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <p className="text-sm leading-6 text-muted-foreground">
              No membership period has been attached to this membership yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function EmptyMembershipState() {
  return (
    <section className="rounded-xl border bg-card p-6 text-center shadow-soft">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <CreditCard className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">No membership found</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        You do not have an active or pending membership linked to this account
        yet. Once your membership is approved and connected, it will appear
        here.
      </p>
    </section>
  );
}
