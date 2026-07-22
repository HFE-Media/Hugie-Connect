"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Ticket,
  TicketCheck,
  UserCircle,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandMark } from "@/components/public/brand-mark";
import { cn } from "@/lib/utils";

type ProtectedShellProps = {
  children: ReactNode;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
  };
  access: {
    hasMembership: boolean;
    showAdmin: boolean;
    showApplications: boolean;
    showMembers: boolean;
    showRenewals: boolean;
    showEventAdmin: boolean;
    showTickets: boolean;
    showScanner: boolean;
    showMembershipScanner: boolean;
    showTicketScanner: boolean;
  };
};

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

function formatRole(role: string) {
  return role.replaceAll("_", " ");
}

function buildNavigation(access: ProtectedShellProps["access"]): NavigationGroup[] {
  const portalItems: NavigationItem[] = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ...(access.hasMembership
      ? [{ href: "/portal/membership", label: "Membership", icon: CreditCard }]
      : []),
    ...(access.showTickets
      ? [{ href: "/portal/tickets", label: "Tickets", icon: Ticket }]
      : []),
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/portal/profile", label: "Profile", icon: UserCircle },
  ];
  const adminItems: NavigationItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    ...(access.showApplications
      ? [{ href: "/admin/membership/applications", label: "Applications", icon: ClipboardList }]
      : []),
    ...(access.showMembers
      ? [{ href: "/admin/membership/members", label: "Members", icon: UsersRound }]
      : []),
    ...(access.showRenewals
      ? [{ href: "/admin/membership/renewals", label: "Renewals", icon: RefreshCw }]
      : []),
    ...(access.showEventAdmin
      ? [{ href: "/admin/events", label: "Events", icon: CalendarDays }]
      : []),
  ];
  const scannerItems: NavigationItem[] = [
    { href: "/scanner", label: "Scanner Hub", icon: ScanLine, exact: true },
    ...(access.showMembershipScanner
      ? [{ href: "/scanner/membership", label: "Membership Scanner", icon: ShieldCheck }]
      : []),
    ...(access.showTicketScanner
      ? [{ href: "/scanner/tickets", label: "Ticket Scanner", icon: TicketCheck }]
      : []),
  ];

  return [
    { label: "Member Portal", items: portalItems },
    ...(access.showAdmin ? [{ label: "Administration", items: adminItems }] : []),
    ...(access.showScanner ? [{ label: "Scanner", items: scannerItems }] : []),
  ];
}

function isActive(pathname: string, item: NavigationItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Navigation({ groups, pathname }: { groups: NavigationGroup[]; pathname: string }) {
  return (
    <nav aria-label="Protected navigation" className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-11 items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-accent bg-white/10 text-white"
                        : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                    {active ? (
                      <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AccountSummary({ user }: { user: ProtectedShellProps["user"] }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const role = user.roles[0] ? formatRole(user.roles[0]) : "account";

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white">{name}</p>
      <p className="mt-0.5 truncate text-xs capitalize text-slate-400">
        {role}{user.roles.length > 1 ? ` +${user.roles.length - 1}` : ""}
      </p>
    </div>
  );
}

export function ProtectedShell({ children, user, access }: ProtectedShellProps) {
  const pathname = usePathname();
  const groups = buildNavigation(access);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <a
        href="#protected-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="hidden min-h-screen bg-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link href="/portal" className="flex min-h-20 items-center gap-3 border-b border-white/10 px-5">
          <BrandMark inverse />
          <div>
            <p className="font-semibold text-white">Hugie Connect</p>
            <p className="text-xs text-slate-400">Community platform</p>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Navigation groups={groups} pathname={pathname} />
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-bold text-white">
              {(user.firstName?.[0] ?? user.email[0] ?? "U").toUpperCase()}
            </div>
            <AccountSummary user={user} />
          </div>
          <LogoutButton className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/95 px-4 backdrop-blur lg:hidden">
          <Link href="/portal" className="flex items-center gap-3" aria-label="Hugie Connect dashboard">
            <BrandMark className="h-9 w-9" />
            <span className="font-semibold">Hugie Connect</span>
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border bg-background text-foreground"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="protected-mobile-navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/60"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
            />
            <div
              ref={panelRef}
              id="protected-mobile-navigation"
              className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col bg-primary shadow-2xl"
            >
              <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-3">
                  <BrandMark inverse className="h-9 w-9" />
                  <span className="font-semibold text-white">Hugie Connect</span>
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-md text-white hover:bg-white/10"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <Navigation groups={groups} pathname={pathname} />
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="mb-4 px-2"><AccountSummary user={user} /></div>
                <LogoutButton className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" />
              </div>
            </div>
          </div>
        ) : null}

        <div id="protected-content" tabIndex={-1} className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
