import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/** Server-only. Bypasses RLS, so it must never reach the browser bundle. */
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const canWriteToSupabase = Boolean(supabaseUrl && supabaseServiceKey);

/**
 * Session-aware client. Reads and refreshes the auth cookies, so this is what
 * tells the admin pages who is logged in. Uses the anon key, so RLS applies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The middleware refreshes the session instead, so this is safe.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS entirely, so every call site must have
 * already verified an admin session — see `requireAdmin` in lib/admin/auth.ts.
 */
export function createSupabaseAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Veja o .env.example.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
