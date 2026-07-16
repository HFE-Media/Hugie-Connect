import type {
  MemberAdminStatusFilter,
  MemberStatus,
  MembershipCardStatus,
  MembershipPeriodStatus,
} from "@/types/membership";
import { cn } from "@/lib/utils";

type StatusTone = "green" | "amber" | "red" | "slate";

const toneStyles = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
} satisfies Record<StatusTone, string>;

function getMemberTone(status: MemberStatus | MemberAdminStatusFilter) {
  if (status === "active") {
    return "green";
  }

  if (status === "pending") {
    return "amber";
  }

  if (status === "suspended" || status === "expired") {
    return "red";
  }

  return "slate";
}

function getCardTone(status: MembershipCardStatus | null) {
  if (status === "active") {
    return "green";
  }

  if (status === "revoked" || status === "expired") {
    return "red";
  }

  return "slate";
}

function getPeriodTone(status: MembershipPeriodStatus | null) {
  if (status === "active") {
    return "green";
  }

  if (status === "pending") {
    return "amber";
  }

  if (status === "expired" || status === "cancelled") {
    return "red";
  }

  return "slate";
}

function Badge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
      )}
    >
      {label}
    </span>
  );
}

export function AdminMemberStatusBadge({
  status,
}: {
  status: MemberStatus | MemberAdminStatusFilter;
}) {
  return <Badge label={status} tone={getMemberTone(status)} />;
}

export function AdminMembershipCardStatusBadge({
  status,
}: {
  status: MembershipCardStatus | null;
}) {
  return <Badge label={status ?? "no card"} tone={getCardTone(status)} />;
}

export function AdminMembershipPeriodStatusBadge({
  status,
}: {
  status: MembershipPeriodStatus | null;
}) {
  return <Badge label={status ?? "no period"} tone={getPeriodTone(status)} />;
}
