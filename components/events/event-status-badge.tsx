import type { EventStatus, EventVisibility } from "@/types/events";
import { cn } from "@/lib/utils";

const statusLabels = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
} satisfies Record<EventStatus, string>;

const visibilityLabels = {
  public: "Public",
  members_only: "Members only",
} satisfies Record<EventVisibility, string>;

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "published" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "draft" && "border-border bg-muted text-muted-foreground",
        status === "cancelled" && "border-red-200 bg-red-50 text-red-700",
        status === "completed" && "border-blue-200 bg-blue-50 text-blue-700",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function EventVisibilityBadge({
  visibility,
}: {
  visibility: EventVisibility;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        visibility === "public" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        visibility === "members_only" &&
          "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {visibilityLabels[visibility]}
    </span>
  );
}
