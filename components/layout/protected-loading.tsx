export function ProtectedLoading({ rows = 3 }: { rows?: number }) {
  return (
    <main className="container py-6 sm:py-8" aria-busy="true" aria-label="Loading page">
      <div className="animate-pulse">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="mt-5 h-8 w-64 max-w-full rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-muted" />
        <div className="mt-8 space-y-3 rounded-lg border bg-card p-4 sm:p-5">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="h-16 rounded-md bg-muted/70" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </main>
  );
}
