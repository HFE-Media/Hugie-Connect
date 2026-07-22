import Link from "next/link";
import { ChevronRight, Search, UsersRound } from "lucide-react";

import {
  AdminMembershipCardStatusBadge,
  AdminMemberStatusBadge,
} from "@/components/membership/admin-member-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type {
  MemberAdminStatusFilter,
  MembersAdminPage,
} from "@/types/membership";
import { cn } from "@/lib/utils";

type AdminMembersTableProps = {
  data: MembersAdminPage;
  status?: MemberAdminStatusFilter;
  search?: string;
};

const statusFilters: Array<{ label: string; value?: MemberAdminStatusFilter }> =
  [
    { label: "All" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
    { label: "Inactive", value: "inactive" },
    { label: "Expired", value: "expired" },
  ];

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

function buildHref(params: {
  status?: MemberAdminStatusFilter;
  search?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.search) {
    searchParams.set("q", params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();

  return query ? `/admin/membership/members?${query}` : "/admin/membership/members";
}

export function AdminMembersTable({
  data,
  status,
  search,
}: AdminMembersTableProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Link
                key={filter.label}
                href={buildHref({ status: filter.value, search })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  status === filter.value ||
                    (!status && filter.value === undefined)
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-input bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <form className="flex w-full gap-2 xl:max-w-md">
            {status ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Search number, name, or email"
                className="pl-9"
              />
            </div>
            <SubmitButton pendingLabel="Searching..." variant="outline">Search</SubmitButton>
          </form>
        </div>
      </div>

      {data.members.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-muted text-primary">
            <UsersRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-base font-semibold">No members found</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Approved members will appear here. Adjust the filters if you are
            looking for an existing record.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="hidden grid-cols-[1.2fr_.9fr_.9fr_.7fr_.8fr_.8fr_auto] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground xl:grid">
            <span>Member</span>
            <span>Number</span>
            <span>Type</span>
            <span>Status</span>
            <span>Expiry</span>
            <span>Card</span>
            <span className="sr-only">Open</span>
          </div>
          <div className="divide-y">
            {data.members.map((member) => (
              <Link
                key={member.id}
                href={`/admin/membership/members/${member.id}`}
                className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/40 xl:grid-cols-[1.2fr_.9fr_.9fr_.7fr_.8fr_.8fr_auto] xl:items-center"
              >
                <div>
                  <p className="font-medium">{member.memberName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.memberEmail ?? "No email"}
                  </p>
                </div>
                <p className="text-sm font-medium">{member.member_number}</p>
                <div>
                  <p className="text-sm font-medium">
                    {member.membershipTypeName}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">
                    {member.membershipTypeCode}
                  </p>
                </div>
                <AdminMemberStatusBadge status={member.derivedStatus} />
                <p className="text-sm text-muted-foreground">
                  {formatDate(member.expires_at)}
                </p>
                <AdminMembershipCardStatusBadge
                  status={member.currentCardStatus}
                />
                <ChevronRight
                  className="hidden h-4 w-4 text-muted-foreground xl:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 text-sm text-muted-foreground shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing page {data.page} of {data.pageCount} - {data.totalCount} total
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={buildHref({
                status,
                search,
                page: Math.max(1, data.page - 1),
              })}
              aria-disabled={data.page <= 1}
              className={data.page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link
              href={buildHref({
                status,
                search,
                page: Math.min(data.pageCount, data.page + 1),
              })}
              aria-disabled={data.page >= data.pageCount}
              className={
                data.page >= data.pageCount
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
