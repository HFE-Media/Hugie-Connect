import Link from "next/link";
import { ShieldCheck, ScanLine, TicketCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function ScannerShellPage() {
  const profile = await requirePermission("scanner:shell:view");
  const showMembershipScanner = hasPermission(profile.roles, "membership:verify");
  const showTicketScanner = hasPermission(profile.roles, "events:tickets:scan");

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <ScanLine className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Scanner</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose the scanner flow for the code in front of you. Membership QR
          verification and event ticket check-in stay separate.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
        </div>
      </section>
    </main>
  );
}
