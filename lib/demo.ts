import { DEMO_DATA } from "@/data/vehicles";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * True while the site is showing placeholder stock rather than the store's
 * real cars. Drives the notice in the header, and switches itself off the
 * moment a Supabase project is connected.
 *
 * Lives in its own module so Client Components can read it without pulling in
 * the repository and its server-only dependencies.
 */
export const isDemoStock = !isSupabaseConfigured && DEMO_DATA;
