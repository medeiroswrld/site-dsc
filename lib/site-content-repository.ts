import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  MEDIA_SLOTS,
  STORE_DEFAULTS,
  type ResolvedMedia,
  type StoreInfo,
} from "@/lib/site-content";
import { isSupabaseConfigured, photoUrl } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Reads what the panel controls, and fills the gaps from the code.
 *
 * Every accessor here is total: it always returns a usable value. A missing
 * row, an unconfigured project or a database that is briefly down all end up
 * at the same place — the defaults in lib/site-content.ts. The site is a shop
 * window, so degrading quietly beats failing loudly.
 */

export const SITE_CONTENT_TAG = "site-content";

interface MediaRow {
  slot: string;
  path: string;
  alt: string;
  width: number | null;
  height: number | null;
}

interface SettingRow {
  key: string;
  value: unknown;
}

/** Slot id → what the page should render. Always has an entry per slot. */
export type MediaMap = Record<string, ResolvedMedia>;

function defaultsFor(): MediaMap {
  const map: MediaMap = {};
  for (const slot of MEDIA_SLOTS) {
    map[slot.id] = {
      src: slot.fallback,
      alt: slot.alt,
      width: null,
      height: null,
      // The shipped stand-ins are drawings; an uploaded photo never is.
      isPlaceholder: Boolean(slot.fallback),
    };
  }
  return map;
}

const loadMedia = unstable_cache(
  async (): Promise<MediaMap> => {
    const map = defaultsFor();

    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_media")
      .select("slot, path, alt, width, height");

    if (error || !data) return map;

    for (const row of data as MediaRow[]) {
      // A slot removed from the code but still in the table is ignored rather
      // than rendered into a layout that no longer has a place for it.
      if (!map[row.slot]) continue;

      map[row.slot] = {
        src: photoUrl(row.path),
        alt: row.alt || map[row.slot].alt,
        width: row.width,
        height: row.height,
        isPlaceholder: false,
      };
    }

    return map;
  },
  ["site-media"],
  { tags: [SITE_CONTENT_TAG], revalidate: 300 },
);

const loadStore = unstable_cache(
  async (): Promise<StoreInfo> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error || !data) return STORE_DEFAULTS;

    const store: StoreInfo = { ...STORE_DEFAULTS, hours: [...STORE_DEFAULTS.hours] };

    for (const row of data as SettingRow[]) {
      if (!(row.key in store)) continue;
      // An empty field in the panel means "keep the default", not "blank the
      // site" — a shop with no phone number on it is worse than a stale one.
      if (row.value === null || row.value === "") continue;
      (store as unknown as Record<string, unknown>)[row.key] = row.value;
    }

    return store;
  },
  ["site-settings"],
  { tags: [SITE_CONTENT_TAG], revalidate: 300 },
);

/** Images and video for the whole layout. Deduped within one render. */
export const getSiteMedia = cache(async (): Promise<MediaMap> => {
  if (!isSupabaseConfigured) return defaultsFor();
  try {
    return await loadMedia();
  } catch {
    return defaultsFor();
  }
});

/** Phone, address, hours and rating as they stand today. */
export const getStoreInfo = cache(async (): Promise<StoreInfo> => {
  if (!isSupabaseConfigured) return STORE_DEFAULTS;
  try {
    return await loadStore();
  } catch {
    return STORE_DEFAULTS;
  }
});

/** One slot, for pages that only need a single frame. */
export async function getMediaSlot(id: string): Promise<ResolvedMedia> {
  const map = await getSiteMedia();
  return map[id] ?? { src: "", alt: "", width: null, height: null, isPlaceholder: true };
}

/** True when the store has uploaded a film for the hero. */
export async function hasHeroVideo(): Promise<boolean> {
  const map = await getSiteMedia();
  return Boolean(map.hero_video && !map.hero_video.isPlaceholder && map.hero_video.src);
}
