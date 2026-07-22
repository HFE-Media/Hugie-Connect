import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

type PublicServiceStateProps = {
  title: string;
  description: string;
};

export function PublicServiceState({
  title,
  description,
}: PublicServiceStateProps) {
  return (
    <section className="border-y bg-card">
      <div className="container py-16 text-center sm:py-20">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href="">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:hello@hugieconnect.co.za">Contact support</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
