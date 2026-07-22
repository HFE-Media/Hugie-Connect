import Link from "next/link";
import { Compass } from "lucide-react";

import { PublicPageShell } from "@/components/public/public-page-shell";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PublicPageShell>
      <main className="flex min-h-[70svh] items-center justify-center bg-background px-4 py-12">
        <section className="w-full max-w-lg text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold text-secondary">404</p>
          <h1 className="mt-2 text-3xl font-semibold">We could not find that page</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The link may be out of date, or the page may have moved. You can return
            home or explore the latest community events.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">View events</Link>
            </Button>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
