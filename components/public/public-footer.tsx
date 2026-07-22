import Link from "next/link";

import { BrandMark } from "@/components/public/brand-mark";

export function PublicFooter() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-10 md:grid-cols-[1fr_auto_auto] md:py-12">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <BrandMark inverse />
            <div>
              <p className="text-sm font-semibold">Hugie Connect</p>
              <p className="mt-1 text-xs text-primary-foreground/65">
                Community, connected
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/70">
            Memberships, events, digital access and administration in one
            secure, mobile-friendly platform.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-primary-foreground/60">
            Explore
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link className="footer-link" href="/events">Events</Link>
            <Link className="footer-link" href="/membership/apply">Membership</Link>
            <Link className="footer-link" href="/login">Member sign in</Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-primary-foreground/60">
            Connect
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <a
              className="footer-link"
              href="mailto:hello@hugieconnect.co.za?subject=Hugie%20Connect%20demo%20request"
            >
              Request a demo
            </a>
            <a className="footer-link" href="mailto:hello@hugieconnect.co.za">
              Contact us
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4 text-xs text-primary-foreground/55">
          &copy; {new Date().getFullYear()} Hugie Connect. Built for stronger communities.
        </div>
      </div>
    </footer>
  );
}
