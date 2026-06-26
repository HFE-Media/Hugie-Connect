import { cn } from "@/lib/utils";

type FormMessageProps = {
  status: "idle" | "success" | "error";
  message: string;
};

export function FormMessage({ status, message }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        status === "success" &&
          "border-green-200 bg-green-50 text-green-800",
        status === "error" && "border-red-200 bg-red-50 text-red-800",
      )}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
