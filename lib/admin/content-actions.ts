"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/schema";
import { findSlot, STORE_DEFAULTS, type StoreHours } from "@/lib/site-content";
import { SITE_CONTENT_TAG } from "@/lib/site-content-repository";
import { PHOTO_BUCKET, STORAGE_EXTENSIONS } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Editing the site's own images and the store's data.
 *
 * Same shape as the vehicle actions: the browser uploads straight to storage
 * with a signed URL, and these only ever carry paths and short strings.
 */

/** Video never passes through the image pipeline, so it needs its own map. */
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function refresh() {
  revalidateTag(SITE_CONTENT_TAG);
  // The slots are spread across the whole site, and a stale hero is exactly
  // the kind of thing nobody notices until a customer mentions it.
  revalidatePath("/", "layout");
}

export interface SiteUploadTarget {
  path: string;
  token: string;
}

export async function createSiteMediaTarget(
  slotId: string,
  contentType: string,
): Promise<{ ok: boolean; message?: string; target?: SiteUploadTarget }> {
  await requireAdmin();

  const slot = findSlot(slotId);
  if (!slot) return { ok: false, message: "Espaço desconhecido." };

  const extension =
    slot.kind === "video"
      ? VIDEO_EXTENSIONS[contentType]
      : STORAGE_EXTENSIONS[contentType];

  if (!extension) {
    return {
      ok: false,
      message:
        slot.kind === "video"
          ? "Envie o vídeo em MP4 ou WebM."
          : "Formato não aceito. Envie JPG, PNG, WebP, AVIF ou SVG.",
    };
  }

  const supabase = createSupabaseAdminClient();
  // Stamped rather than named after the slot: overwriting a fixed path would
  // leave the old file cached by the CDN under the same URL for hours.
  const path = `site/${slotId}-${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false, message: `Não foi possível preparar o envio: ${error?.message}` };
  }

  return { ok: true, target: { path, token: data.token } };
}

export async function registerSiteMedia(
  slotId: string,
  file: { path: string; width: number; height: number },
): Promise<ActionResult> {
  await requireAdmin();

  const slot = findSlot(slotId);
  if (!slot) return { ok: false, message: "Espaço desconhecido." };

  const supabase = createSupabaseAdminClient();

  // Read the outgoing file before replacing the row, so the old one can be
  // removed from storage instead of sitting there forever unreferenced.
  const { data: previous } = await supabase
    .from("site_media")
    .select("path")
    .eq("slot", slotId)
    .maybeSingle();

  const { error } = await supabase.from("site_media").upsert(
    {
      slot: slotId,
      path: file.path,
      alt: slot.alt,
      width: file.width || null,
      height: file.height || null,
    },
    { onConflict: "slot" },
  );

  if (error) return { ok: false, message: `Não foi possível salvar: ${error.message}` };

  if (previous?.path && previous.path !== file.path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([previous.path]);
  }

  refresh();
  return { ok: true, message: `"${slot.label}" atualizado.` };
}

/** Puts a slot back to the drawing that ships with the code. */
export async function clearSiteMedia(slotId: string): Promise<ActionResult> {
  await requireAdmin();

  const slot = findSlot(slotId);
  if (!slot) return { ok: false, message: "Espaço desconhecido." };

  const supabase = createSupabaseAdminClient();

  const { data: previous } = await supabase
    .from("site_media")
    .select("path")
    .eq("slot", slotId)
    .maybeSingle();

  const { error } = await supabase.from("site_media").delete().eq("slot", slotId);
  if (error) return { ok: false, message: `Não foi possível remover: ${error.message}` };

  if (previous?.path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([previous.path]);
  }

  refresh();
  return { ok: true, message: `"${slot.label}" voltou ao padrão.` };
}

/** Drops an upload that never made it into a row. */
export async function discardSiteUpload(path: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

/* -------------------------------------------------------------------------- */
/*  Store data                                                                 */
/* -------------------------------------------------------------------------- */

const TEXT_FIELDS = [
  "phoneDisplay",
  "phoneE164",
  "whatsapp",
  "street",
  "neighbourhood",
  "city",
  "state",
  "postalCode",
  "instagramHandle",
  "instagramUrl",
  "googleReviewsUrl",
  "foundedYearsText",
] as const;

export async function saveStoreInfo(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const rows: Array<{ key: string; value: unknown }> = [];

  for (const field of TEXT_FIELDS) {
    const raw = formData.get(field);
    const value = typeof raw === "string" ? raw.trim() : "";
    // Blank means "use the value from the code", which is why it is stored as
    // an empty string rather than skipped — the row has to exist to be reset.
    rows.push({ key: field, value });
  }

  const ratingValue = Number.parseFloat(String(formData.get("ratingValue") ?? ""));
  const ratingCount = Number.parseInt(String(formData.get("ratingCount") ?? ""), 10);

  if (Number.isFinite(ratingValue)) {
    if (ratingValue < 0 || ratingValue > 5) {
      return { ok: false, message: "A nota do Google precisa estar entre 0 e 5." };
    }
    rows.push({ key: "ratingValue", value: ratingValue });
  }
  if (Number.isFinite(ratingCount) && ratingCount >= 0) {
    rows.push({ key: "ratingCount", value: ratingCount });
  }

  // Hours arrive as parallel arrays from the repeated fields in the form.
  const days = formData.getAll("hoursDays").map((d) => String(d).trim());
  const times = formData.getAll("hoursTime").map((t) => String(t).trim());
  const hours: StoreHours[] = days
    .map((entry, index) => ({ days: entry, time: times[index] ?? "" }))
    .filter((entry) => entry.days && entry.time);

  rows.push({ key: "hours", value: hours.length ? hours : STORE_DEFAULTS.hours });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(rows.map((row) => ({ ...row })), { onConflict: "key" });

  if (error) return { ok: false, message: `Não foi possível salvar: ${error.message}` };

  refresh();
  revalidatePath("/admin/conteudo");
  return { ok: true, message: "Dados da loja atualizados." };
}
