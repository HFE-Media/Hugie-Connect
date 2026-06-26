import type { AppRole, Permission } from "@/types/auth";

const rolePermissions = {
  super_admin: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
    "scanner:shell:view",
    "users:roles:manage",
  ],
  school_admin: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  finance: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  ohb_admin: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  hok_admin: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  event_manager: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  shop_manager: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "admin:shell:view",
  ],
  gate_staff: [
    "portal:view",
    "profile:view_own",
    "membership:view_own",
    "scanner:shell:view",
  ],
  member: ["portal:view", "profile:view_own", "membership:view_own"],
  public_user: ["portal:view", "profile:view_own", "membership:view_own"],
  guest_user: [],
} satisfies Record<AppRole, Permission[]>;

export function hasRole(roles: AppRole[], allowedRoles: AppRole[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

export function hasPermission(roles: AppRole[], permission: Permission) {
  return roles.some((role) =>
    (rolePermissions[role] as readonly Permission[]).includes(permission),
  );
}

export function getDefaultAuthenticatedRole(): AppRole {
  return "public_user";
}

export function getPostLoginPath(roles: AppRole[]) {
  if (hasPermission(roles, "scanner:shell:view")) {
    return "/scanner";
  }

  if (hasPermission(roles, "admin:shell:view")) {
    return "/admin";
  }

  return "/portal";
}
