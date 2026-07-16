import type { MembershipRenewalFilter } from "@/types/membership";
import { cn } from "@/lib/utils";

const renewalStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expiring_soon: "border-amber-200 bg-amber-50 text-amber-700",
  expired: "border-red-200 bg-red-50 text-red-700",
  renewed_recently: "border-blue-200 bg-blue-50 text-blue-700",
} satisfies Record<MembershipRenewalFilter, string>;

const renewalLabels = {
  active: "active",
  expiring_soon: "expiring soon",
  expired: "expired",
  renewed_recently: "renewed recently",
} satisfies Record<MembershipRenewalFilter, string>;

export function AdminRenewalStatusBadge({
  status,
}: {
  status: MembershipRenewalFilter;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium",
        renewalStyles[status],
      )}
    >
      {renewalLabels[status]}
    </span>
  );
}
