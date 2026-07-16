import type { Json } from "@/types/database";
import type { MemberAdminDetail } from "@/types/membership";
import {
  reissueMembershipCardAdminAction,
  revokeMembershipCardAdminAction,
} from "@/features/membership/admin-actions";
import {
  AdminMembershipCardStatusBadge,
  AdminMembershipPeriodStatusBadge,
  AdminMemberStatusBadge,
} from "@/components/membership/admin-member-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminMemberDetailProps = {
  member: MemberAdminDetail;
  canManageCards?: boolean;
};

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderAuditValue(value: Json | undefined) {
  if (value === undefined || value === null) {
    return "Not set";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
}

function isCurrentPeriod(value?: string | null) {
  return value ? new Date(value) > new Date() : true;
}

function hasActivePeriod(member: MemberAdminDetail) {
  const now = new Date();

  return member.membershipPeriods.some((period) => {
    const startsAt = new Date(period.starts_at);
    const endsAt = new Date(period.ends_at);

    return period.status === "active" && startsAt <= now && endsAt > now;
  });
}

function getCardValidityText(member: MemberAdminDetail) {
  const activeCard = member.membershipCards.find(
    (card) => card.card_status === "active",
  );

  if (!activeCard) {
    return "No active card is available.";
  }

  if (member.status !== "active") {
    return "Not valid because the member is not active.";
  }

  if (!isCurrentPeriod(member.expires_at)) {
    return "Not valid because the membership is expired.";
  }

  if (!hasActivePeriod(member)) {
    return "Not valid because there is no active membership period.";
  }

  return "QR is currently valid for membership verification.";
}

export function AdminMemberDetail({
  member,
  canManageCards = false,
}: AdminMemberDetailProps) {
  const activeCard =
    member.membershipCards.find((card) => card.card_status === "active") ??
    null;
  const latestCard = member.membershipCards[0] ?? null;
  const currentPeriod =
    member.membershipPeriods.find((period) => period.status === "active") ??
    member.membershipPeriods[0] ??
    null;
  const canRevokeCard = Boolean(activeCard);
  const canReissueCard = !activeCard && latestCard?.card_status === "revoked";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Member profile
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{member.memberName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {member.member_number}
            </p>
          </div>
          <AdminMemberStatusBadge status={member.derivedStatus} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Email" value={member.memberEmail ?? "Not set"} />
          <DetailItem label="Mobile" value={member.memberMobile ?? "Not set"} />
          <DetailItem
            label="Membership type"
            value={`${member.membershipTypeName} (${member.membershipTypeCode})`}
          />
          <DetailItem label="Joined" value={formatDate(member.joined_at)} />
          <DetailItem label="Approved" value={formatDate(member.approved_at)} />
          <DetailItem label="Expires" value={formatDate(member.expires_at)} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Linked account</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Account email"
              value={member.linkedAccountEmail ?? "Not linked"}
            />
            <DetailItem
              label="Account status"
              value={member.linkedAccountStatus ?? "Not linked"}
            />
            <DetailItem
              label="First name"
              value={member.linkedAccountFirstName ?? "Not set"}
            />
            <DetailItem
              label="Last name"
              value={member.linkedAccountLastName ?? "Not set"}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Current membership state</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Current period
              </p>
              <div className="mt-2">
                <AdminMembershipPeriodStatusBadge
                  status={currentPeriod?.status ?? null}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatDate(currentPeriod?.starts_at)} to{" "}
                {formatDate(currentPeriod?.ends_at)}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Current card
              </p>
              <div className="mt-2">
                <AdminMembershipCardStatusBadge
                  status={activeCard?.card_status ?? latestCard?.card_status ?? null}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Issued {formatDate(activeCard?.issued_at ?? latestCard?.issued_at)}
              </p>
            </div>
          </div>
        </section>
      </div>

      {member.application ? (
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Application details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Applicant"
              value={`${member.application.first_name} ${member.application.last_name}`}
            />
            <DetailItem label="Email" value={member.application.email} />
            <DetailItem
              label="Mobile"
              value={member.application.mobile ?? "Not set"}
            />
            <DetailItem
              label="Applied"
              value={formatDate(member.application.created_at)}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Membership period history</h2>
        <div className="mt-4 divide-y rounded-xl border">
          {member.membershipPeriods.length > 0 ? (
            member.membershipPeriods.map((period) => (
              <div
                key={period.id}
                className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <span className="text-sm">{formatDate(period.starts_at)}</span>
                <span className="text-sm">{formatDate(period.ends_at)}</span>
                <AdminMembershipPeriodStatusBadge status={period.status} />
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No membership periods have been recorded.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Membership cards</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Card history is redacted. Raw QR tokens are never shown here.
            </p>
          </div>
          <AdminMembershipCardStatusBadge
            status={activeCard?.card_status ?? latestCard?.card_status ?? null}
          />
        </div>

        <div className="mt-4 rounded-xl border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Current active card
          </p>
          <p className="mt-2 text-sm font-semibold">
            {activeCard ? activeCard.id : "No active card"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {getCardValidityText(member)}
          </p>
        </div>

        {canManageCards ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <form
              action={revokeMembershipCardAdminAction}
              className="rounded-xl border bg-background p-4"
            >
              <input type="hidden" name="memberId" value={member.id} />
              <h3 className="text-sm font-semibold">Revoke active card</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The current QR will stop verifying immediately. Member status
                and membership periods are not changed.
              </p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="revoke-card-reason">
                  Internal revocation reason
                </Label>
                <Input
                  id="revoke-card-reason"
                  name="reason"
                  placeholder="Required audit reason"
                  required
                  minLength={3}
                  maxLength={1000}
                />
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canRevokeCard}
                className="mt-4"
              >
                Revoke card
              </Button>
            </form>

            <form
              action={reissueMembershipCardAdminAction}
              className="rounded-xl border bg-background p-4"
            >
              <input type="hidden" name="memberId" value={member.id} />
              <h3 className="text-sm font-semibold">Issue replacement card</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Creates one new QR token after revocation. The old card remains
                revoked and visible in history.
              </p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="reissue-card-reason">
                  Internal replacement reason
                </Label>
                <Input
                  id="reissue-card-reason"
                  name="reason"
                  placeholder="Required audit reason"
                  required
                  minLength={3}
                  maxLength={1000}
                />
              </div>
              <Button
                type="submit"
                disabled={!canReissueCard}
                className="mt-4"
              >
                Issue replacement
              </Button>
            </form>
          </div>
        ) : null}

        <div className="mt-5 divide-y rounded-xl border">
          {member.membershipCards.length > 0 ? (
            member.membershipCards.map((card) => (
              <div
                key={card.id}
                className="grid gap-3 p-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
              >
                <span className="break-all text-sm">{card.id}</span>
                <span className="text-sm">Issued {formatDate(card.issued_at)}</span>
                <span className="text-sm text-muted-foreground">
                  Revoked {formatDate(card.revoked_at)}
                </span>
                <AdminMembershipCardStatusBadge status={card.card_status} />
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No membership cards have been recorded.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Audit timeline</h2>
        <div className="mt-4 divide-y rounded-xl border">
          {member.auditLogs.length > 0 ? (
            member.auditLogs.map((log) => (
              <div key={log.id} className="space-y-2 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </p>
                </div>
                <p className="break-words text-xs leading-5 text-muted-foreground">
                  Old: {renderAuditValue(log.old_values ?? undefined)}
                </p>
                <p className="break-words text-xs leading-5 text-muted-foreground">
                  New: {renderAuditValue(log.new_values ?? undefined)}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No member audit events have been recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium">{value}</p>
    </div>
  );
}
