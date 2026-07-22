import { PauseCircle, PlayCircle } from "lucide-react";

import { updateMemberStatusAdminAction } from "@/features/membership/admin-actions";
import type { MemberAdminDetail } from "@/types/membership";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { SubmitButton } from "@/components/ui/submit-button";

type AdminMemberActionsProps = {
  member: MemberAdminDetail;
};

export function AdminMemberActions({ member }: AdminMemberActionsProps) {
  const canSuspend = member.status === "active" || member.status === "pending";
  const canReactivate =
    member.status === "suspended" || member.status === "expired";

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold">Member actions</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Status changes are audited. Reactivation does not create or extend
        membership periods and does not change card state.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <form action={updateMemberStatusAdminAction}>
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="status" value="suspended" />
          <ConfirmSubmitButton
            variant="destructive"
            disabled={!canSuspend}
            className="w-full sm:w-auto"
            title="Suspend this member?"
            description="The member will lose active membership access and their membership QR will no longer verify. Their history and records will be preserved."
            confirmLabel="Suspend member"
            pendingLabel="Suspending member..."
          >
            <PauseCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Suspend member
          </ConfirmSubmitButton>
        </form>

        <form action={updateMemberStatusAdminAction}>
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="status" value="active" />
          <SubmitButton
            variant="outline"
            disabled={!canReactivate}
            className="w-full sm:w-auto"
            pendingLabel="Reactivating member..."
          >
            <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Reactivate member
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
