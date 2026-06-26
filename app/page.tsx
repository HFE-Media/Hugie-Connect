import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const foundationItems = [
  "App Router foundation",
  "Typed service boundaries",
  "Supabase-ready architecture",
  "Mobile-first design system",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="border-b bg-card">
        <div className="container flex min-h-screen flex-col justify-between py-6 sm:py-8">
          <nav className="flex items-center justify-between" aria-label="Main">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  Hugie Connect
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Community platform
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sprint 00
            </Button>
          </nav>

          <div className="grid items-center gap-10 py-16 lg:grid-cols-[1fr_420px] lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                Foundation in progress
              </div>
              <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                A calm, secure foundation for a reusable community platform.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Hugie Connect is being built as a production-grade SaaS
                platform for memberships, events, access control, merchandise,
                and administration. Sprint 00 establishes the technical base
                before any business modules are added.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg">
                  View foundation
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="lg">
                  Documentation first
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-5 shadow-soft">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Sprint 00 Scope</h2>
                  <p className="text-sm text-muted-foreground">
                    Architecture only, no feature modules.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {foundationItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm"
                  >
                    <span>{item}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Ready
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 pb-4 text-sm text-muted-foreground sm:grid-cols-3">
            <p>Platform-first architecture</p>
            <p>Server-side security posture</p>
            <p>HFE Design Language aligned</p>
          </div>
        </div>
      </section>
    </main>
  );
}
