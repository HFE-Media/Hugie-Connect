import type { AuthActionState } from "@/features/auth/actions";

export function getInitialAuthActionState(): AuthActionState {
  return {
    status: "idle",
    message: "",
  };
}
