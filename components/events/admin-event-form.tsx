import { saveEventAdminAction } from "@/features/events/admin-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventCategory, EventWithCategory } from "@/types/events";

type AdminEventFormProps = {
  categories: EventCategory[];
  event?: EventWithCategory;
};

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

export function AdminEventForm({ categories, event }: AdminEventFormProps) {
  return (
    <form action={saveEventAdminAction} className="space-y-5">
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={event?.title}
            maxLength={160}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={event?.category_id ?? ""}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={event?.visibility ?? "public"}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="public">Public</option>
            <option value="members_only">Members only</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(event?.starts_at)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(event?.ends_at)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="venue"
            name="venue"
            defaultValue={event?.venue ?? ""}
            maxLength={240}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            step={1}
            defaultValue={event?.capacity ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="featuredImageUrl">Featured image URL <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="featuredImageUrl"
            name="featuredImageUrl"
            type="url"
            defaultValue={event?.featured_image_url ?? ""}
            maxLength={1000}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="summary">Summary <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="summary"
            name="summary"
            defaultValue={event?.summary ?? ""}
            maxLength={240}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <textarea
            id="description"
            name="description"
            defaultValue={event?.description ?? ""}
            maxLength={5000}
            rows={8}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <SubmitButton pendingLabel={event ? "Saving event..." : "Creating draft..."}>
        {event ? "Save event" : "Create draft"}
      </SubmitButton>
    </form>
  );
}
