import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EventTicketScanResult, EventTicketScanTone } from "@/types/events";

type EventTicketScanResultPanelProps = {
  result: EventTicketScanResult | null;
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
  EventTicketScanTone,
  {
    icon: typeof CheckCircle2;
    panel: string;
    iconWrap: string;
    label: string;
  }
>;

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EventTicketScanResultPanel({
  result,
}: EventTicketScanResultPanelProps) {
  if (!result) {
    return (
      <section className="rounded-xl border bg-card p-5 shadow-soft">
        <p className="text-sm font-medium">No ticket scanned yet</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose an event, then scan a ticket QR or enter a ticket QR value.
        </p>
      </section>
    );
  }

  const tone = toneStyles[result.tone];
  const Icon = tone.icon;
  const details = [
    ["Event", result.eventName],
    ["Date", result.eventDate ? formatDateTime(result.eventDate) : null],
    ["Venue", result.venue],
    ["Ticket type", result.ticketTypeName],
    ["Ticket number", result.ticketNumber],
    ["Holder", result.holderName],
    ["Status", result.status],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <section className={cn("rounded-xl border p-5 shadow-soft", tone.panel)}>
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
