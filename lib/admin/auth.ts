import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Every admin page and every write goes through this.
 *
 * `getUser()` revalidates the token against Supabase rather than trusting the
 * cookie, so a forged or expired session cannot reach the service-role client.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  // A failure here is not the same as "not logged in": it means the token
  // could not be checked against Supabase at all. Treating the two alike is
  // how an outage gets mistaken for a wave of logouts.
  if (error && error.name !== "AuthSessionMissingError") {
    logger.warn("auth.check_failed", { err: error });
  }

  return data.user;
}

/** Redirects to the login screen when there is no valid session. */
export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    // Every rejected attempt at the panel is worth a line: one is someone who
    // let a session expire, a burst of them is something else entirely.
    logger.warn("auth.denied", {});
    redirect("/admin/login");
  }

  return user;
}
