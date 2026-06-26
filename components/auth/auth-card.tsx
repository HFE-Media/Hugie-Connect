import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 flex items-center gap-3 self-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Hugie Connect</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Secure access
            </p>
          </div>
        </Link>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
