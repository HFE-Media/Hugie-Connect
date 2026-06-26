import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Access restricted</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your account is active, but it does not have permission to view this
          area.
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal">Return to portal</Link>
        </Button>
      </section>
    </main>
  );
}
