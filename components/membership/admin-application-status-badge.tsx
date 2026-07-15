import type { MembershipApplicationStatus } from "@/types/membership";
import { cn } from "@/lib/utils";

type AdminApplicationStatusBadgeProps = {
  status: MembershipApplicationStatus;
};

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
} satisfies Record<MembershipApplicationStatus, string>;

export function AdminApplicationStatusBadge({
  status,
}: AdminApplicationStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
