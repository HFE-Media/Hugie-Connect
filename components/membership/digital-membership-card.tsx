import { Building2, QrCode, ShieldCheck } from "lucide-react";

import type { MemberStatus } from "@/types/membership";
import { cn } from "@/lib/utils";

export type DigitalMembershipCardProps = {
  organisationName: string;
  organisationLogoUrl?: string | null;
  memberName: string;
  membershipTypeName: string;
  memberNumber: string;
  status: MemberStatus;
  joinedAt: string | null;
  expiresAt: string | null;
  className?: string;
};

const statusLabels = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  cancelled: "Cancelled",
} satisfies Record<MemberStatus, string>;

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

function getStatusTone(status: MemberStatus) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "pending") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return "bg-muted text-muted-foreground ring-border";
}

export function DigitalMembershipCard({
  organisationName,
  organisationLogoUrl,
  memberName,
  membershipTypeName,
  memberNumber,
  status,
  joinedAt,
  expiresAt,
  className,
}: DigitalMembershipCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-primary text-primary-foreground shadow-soft",
        className,
      )}
      aria-label="Digital membership card preview"
    >
      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-24 bg-secondary/25" />
        <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full border border-white/10 bg-white/10" />
        <div className="absolute -bottom-24 left-8 h-40 w-40 rounded-full border border-white/10 bg-white/5" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/15">
              {organisationLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organisationLogoUrl}
                  alt=""
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {organisationName}
              </p>
              <p className="mt-1 text-xs text-primary-foreground/70">
                Digital membership
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
              getStatusTone(status),
            )}
          >
            {statusLabels[status]}
          </span>
        </div>

        <div className="relative mt-10">
          <p className="text-xs font-medium uppercase tracking-normal text-primary-foreground/60">
            Member
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
            {memberName}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            {membershipTypeName}
          </p>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-[1fr_132px] sm:items-end">
          <div className="grid grid-cols-2 gap-3">
            <CardDetail label="Member no." value={memberNumber} />
            <CardDetail label="Joined" value={formatDate(joinedAt)} />
            <CardDetail label="Valid until" value={formatDate(expiresAt)} />
            <CardDetail label="Verification" value="QR pending" />
          </div>

          <div className="rounded-lg bg-white p-3 text-primary shadow-sm">
            <div className="grid aspect-square place-items-center rounded-md border border-dashed border-primary/25 bg-muted/40">
              <QrCode className="h-12 w-12 text-primary/45" aria-hidden="true" />
            </div>
            <p className="mt-2 text-center text-[11px] font-medium text-primary/65">
              QR placeholder
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-2 text-xs text-primary-foreground/65">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Official membership status is verified server-side.</span>
        </div>
      </div>
    </article>
  );
}

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-normal text-primary-foreground/55">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-tight">{value}</p>
    </div>
  );
}
