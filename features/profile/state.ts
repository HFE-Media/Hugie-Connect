import type { ProfileActionState } from "@/features/profile/actions";

export function getInitialProfileActionState(): ProfileActionState {
  return {
    status: "idle",
    message: "",
  };
}
