import { unstable_cache } from "next/cache";
import { cache } from "react";
import { isSupabaseConfigured, photoUrl } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { siteConfig } from "@/lib/site";

/**
 * The photos shown in the Instagram strip on the home page.
 *
 * These are uploaded through the panel rather than pulled from Instagram's
 * API: the Basic Display API was shut down at the end of 2024, and its
 * replacement needs a Meta app plus a token that expires every 60 days. For a
 * strip that changes once a month, a folder the store controls is steadier
 * than a dependency that can go dark without warning.
 */

export const INSTAGRAM_TAG = "instagram";

export interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  href: string;
}

/** Stand-ins used before the store has uploaded anything. */
const placeholders: InstagramPost[] = Array.from({ length: 6 }, (_, index) => ({
  id: `placeholder-${index}`,
  image: `/placeholders/social-0${index + 1}.svg`,
  alt: "Espaço reservado para uma publicação do Instagram da D.S.C. Seminovos",
  href: siteConfig.instagram.url,
}));

interface PostRow {
  id: string;
  path: string;
  url: string | null;
  alt: string;
  position: number;
}

const loadPosts = unstable_cache(
  async (): Promise<InstagramPost[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("id, path, url, alt, position")
      .order("position", { ascending: true });

    if (error) {
      // PGRST205 means the table does not exist yet: supabase/instagram.sql has
      // not been run. That is a setup state, already flagged in the panel, so
      // it stays quiet here instead of logging on every page render. Anything
      // else is a real fault and should be seen.
      if (error.code !== "PGRST205") {
        console.error("[instagram] falha ao ler publicações:", error.message);
      }
      return [];
    }

    return (data as PostRow[]).map((row) => ({
      id: row.id,
      image: photoUrl(row.path),
      alt: row.alt || "Publicação do Instagram da D.S.C. Seminovos",
      href: row.url || siteConfig.instagram.url,
    }));
  },
  ["instagram-posts"],
  { tags: [INSTAGRAM_TAG] },
);

export const getInstagramPosts = cache(async function getInstagramPosts(): Promise<
  InstagramPost[]
> {
  if (!isSupabaseConfigured) return placeholders;
  const posts = await loadPosts();
  return posts.length ? posts : placeholders;
});
