import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ProtectedPageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
};

export function ProtectedPageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
}: ProtectedPageHeaderProps) {
  return (
    <header className="mb-6">
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto">
          <ol className="flex min-w-max items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
                {item.href ? (
                  <Link href={item.href} className="rounded-sm px-1 py-1 hover:text-foreground hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="px-1 py-1 font-medium text-foreground" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
