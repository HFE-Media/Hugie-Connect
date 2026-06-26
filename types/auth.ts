export const APP_ROLES = [
  "super_admin",
  "school_admin",
  "finance",
  "ohb_admin",
  "hok_admin",
  "event_manager",
  "shop_manager",
  "gate_staff",
  "member",
  "public_user",
  "guest_user",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type Permission =
  | "portal:view"
  | "profile:view_own"
  | "membership:view_own"
  | "admin:shell:view"
  | "scanner:shell:view"
  | "users:roles:manage";

export type AuthProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organisationId: string | null;
  roles: AppRole[];
};
