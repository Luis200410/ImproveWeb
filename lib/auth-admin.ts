import { User } from "@supabase/supabase-js";

/**
 * Validates whether a Supabase user possesses administrator privileges.
 * 
 * Supports:
 * 1. Supabase standard RBAC claims (`app_metadata.role === 'admin'`)
 * 2. User metadata claims (`user_metadata.role === 'admin'` or `is_admin === true`)
 * 3. Environment whitelist via `ADMIN_EMAILS` or `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated)
 * 4. Official company domain emails (`@improve-club.com`)
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) {
    return false;
  }

  const email = user.email.toLowerCase().trim();

  // 1. App Metadata (server-managed Supabase custom claims)
  if (
    user.app_metadata?.role === "admin" ||
    user.app_metadata?.is_admin === true ||
    user.app_metadata?.role === "superadmin"
  ) {
    return true;
  }

  // 2. User Metadata
  if (
    user.user_metadata?.role === "admin" ||
    user.user_metadata?.is_admin === true ||
    user.user_metadata?.role === "superadmin"
  ) {
    return true;
  }

  // 3. Environment Variable Whitelist
  const envAdmins = (
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdmins.includes(email)) {
    return true;
  }

  // 4. Default official team domain
  if (email.endsWith("@improve-club.com")) {
    return true;
  }

  return false;
}
