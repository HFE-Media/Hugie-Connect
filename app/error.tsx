"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { BrandMark } from "@/components/public/brand-mark";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error("Application route error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col justify-center">
        <Link href="/" className="mb-8 flex min-h-11 items-center gap-3 self-start rounded-lg">
          <BrandMark />
          <span className="text-sm font-semibold">Hugie Connect</span>
        </Link>

        <section className="rounded-lg border bg-card p-6 text-center shadow-soft sm:p-8" role="alert">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">We could not load this page</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This may be a temporary connection problem. Try again, or return home
            if the issue continues.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
          <a
            href="mailto:hello@hugieconnect.co.za"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-secondary hover:underline"
          >
            Contact support
          </a>
        </section>
      </div>
    </main>
  );
}
