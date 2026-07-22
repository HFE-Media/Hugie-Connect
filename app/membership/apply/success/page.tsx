import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";

import { PublicPageShell } from "@/components/public/public-page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Application received",
  description: "Your Hugie Connect membership application has been received.",
};

export default function MembershipApplicationSuccessPage() {
  return (
    <PublicPageShell>
    <main className="flex min-h-[70svh] items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-lg border bg-card p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-green-50 text-green-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">
          Application submitted
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your membership application has been received and is pending review.
          The organisation will review your details and contact you about the next steps.
        </p>
        <div className="mt-5 flex items-start gap-3 rounded-lg border bg-background p-4 text-left">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">
            Keep an eye on your inbox. If approved, you will receive secure instructions for accessing your account.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
    </PublicPageShell>
  );
}
