/**
 * Auth session helpers — keep login/logout routing free of stale localStorage flags.
 */

export const AUTH_STORAGE_KEYS = [
  "token",
  "email",
  "firstname",
  "name",
  "role",
  "isDoctor",
  "id",
  "organization_id",
  "clinic_id",
];

/** Keys that should survive logout (UI prefs only). */
const PRESERVE_KEYS = ["sidebarCollapsed"];

/**
 * Clear auth-related localStorage. Prefer this over removing only token/firstname.
 */
export function clearAuthSession() {
  if (typeof window === "undefined") return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      /* ignore */
    }
  });
}

/**
 * Full wipe except a small allowlist of UI prefs.
 * Use when switching accounts to avoid cross-role contamination.
 */
export function resetLocalSession() {
  if (typeof window === "undefined") return;

  const preserved = {};
  PRESERVE_KEYS.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value != null) preserved[key] = value;
    } catch (_) {
      /* ignore */
    }
  });

  try {
    localStorage.clear();
  } catch (_) {
    clearAuthSession();
  }

  Object.entries(preserved).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      /* ignore */
    }
  });
}

export function getHomePathForRole(roleName) {
  const name = String(roleName || "").trim().toLowerCase();
  if (name === "doctor") return "/dashboard/doctor";
  if (name === "dialysis technician") return "/patients";
  return "/dashboard";
}
