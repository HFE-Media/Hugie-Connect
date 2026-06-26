import { ScanLine } from "lucide-react";

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
          Gate access is protected for eligible roles. Scanner workflows,
          events, ticket validation, and QR logic begin in later sprints.
        </p>
      </section>
    </main>
  );
}
