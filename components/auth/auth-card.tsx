import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { BrandMark } from "@/components/public/brand-mark";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 flex min-h-11 items-center gap-3 self-start rounded-lg">
          <BrandMark />
          <div>
            <p className="text-sm font-semibold leading-none">Hugie Connect</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Community, connected
            </p>
          </div>
        </Link>

        <section className="rounded-lg border bg-card p-6 shadow-soft sm:p-7">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="mt-6">{children}</div>
        </section>

        <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Your account and personal information are protected through secure sign-in.</p>
        </div>
      </div>
    </main>
  );
}
