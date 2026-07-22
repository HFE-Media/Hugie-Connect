import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Church,
  CreditCard,
  Files,
  GraduationCap,
  QrCode,
  ScanLine,
  Settings2,
  ShieldCheck,
  Smartphone,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PublicPageShell } from "@/components/public/public-page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Community management made simple",
  description:
    "Hugie Connect brings memberships, events, digital cards, QR ticketing and administration together for schools and community organisations.",
  openGraph: {
    title: "Hugie Connect | Community management made simple",
    description:
      "A secure, mobile-friendly platform for memberships, events and community access.",
    images: ["/images/hugie-connect-community-hero.png"],
  },
};

const audiences = [
  { icon: GraduationCap, label: "Schools" },
  { icon: Church, label: "Churches" },
  { icon: Trophy, label: "Sports clubs" },
  { icon: UsersRound, label: "Alumni associations" },
  { icon: Building2, label: "Community organisations" },
];

const features = [
  {
    icon: UsersRound,
    title: "Membership management",
    description: "Keep applications, member records and renewal history organised.",
  },
  {
    icon: CreditCard,
    title: "Digital membership cards",
    description: "Give every member a secure, mobile-ready proof of membership.",
  },
  {
    icon: CalendarDays,
    title: "Event management",
    description: "Publish events and keep dates, venues and attendance details clear.",
  },
  {
    icon: QrCode,
    title: "QR ticketing",
    description: "Issue secure digital tickets that are ready at the gate.",
  },
  {
    icon: ScanLine,
    title: "Faster gate access",
    description: "Verify memberships and event tickets from a phone in seconds.",
  },
  {
    icon: Settings2,
    title: "Professional administration",
    description: "Give authorised teams calm, role-aware tools for daily operations.",
  },
];

const benefits = [
  "Reduce paperwork and duplicate records",
  "Improve the day-to-day member experience",
  "Move people through event gates faster",
  "Keep sensitive member records secure",
  "Work confidently from desktop or mobile",
];

export default function HomePage() {
  return (
    <PublicPageShell>
      <main>
        <section className="relative min-h-[calc(100svh-10rem)] overflow-hidden bg-primary text-white">
          <Image
            src="/images/hugie-connect-community-hero.png"
            alt="A community arriving at a well-organised school event"
            fill
            priority
            quality={88}
            sizes="100vw"
            className="object-cover object-[64%_center]"
          />
          <div className="absolute inset-0 bg-primary/80" aria-hidden="true" />
          <div className="container relative flex min-h-[calc(100svh-10rem)] items-center py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                Secure community management
              </p>
              <h1 className="mt-5 text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
                Hugie Connect
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-white sm:text-2xl">
                One connected place for memberships, events and community access.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                Help your team reduce paperwork, serve members better and run
                professional events with secure tools that work anywhere.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/membership/apply">
                    Apply for membership
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-primary"
                >
                  <Link href="/events">View events</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="mailto:hello@hugieconnect.co.za?subject=Hugie%20Connect%20demo%20request">
                    Request a demo
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-card" aria-labelledby="audience-title">
          <div className="container py-12 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-secondary">Built for belonging</p>
              <h2 id="audience-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
                A better way to run connected communities
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              {audiences.map(({ icon: Icon, label }) => (
                <div key={label} className="flex min-h-28 flex-col justify-between rounded-lg border bg-background p-4">
                  <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                  <p className="mt-5 text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-20" aria-labelledby="features-title">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-14">
            <div>
              <p className="text-sm font-semibold text-secondary">Everything in one place</p>
              <h2 id="features-title" className="mt-2 text-3xl font-semibold sm:text-4xl">
                Practical tools for every part of the experience
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                From a first application to a busy event gate, Hugie Connect
                keeps people and information moving clearly.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-t pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground" aria-labelledby="benefits-title">
          <div className="container grid gap-10 py-16 lg:grid-cols-[1fr_420px] lg:items-center lg:py-20">
            <div>
              <p className="text-sm font-semibold text-accent">Less administration. More connection.</p>
              <h2 id="benefits-title" className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
                Give your team confidence and your members a smoother experience.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/70">
                Clear records and mobile access mean fewer queues, fewer manual
                handovers and more time for the community itself.
              </p>
            </div>
            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 border-b border-white/10 pb-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b bg-card">
          <div className="container grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-secondary">
                <Files className="h-5 w-5" aria-hidden="true" />
                <Smartphone className="h-5 w-5" aria-hidden="true" />
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Ready to bring your community together?</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                See how Hugie Connect can support your organisation and the people it serves.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="mailto:hello@hugieconnect.co.za?subject=Hugie%20Connect%20demo%20request">
                  Request a demo
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:hello@hugieconnect.co.za">Contact us</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
