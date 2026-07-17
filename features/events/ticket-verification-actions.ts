"use server";

import { z } from "zod";

import { requirePermission } from "@/services/auth/server";
import { createEventsAdminService } from "@/services/events/service";
import type { EventTicketScanResult } from "@/types/events";

const scanEventTicketSchema = z.object({
  eventId: z.string().uuid(),
  payload: z.string().trim().min(1).max(512),
});

export async function scanEventTicketAction(input: {
  eventId: string;
  payload: string;
}): Promise<EventTicketScanResult> {
  const profile = await requirePermission("events:tickets:scan");
  const result = scanEventTicketSchema.safeParse(input);

  if (!result.success) {
    return {
      tone: "invalid",
      title: "Invalid ticket QR",
      message: "Choose an event and scan or enter an event ticket QR code.",
    };
  }

  return createEventsAdminService().scanEventTicket({
    eventId: result.data.eventId,
    payload: result.data.payload,
    verifierAuthUserId: profile.id,
    canScanAllOrganisations: profile.roles.includes("super_admin"),
  });
}
