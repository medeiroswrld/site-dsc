/**
 * Public Supabase details. Safe to import from anywhere, including Client
 * Components — nothing here is a secret.
 *
 * Until a project is connected the whole site keeps running on the demo stock
 * in data/vehicles.ts. `isSupabaseConfigured` is the switch every other module
 * checks, so a fresh clone with no .env.local still renders.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Bucket holding every vehicle photograph. */
export const PHOTO_BUCKET = "veiculos";

/**
 * What the bucket accepts, and the extension each type is stored under.
 *
 * This has to stay in step with `allowed_mime_types` in supabase/schema.sql —
 * a type missing there is rejected by storage no matter what the app thinks.
 * The extension is decided here, on the server, so the browser never gets to
 * choose the filename it writes into the bucket.
 */
export const STORAGE_EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/** Public URL for a file stored in the photo bucket. */
export function photoUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
