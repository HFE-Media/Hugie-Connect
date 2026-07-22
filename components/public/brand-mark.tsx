import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  inverse?: boolean;
};

export function BrandMark({ className, inverse = false }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold",
        inverse
          ? "bg-white text-primary"
          : "bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      HC
    </span>
  );
}
