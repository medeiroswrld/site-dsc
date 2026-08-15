"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/schema";
import { fail } from "@/lib/admin/action-log";
import { INSTAGRAM_TAG } from "@/lib/instagram-repository";
import { PHOTO_BUCKET, STORAGE_EXTENSIONS } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Managing the Instagram strip. Same shape as the vehicle photo actions: the
 * browser shrinks and uploads the file straight to storage with a signed URL,
 * and these only ever carry paths.
 */

function refresh() {
  revalidateTag(INSTAGRAM_TAG);
  revalidatePath("/");
  revalidatePath("/admin/instagram");
}

export interface UploadTarget {
  path: string;
  token: string;
}

export async function createInstagramUploadTargets(
  types: string[],
): Promise<{ ok: boolean; message?: string; targets?: UploadTarget[] }> {
  await requireAdmin();

  if (types.length < 1 || types.length > 20) {
    return fail("instagram", "Envie entre 1 e 20 fotos por vez.");
  }

  const rejected = types.filter((type) => !STORAGE_EXTENSIONS[type]);
  if (rejected.length) {
    return fail("instagram", `Formato não aceito: ${[...new Set(rejected)].join(", ")}. Envie JPG, PNG, WebP, AVIF ou SVG.`);
  }

  const supabase = createSupabaseAdminClient();
  const stamp = Date.now();
  const targets: UploadTarget[] = [];

  for (const [index, type] of types.entries()) {
    const path = `instagram/${stamp}-${index}.${STORAGE_EXTENSIONS[type]}`;
    const { data, error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return fail("instagram", `Não foi possível preparar o envio: ${error?.message}`);
    }
    targets.push({ path, token: data.token });
  }

  return { ok: true, targets };
}

export async function registerInstagramPosts(
  photos: Array<{ path: string; width: number; height: number }>,
): Promise<ActionResult> {
  await requireAdmin();
  if (!photos.length) return fail("instagram", "Nenhuma foto para registrar.");

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("instagram_posts")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  const start = ((existing?.[0]?.position as number | undefined) ?? -1) + 1;

  const { error } = await supabase.from("instagram_posts").insert(
    photos.map((photo, index) => ({
      path: photo.path,
      position: start + index,
      width: photo.width || null,
      height: photo.height || null,
      alt: "",
    })),
  );

  if (error) {
    await supabase.storage.from(PHOTO_BUCKET).remove(photos.map((p) => p.path));
    return fail("instagram", `Erro ao registrar: ${error.message}`);
  }

  refresh();
  return {
    ok: true,
    message: photos.length === 1 ? "Foto enviada." : `${photos.length} fotos enviadas.`,
  };
}

export async function discardInstagramUploads(paths: string[]): Promise<void> {
  await requireAdmin();
  if (!paths.length) return;
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

/** The link the card opens. Blank sends the visitor to the profile instead. */
export async function setInstagramLink(
  id: string,
  url: string,
): Promise<ActionResult> {
  await requireAdmin();

  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\/(www\.)?instagram\.com\//i.test(trimmed)) {
    return fail("instagram", "Cole um endereço que comece com instagram.com");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("instagram_posts")
    .update({ url: trimmed || null })
    .eq("id", id);

  if (error) return fail("instagram", error.message);

  refresh();
  return { ok: true, message: "Link salvo." };
}

export async function deleteInstagramPost(id: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("instagram_posts").delete().eq("id", id);
  if (error) return fail("instagram", error.message);

  // The row is gone, so the file has nothing pointing at it.
  if (data?.path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([data.path as string]);
  }

  refresh();
  return { ok: true, message: "Foto removida." };
}

export async function reorderInstagramPosts(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase.from("instagram_posts").update({ position: index }).eq("id", id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return fail("instagram", failed.error.message);

  refresh();
  return { ok: true };
}
