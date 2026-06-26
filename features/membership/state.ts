export type MembershipApplicationActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export function getInitialMembershipApplicationState(): MembershipApplicationActionState {
  return {
    status: "idle",
    message: "",
  };
}
