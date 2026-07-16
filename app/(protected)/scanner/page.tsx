import Link from "next/link";
import { ShieldCheck, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function ScannerShellPage() {
  await requirePermission("scanner:shell:view");

  return (
    <main className="container py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <ScanLine className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Scanner shell</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Gate access is protected for eligible roles. Membership verification
          is available separately from future event and ticket scanner flows.
        </p>
        <Button asChild className="mt-5">
          <Link href="/scanner/membership">
            <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            Verify membership QR
          </Link>
        </Button>
      </section>
    </main>
  );
}
