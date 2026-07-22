import { PublicPageShell } from "@/components/public/public-page-shell";

export default function EventsLoading() {
  return (
    <PublicPageShell>
      <main aria-busy="true" aria-label="Loading events">
        <section className="border-b bg-card">
          <div className="container py-14">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="mt-6 h-10 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-muted" />
          </div>
        </section>
        <div className="container grid gap-4 py-12 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border bg-card">
              <div className="h-44 animate-pulse bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </PublicPageShell>
  );
}
