import { RefreshCw } from "lucide-react";

import { renewMemberAdminAction } from "@/features/membership/admin-actions";
import type { MemberRenewalDetail } from "@/types/membership";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminRenewalFormProps = {
  member: MemberRenewalDetail;
};

function toDateInput(value?: string | null) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
}

function addYear(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  date.setFullYear(date.getFullYear() + 1);

  return date.toISOString().slice(0, 10);
}

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

export function AdminRenewalForm({ member }: AdminRenewalFormProps) {
  const canRenew =
    member.status === "active" ||
    member.status === "expired" ||
    member.status === "suspended";
  const defaultStartDate = toDateInput(member.expires_at);
  const defaultEndDate = addYear(member.expires_at);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Renew membership</h2>
          <p className="text-sm text-muted-foreground">
            Adds a new period, updates expiry, and keeps the existing card and
            QR token.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border bg-muted/40 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Current expiry
          </p>
          <p className="mt-1 text-sm font-semibold">
            {formatDate(member.expires_at)}
          </p>
        </div>
        <span className="hidden text-muted-foreground sm:block">to</span>
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            New expiry preview
          </p>
          <p className="mt-1 text-sm font-semibold">
            {formatDate(defaultEndDate)}
          </p>
        </div>
      </div>

      <form action={renewMemberAdminAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="memberId" value={member.id} />
        <div className="space-y-2">
          <Label htmlFor="periodStartsAt">Renewal start date</Label>
          <Input
            id="periodStartsAt"
            name="periodStartsAt"
            type="date"
            defaultValue={defaultStartDate}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="periodEndsAt">Renewal end date</Label>
          <Input
            id="periodEndsAt"
            name="periodEndsAt"
            type="date"
            defaultValue={defaultEndDate}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Internal notes <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="notes"
            name="notes"
            placeholder="Optional note for the audit timeline"
          />
        </div>
        <div className="sm:col-span-2">
          <SubmitButton disabled={!canRenew} pendingLabel="Renewing membership...">Renew membership</SubmitButton>
        </div>
      </form>

      {!canRenew ? (
        <p className="mt-3 text-sm text-muted-foreground">
          This member cannot be renewed in the current status.
        </p>
      ) : null}
    </section>
  );
}
