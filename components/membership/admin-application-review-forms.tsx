import { CheckCircle2, XCircle, Ban } from "lucide-react";

import {
  approveMembershipApplicationAdminAction,
  cancelMembershipApplicationAdminAction,
  rejectMembershipApplicationAdminAction,
} from "@/features/membership/admin-actions";
import type { MembershipApplicationAdminDetail } from "@/types/membership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminApplicationReviewFormsProps = {
  application: MembershipApplicationAdminDetail;
};

function getDefaultStartDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultEndDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);

  return date.toISOString().slice(0, 10);
}

export function AdminApplicationReviewForms({
  application,
}: AdminApplicationReviewFormsProps) {
  if (application.status !== "pending") {
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Review complete</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This application is no longer pending. Only pending applications can
          be approved, rejected, or cancelled.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Approve application</h2>
            <p className="text-sm text-muted-foreground">
              Creates the member, current period, membership card, and audit log.
            </p>
          </div>
        </div>

        <form
          action={approveMembershipApplicationAdminAction}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          <input type="hidden" name="applicationId" value={application.id} />
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="memberNumber">Member number</Label>
            <Input
              id="memberNumber"
              name="memberNumber"
              placeholder="Example: MEM-0001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodStartsAt">Start date</Label>
            <Input
              id="periodStartsAt"
              name="periodStartsAt"
              type="date"
              defaultValue={getDefaultStartDate()}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodEndsAt">End date</Label>
            <Input
              id="periodEndsAt"
              name="periodEndsAt"
              type="date"
              defaultValue={getDefaultEndDate()}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Approve
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
            <XCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Reject application</h2>
            <p className="text-sm text-muted-foreground">
              Records a reason and keeps the decision auditable.
            </p>
          </div>
        </div>

        <form action={rejectMembershipApplicationAdminAction} className="mt-5 space-y-4">
          <input type="hidden" name="applicationId" value={application.id} />
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection reason</Label>
            <Input
              id="rejectionReason"
              name="rejectionReason"
              placeholder="Short reason"
              required
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            Reject
          </Button>
        </form>

        <form
          action={cancelMembershipApplicationAdminAction}
          className="mt-6 border-t pt-5"
        >
          <input type="hidden" name="applicationId" value={application.id} />
          <input
            type="hidden"
            name="rejectionReason"
            value="Cancelled by administrator"
          />
          <Button type="submit" variant="outline" className="w-full">
            <Ban className="mr-2 h-4 w-4" aria-hidden="true" />
            Cancel application
          </Button>
        </form>
      </section>
    </div>
  );
}
