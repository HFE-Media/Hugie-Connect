import type { AppRole, Permission } from "@/types/auth";

const rolePermissions = {
  super_admin: [
    "portal:view",
    "profile:view_own",
    "admin:shell:view",
    "membership:applications:manage",
    "membership:members:manage",
    "membership:renew",
    "membership:cards:manage",
    "events:view",
    "events:manage",
    "membership:verify",
    "scanner:shell:view",
    "users:roles:manage",
  ],
  school_admin: [
    "portal:view",
    "profile:view_own",
    "admin:shell:view",
    "membership:applications:manage",
    "membership:members:manage",
    "membership:renew",
    "membership:cards:manage",
    "events:view",
    "events:manage",
    "membership:verify",
  ],
  finance: ["portal:view", "profile:view_own", "admin:shell:view"],
  ohb_admin: [
    "portal:view",
    "profile:view_own",
    "admin:shell:view",
    "membership:applications:manage",
    "membership:members:manage",
    "membership:renew",
    "membership:cards:manage",
    "events:view",
    "membership:verify",
  ],
  hok_admin: [
    "portal:view",
    "profile:view_own",
    "admin:shell:view",
    "membership:applications:manage",
    "membership:members:manage",
    "membership:renew",
    "membership:cards:manage",
    "events:view",
    "membership:verify",
  ],
  event_manager: [
    "portal:view",
    "profile:view_own",
    "admin:shell:view",
    "events:view",
    "events:manage",
  ],
  shop_manager: ["portal:view", "profile:view_own", "admin:shell:view"],
  gate_staff: [
    "portal:view",
    "profile:view_own",
    "membership:verify",
    "scanner:shell:view",
  ],
  member: ["portal:view", "profile:view_own", "events:view"],
  public_user: ["portal:view", "profile:view_own", "events:view"],
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
