import Link from "next/link";
import {
  Building2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileDetailsForm } from "@/components/profile/profile-details-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/services/auth/server";
import { createMembershipService } from "@/services/membership/service";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { MemberMembershipSummary, MemberStatus } from "@/types/membership";

export const dynamic = "force-dynamic";

const memberStatusLabels = {
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

function joinName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function getMembershipDisplayName(summary: MemberMembershipSummary) {
  const memberWithOptionalDisplayName = summary.member as typeof summary.member & {
    display_name?: string | null;
    name?: string | null;
  };

  return (
    joinName(
      summary.membershipApplication?.first_name,
      summary.membershipApplication?.last_name,
    ) ||
    joinName(summary.memberUser.first_name, summary.memberUser.last_name) ||
    memberWithOptionalDisplayName.display_name?.trim() ||
    memberWithOptionalDisplayName.name?.trim() ||
    summary.memberUser.email
  );
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

function ProfileField({
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

function LinkedMembershipSummary({
  summary,
}: {
  summary: MemberMembershipSummary | null;
}) {
  if (!summary) {
    return (
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">No linked membership</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Approved and linked memberships will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const expiryDate =
    summary.currentPeriod?.ends_at ?? summary.member.expires_at ?? null;

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {getMembershipDisplayName(summary)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary.membershipType.name} · {summary.member.member_number}
            </p>
          </div>
        </div>
        <StatusBadge tone={getMemberStatusTone(summary.member.status)}>
          {memberStatusLabels[summary.member.status]}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ProfileField label="Member number" value={summary.member.member_number} />
        <ProfileField label="Expiry date" value={formatDate(expiryDate)} />
      </div>

      <Button asChild className="mt-5" variant="outline">
        <Link href="/portal/membership">View My Membership</Link>
      </Button>
    </div>
  );
}

export default async function ProfilePage() {
  const profile = await requirePermission("profile:view_own");
  const supabase = await createSupabaseServerClient();
  const membershipService = createMembershipService(supabase);

  const [{ data: appUser }, membershipSummary] = await Promise.all([
    supabase
      .from("users")
      .select("first_name, last_name, email, mobile, organisation_id")
      .eq("auth_user_id", profile.id)
      .maybeSingle(),
    membershipService.getOwnMembershipSummary(profile.id).catch(() => null),
  ]);

  const organisationId = appUser?.organisation_id ?? profile.organisationId;
  const { data: organisation } = organisationId
    ? await supabase
        .from("organisations")
        .select("name")
        .eq("id", organisationId)
        .maybeSingle()
    : { data: null };

  const firstName = appUser?.first_name ?? profile.firstName ?? "";
  const lastName = appUser?.last_name ?? profile.lastName ?? "";
  const email = appUser?.email ?? profile.email;
  const mobile = appUser?.mobile ?? "";

  return (
    <main className="container py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your personal contact details and account password.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personal details</h2>
                <p className="text-sm text-muted-foreground">
                  Your email address is managed through your account sign-in.
                </p>
              </div>
            </div>

            <ProfileDetailsForm
              firstName={firstName}
              lastName={lastName}
              email={email}
              mobile={mobile}
            />
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Change password</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password for your own account.
                </p>
              </div>
            </div>

            <ChangePasswordForm />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Organisation</h2>
                <p className="text-sm text-muted-foreground">
                  Managed by Hugie Connect administrators.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <ProfileField
                label="Organisation"
                value={organisation?.name ?? "Not assigned"}
              />
              <ProfileField
                label="Roles"
                value={profile.roles.map((role) => role.replace("_", " ")).join(", ")}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Linked membership</h2>
                <p className="text-sm text-muted-foreground">
                  Your member record, when connected to this account.
                </p>
              </div>
            </div>

            <LinkedMembershipSummary summary={membershipSummary} />
          </section>
        </aside>
      </div>
    </main>
  );
}
