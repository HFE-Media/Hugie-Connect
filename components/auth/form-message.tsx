import { FeedbackAlert } from "@/components/ui/feedback-alert";

type FormMessageProps = {
  status: "idle" | "success" | "error";
  message: string;
};

export function FormMessage({ status, message }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return <FeedbackAlert tone={status === "error" ? "error" : "success"} message={message} />;
}
