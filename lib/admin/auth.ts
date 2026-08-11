import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Every admin page and every write goes through this.
 *
 * `getUser()` revalidates the token against Supabase rather than trusting the
 * cookie, so a forged or expired session cannot reach the service-role client.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/** Redirects to the login screen when there is no valid session. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
