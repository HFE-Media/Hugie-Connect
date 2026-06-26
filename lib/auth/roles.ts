import { APP_ROLES, type AppRole } from "@/types/auth";

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

function normaliseRoles(value: unknown): AppRole[] {
  if (Array.isArray(value)) {
    return value.filter(isAppRole);
  }

  if (isAppRole(value)) {
    return [value];
  }

  return [];
}

export function resolveUserRoles(appMetadata?: unknown, userMetadata?: unknown) {
  const appData =
    appMetadata && typeof appMetadata === "object"
      ? (appMetadata as Record<string, unknown>)
      : {};
  const userData =
    userMetadata && typeof userMetadata === "object"
      ? (userMetadata as Record<string, unknown>)
      : {};

  const roles = [
    ...normaliseRoles(appData.roles),
    ...normaliseRoles(appData.role),
    ...normaliseRoles(userData.roles),
    ...normaliseRoles(userData.role),
  ];

  return Array.from(new Set(roles));
}
