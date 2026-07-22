import { AlertTriangle, CheckCircle2, ScanLine, XCircle } from "lucide-react";

import type {
  MembershipVerificationResult,
  MembershipVerificationTone,
} from "@/types/membership";
import { cn } from "@/lib/utils";

type MembershipVerificationResultPanelProps = {
  result: MembershipVerificationResult | null;
};

const toneStyles = {
  valid: {
    icon: CheckCircle2,
    panel: "border-emerald-200 bg-emerald-50 text-emerald-950",
    iconWrap: "bg-emerald-600 text-white",
    label: "Valid",
  },
  warning: {
    icon: AlertTriangle,
    panel: "border-amber-200 bg-amber-50 text-amber-950",
    iconWrap: "bg-amber-500 text-white",
    label: "Warning",
  },
  invalid: {
    icon: XCircle,
    panel: "border-red-200 bg-red-50 text-red-950",
    iconWrap: "bg-red-600 text-white",
    label: "Invalid",
  },
} satisfies Record<
  MembershipVerificationTone,
  {
    icon: typeof CheckCircle2;
    panel: string;
    iconWrap: string;
    label: string;
  }
>;

function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function MembershipVerificationResultPanel({
  result,
}: MembershipVerificationResultPanelProps) {
  if (!result) {
    return (
      <section className="rounded-xl border bg-card p-5 shadow-soft">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-primary">
          <ScanLine className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-medium">Ready to verify a membership</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Scan a membership QR or enter a membership QR value to see the
          verification result.
        </p>
      </section>
    );
  }

  const tone = toneStyles[result.tone];
  const Icon = tone.icon;
  const details = [
    ["Member", result.memberName],
    ["Membership type", result.membershipTypeName],
    ["Member number", result.memberNumber],
    ["Status", result.memberStatus],
    ["Expires", formatDate(result.expiresAt)],
    ["Organisation", result.organisationName],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <section
      className={cn("rounded-xl border p-5 shadow-soft", tone.panel)}
      role={result.tone === "invalid" ? "alert" : "status"}
      aria-live={result.tone === "invalid" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            tone.iconWrap,
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal">
            {tone.label}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{result.title}</h2>
          <p className="mt-2 text-sm leading-6 opacity-80">{result.message}</p>
        </div>
      </div>

      {details.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/70 p-3">
              <p className="text-[11px] font-medium uppercase tracking-normal opacity-60">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
