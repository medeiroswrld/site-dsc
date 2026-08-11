import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Read-only client for server-rendered public pages.
 *
 * Deliberately free of `next/headers` so the stock repository can be imported
 * from anywhere without dragging request-scoped APIs along with it.
 */
export function createSupabasePublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
