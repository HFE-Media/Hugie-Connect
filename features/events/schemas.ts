import { z } from "zod";

export const eventStatusSchema = z.enum([
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const eventVisibilitySchema = z.enum(["public", "members_only"]);

export const eventCategoryStatusSchema = z.enum([
  "active",
  "inactive",
  "archived",
]);

export const eventDateFilterSchema = z.enum(["upcoming", "past", "all"]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

export const eventEditorSchema = z
  .object({
    organisationId: z.string().uuid(),
    eventId: z.string().uuid().optional(),
    reviewedByUserId: z.string().uuid(),
    categoryId: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null)
      .pipe(z.string().uuid().nullable()),
    title: z.string().trim().min(1, "Event title is required.").max(160),
    summary: optionalText(240),
    description: optionalText(5000),
    venue: optionalText(240),
    startsAt: z.coerce.date({
      required_error: "Start date and time are required.",
      invalid_type_error: "Enter a valid start date and time.",
    }),
    endsAt: z.coerce.date({
      required_error: "End date and time are required.",
      invalid_type_error: "Enter a valid end date and time.",
    }),
    capacity: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : null))
      .pipe(
        z
          .number()
          .int("Capacity must be a whole number.")
          .positive("Capacity must be positive.")
          .nullable(),
      ),
    visibility: eventVisibilitySchema,
    featuredImageUrl: optionalText(1000).pipe(
      z.string().url("Enter a valid image URL.").nullable(),
    ),
  })
  .superRefine((value, context) => {
    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End date must be after the start date.",
      });
    }
  });

export const listAdminEventsSchema = z.object({
  organisationId: z.string().uuid(),
  search: z.string().trim().max(160).optional(),
  status: eventStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  dateFilter: eventDateFilterSchema.default("upcoming"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const listPublicEventsSchema = z.object({
  search: z.string().trim().max(160).optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
});

export const updateEventStatusSchema = z.object({
  organisationId: z.string().uuid(),
  eventId: z.string().uuid(),
  reviewedByUserId: z.string().uuid(),
  status: z.enum(["published", "cancelled"]),
});

export type EventEditorValues = z.infer<typeof eventEditorSchema>;
export type ListAdminEventsValues = z.infer<typeof listAdminEventsSchema>;
export type ListPublicEventsValues = z.infer<typeof listPublicEventsSchema>;
export type UpdateEventStatusValues = z.infer<typeof updateEventStatusSchema>;
