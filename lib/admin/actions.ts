"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  type ActionResult,
  type FieldErrors,
  vehicleFormSchema,
} from "@/lib/admin/schema";
import { PHOTO_BUCKET, STORAGE_EXTENSIONS } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { uniqueSlug, vehicleSlug } from "@/lib/slug";
import { VEHICLES_TAG } from "@/lib/vehicles-repository";

/**
 * Every mutation in the admin panel. Each one re-checks the session before
 * touching the service-role client, and refreshes the public pages afterwards
 * so a saved change is live immediately.
 */

/** Public routes that show stock and therefore go stale on every write. */
function revalidatePublicPages(slug?: string) {
  // Drop the cached catalogue first: the pages below re-render from it.
  revalidateTag(VEHICLES_TAG);
  revalidatePath("/");
  revalidatePath("/estoque");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/estoque/${slug}`);
  revalidatePath("/admin");
}

function zodErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

async function takenSlugs(exceptId?: string): Promise<Set<string>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("vehicles").select("id, slug");
  return new Set(
    (data ?? [])
      .filter((row) => row.id !== exceptId)
      .map((row) => row.slug as string),
  );
}

/* -------------------------------------------------------------------------- */
/*  Create / update                                                            */
/* -------------------------------------------------------------------------- */

export async function saveVehicle(
  vehicleId: string | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = vehicleFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revise os campos destacados.",
      errors: zodErrors(parsed.error.issues),
    };
  }

  const values = parsed.data;
  const supabase = createSupabaseAdminClient();

  const slug = uniqueSlug(
    vehicleSlug({
      brand: values.brand,
      model: values.model,
      version: values.version,
      yearModel: values.yearModel,
    }),
    await takenSlugs(vehicleId ?? undefined),
  );

  const row = {
    slug,
    brand: values.brand,
    model: values.model,
    version: values.version,
    year_manufacture: values.yearManufacture,
    year_model: values.yearModel,
    mileage: values.mileage,
    price: values.price,
    transmission: values.transmission,
    fuel: values.fuel,
    color: values.color,
    doors: values.doors,
    body_type: values.bodyType,
    description: values.description,
    features: values.features,
    video_url: values.videoUrl || null,
    featured: values.featured,
    status: values.status,
  };

  if (vehicleId) {
    const { error } = await supabase
      .from("vehicles")
      .update(row)
      .eq("id", vehicleId);

    if (error) return { ok: false, message: `Erro ao salvar: ${error.message}` };

    revalidatePublicPages(slug);
    return { ok: true, message: "Veículo atualizado.", id: vehicleId };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(row)
    .select("id")
    .single();

  if (error) return { ok: false, message: `Erro ao cadastrar: ${error.message}` };

  revalidatePublicPages(slug);
  return { ok: true, message: "Veículo cadastrado.", id: data.id as string };
}

/* -------------------------------------------------------------------------- */
/*  Status shortcuts, used straight from the list                              */
/* -------------------------------------------------------------------------- */

export async function setVehicleStatus(
  vehicleId: string,
  status: "available" | "reserved" | "sold",
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ status })
    .eq("id", vehicleId);

  if (error) return { ok: false, message: error.message };

  revalidatePublicPages();
  return { ok: true };
}

export async function setVehicleFeatured(
  vehicleId: string,
  featured: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ featured })
    .eq("id", vehicleId);

  if (error) return { ok: false, message: error.message };

  revalidatePublicPages();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/*  Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteVehicle(vehicleId: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  // The rows cascade, but the stored files do not — remove them first so the
  // bucket does not fill up with photos nothing points at.
  const { data: images } = await supabase
    .from("vehicle_images")
    .select("path")
    .eq("vehicle_id", vehicleId);

  const paths = (images ?? []).map((image) => image.path as string);
  if (paths.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
  if (error) return { ok: false, message: error.message };

  revalidatePublicPages();
  return { ok: true, message: "Veículo excluído." };
}

/* -------------------------------------------------------------------------- */
/*  Photos                                                                     */
/* -------------------------------------------------------------------------- */

export interface UploadTarget {
  path: string;
  token: string;
}

/**
 * Hands the browser a signed URL per photo so the file goes straight to
 * storage.
 *
 * Routing uploads through a Server Action meant every byte crossed the Next
 * server, which caps request bodies at 1 MB — a single phone photo blows past
 * that. This way the action only ever carries filenames, and the upload is a
 * direct browser-to-Supabase transfer with no size ceiling of ours.
 */
export async function createUploadTargets(
  vehicleId: string,
  types: string[],
): Promise<{ ok: boolean; message?: string; targets?: UploadTarget[] }> {
  await requireAdmin();

  if (types.length < 1 || types.length > 40) {
    return { ok: false, message: "Envie entre 1 e 40 fotos por vez." };
  }

  const rejected = types.filter((type) => !STORAGE_EXTENSIONS[type]);
  if (rejected.length) {
    return {
      ok: false,
      message: `Formato não aceito: ${[...new Set(rejected)].join(", ")}. Envie JPG, PNG, WebP, AVIF ou SVG.`,
    };
  }

  const supabase = createSupabaseAdminClient();
  const stamp = Date.now();
  const targets: UploadTarget[] = [];

  for (const [index, type] of types.entries()) {
    // The extension has to match the bytes: storage serves the file back with
    // the content type it was written with, and an SVG under a .webp name
    // confuses every cache and CDN between here and the visitor.
    const path = `${vehicleId}/${stamp}-${index}.${STORAGE_EXTENSIONS[type]}`;
    const { data, error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return { ok: false, message: `Não foi possível preparar o envio: ${error?.message}` };
    }
    targets.push({ path, token: data.token });
  }

  return { ok: true, targets };
}

/**
 * Records the photos that finished uploading. Called once, after the browser
 * has pushed the files, so a half-finished batch never leaves rows pointing at
 * files that are not there.
 */
export async function registerPhotos(
  vehicleId: string,
  photos: Array<{ path: string; width: number; height: number }>,
): Promise<ActionResult> {
  await requireAdmin();
  if (!photos.length) return { ok: false, message: "Nenhuma foto para registrar." };

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("vehicle_images")
    .select("position")
    .eq("vehicle_id", vehicleId)
    .order("position", { ascending: false })
    .limit(1);

  const start = ((existing?.[0]?.position as number | undefined) ?? -1) + 1;

  const { error } = await supabase.from("vehicle_images").insert(
    photos.map((photo, index) => ({
      vehicle_id: vehicleId,
      path: photo.path,
      position: start + index,
      width: photo.width || null,
      height: photo.height || null,
      alt: "",
    })),
  );

  if (error) {
    // Nothing was recorded, so the uploaded files are orphans — clear them.
    await supabase.storage.from(PHOTO_BUCKET).remove(photos.map((p) => p.path));
    return { ok: false, message: `Erro ao registrar: ${error.message}` };
  }

  revalidatePublicPages();
  return {
    ok: true,
    message: photos.length === 1 ? "Foto enviada." : `${photos.length} fotos enviadas.`,
  };
}

/** Removes files the browser uploaded but that never got registered. */
export async function discardUploads(paths: string[]): Promise<void> {
  await requireAdmin();
  if (!paths.length) return;
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

export async function deletePhoto(imageId: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  const { data: image } = await supabase
    .from("vehicle_images")
    .select("path")
    .eq("id", imageId)
    .maybeSingle();

  if (image?.path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([image.path as string]);
  }

  const { error } = await supabase
    .from("vehicle_images")
    .delete()
    .eq("id", imageId);

  if (error) return { ok: false, message: error.message };

  revalidatePublicPages();
  return { ok: true };
}

/** Persists the gallery order. The first entry becomes the cover photo. */
export async function reorderPhotos(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("vehicle_images").update({ position: index }).eq("id", id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { ok: false, message: failed.error.message };

  revalidatePublicPages();
  return { ok: true };
}
