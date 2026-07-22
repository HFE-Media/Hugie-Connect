import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type FeedbackAlertProps = {
  tone: "success" | "error" | "info";
  message?: string | null;
  className?: string;
};

export function FeedbackAlert({ tone, message, className }: FeedbackAlertProps) {
  if (!message) return null;

  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
        tone === "info" && "border-blue-200 bg-blue-50 text-blue-800",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="leading-6">{message}</p>
    </div>
  );
}
