import Link from "next/link";
import { ShieldCheck, ScanLine, TicketCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { hasPermission } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function ScannerShellPage() {
  const profile = await requirePermission("scanner:shell:view");
  const showMembershipScanner = hasPermission(profile.roles, "membership:verify");
  const showTicketScanner = hasPermission(profile.roles, "events:tickets:scan");

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Scanner Hub"
        description="Choose the verification tool for the code in front of you."
        icon={ScanLine}
      />
      <section aria-label="Scanner tools" className="grid gap-4 sm:grid-cols-2">
          {showMembershipScanner ? (
            <Button asChild variant="outline" className="h-auto justify-start p-4">
              <Link href="/scanner/membership">
                <ShieldCheck className="mr-3 h-5 w-5" aria-hidden="true" />
                <span className="text-left">
                  <span className="block font-semibold">Verify Membership</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Check membership QR status.
                  </span>
                </span>
              </Link>
            </Button>
          ) : null}

          {showTicketScanner ? (
            <Button asChild variant="outline" className="h-auto justify-start p-4">
              <Link href="/scanner/tickets">
                <TicketCheck className="mr-3 h-5 w-5" aria-hidden="true" />
                <span className="text-left">
                  <span className="block font-semibold">Scan Event Ticket</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Validate and check in event tickets.
                  </span>
                </span>
              </Link>
            </Button>
          ) : null}
      </section>
    </main>
  );
}
