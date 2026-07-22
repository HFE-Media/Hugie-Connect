import { PublicPageShell } from "@/components/public/public-page-shell";

export default function MembershipApplicationLoading() {
  return (
    <PublicPageShell>
      <main aria-busy="true" aria-label="Loading membership application">
        <section className="border-b bg-card">
          <div className="container py-14">
            <div className="h-4 w-44 animate-pulse rounded bg-muted" />
            <div className="mt-6 h-12 max-w-2xl animate-pulse rounded bg-muted" />
            <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-muted" />
          </div>
        </section>
        <div className="container py-12">
          <div className="mx-auto max-w-3xl space-y-5 rounded-lg border bg-card p-6">
            <div className="h-6 w-56 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="h-44 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
