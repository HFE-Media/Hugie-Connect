import { ShieldCheck } from "lucide-react";

import { MembershipVerificationScanner } from "@/components/membership/membership-verification-scanner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { requirePermission } from "@/services/auth/server";

export const dynamic = "force-dynamic";

export default async function MembershipVerificationPage() {
  await requirePermission("membership:verify");

  return (
    <main className="container py-6 sm:py-8">
      <ProtectedPageHeader
        title="Membership Scanner"
        description="Verify a membership card and review its current status."
        icon={ShieldCheck}
        breadcrumbs={[{ label: "Scanner", href: "/scanner" }, { label: "Membership Scanner" }]}
      />

      <MembershipVerificationScanner />
    </main>
  );
}
