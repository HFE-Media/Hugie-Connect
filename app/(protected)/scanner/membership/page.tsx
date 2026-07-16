import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { MembershipVerificationScanner } from "@/components/membership/membership-verification-scanner";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function MembershipVerificationPage() {
  await requirePermission("membership:verify");

  return (
    <main className="container py-6 sm:py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/scanner">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Scanner shell
          </Link>
        </Button>
      </div>

      <section className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal sm:text-3xl">
          Membership verification
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Verify existing membership QR codes against the secure membership
          card record. This does not admit guests to events or record scans.
        </p>
      </section>

      <MembershipVerificationScanner />
    </main>
  );
}
