import type { Json } from "@/types/database";
import type { MembershipApplicationAdminDetail } from "@/types/membership";
import { AdminApplicationStatusBadge } from "@/components/membership/admin-application-status-badge";

type AdminApplicationDetailProps = {
  application: MembershipApplicationAdminDetail;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not reviewed";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderMetadataValue(value: Json) {
  if (value === null) {
    return "Not set";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return JSON.stringify(value);
}

function getSafeMetadataEntries(value: Json) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).filter(([key]) => !key.toLowerCase().includes("token"));
}

export function AdminApplicationDetail({
  application,
}: AdminApplicationDetailProps) {
  const metadataEntries = getSafeMetadataEntries(application.application_data);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Applicant
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {application.first_name} {application.last_name}
            </h1>
          </div>
          <AdminApplicationStatusBadge status={application.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Email" value={application.email} />
          <DetailItem label="Mobile" value={application.mobile ?? "Not set"} />
          <DetailItem
            label="Membership type"
            value={`${application.membershipTypeName} (${application.membershipTypeCode})`}
          />
          <DetailItem
            label="Application date"
            value={formatDateTime(application.created_at)}
          />
          <DetailItem
            label="Reviewed by"
            value={application.reviewedByName ?? "Not reviewed"}
          />
          <DetailItem
            label="Reviewed at"
            value={formatDateTime(application.reviewed_at)}
          />
        </div>

        {application.membershipTypeDescription ? (
          <div className="mt-6 rounded-xl border bg-muted/40 p-4">
            <p className="text-sm font-semibold">Membership type description</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {application.membershipTypeDescription}
            </p>
          </div>
        ) : null}

        {application.rejection_reason ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="text-sm font-semibold">Review reason</p>
            <p className="mt-2 text-sm leading-6">{application.rejection_reason}</p>
          </div>
        ) : null}
      </section>

      <aside className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Application metadata</h2>
        {metadataEntries.length > 0 ? (
          <dl className="mt-4 space-y-3">
            {metadataEntries.map(([key, value]) => (
              <div key={key} className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {key}
                </dt>
                <dd className="mt-1 break-words text-sm">
                  {renderMetadataValue(value ?? null)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No safe metadata is available for this application.
          </p>
        )}
      </aside>
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
