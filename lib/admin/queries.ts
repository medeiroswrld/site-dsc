import "server-only";

import { photoUrl } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { VehicleRow, VehicleImageRow } from "@/lib/supabase/types";

/**
 * Reads for the panel. Separate from the public repository because the panel
 * needs the raw rows — image ids to delete and reorder, and every vehicle
 * regardless of status.
 */

export interface AdminPhoto {
  id: string;
  url: string;
  path: string;
  position: number;
}

export interface AdminVehicle extends VehicleRow {
  photos: AdminPhoto[];
}

export interface AdminVehicleSummary {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  yearModel: number;
  mileage: number;
  price: number | null;
  status: VehicleRow["status"];
  featured: boolean;
  photoCount: number;
  coverUrl: string | null;
  createdAt: string;
}

function toPhotos(rows: VehicleImageRow[] | null | undefined): AdminPhoto[] {
  return [...(rows ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      id: row.id,
      url: photoUrl(row.path),
      path: row.path,
      position: row.position,
    }));
}

export async function listVehiclesForAdmin(): Promise<AdminVehicleSummary[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, slug, brand, model, version, year_model, mileage, price, status, featured, created_at, vehicle_images ( id, path, position )",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao listar veículos: ${error.message}`);

  return (data ?? []).map((row) => {
    const images = [...((row.vehicle_images ?? []) as VehicleImageRow[])].sort(
      (a, b) => a.position - b.position,
    );

    return {
      id: row.id as string,
      slug: row.slug as string,
      brand: row.brand as string,
      model: row.model as string,
      version: row.version as string,
      yearModel: row.year_model as number,
      mileage: row.mileage as number,
      price: row.price as number | null,
      status: row.status as VehicleRow["status"],
      featured: row.featured as boolean,
      photoCount: images.length,
      coverUrl: images[0] ? photoUrl(images[0].path) : null,
      createdAt: row.created_at as string,
    };
  });
}

export async function getVehicleForAdmin(
  id: string,
): Promise<AdminVehicle | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images ( id, vehicle_id, path, alt, position, width, height )")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar veículo: ${error.message}`);
  if (!data) return null;

  const { vehicle_images, ...row } = data as VehicleRow & {
    vehicle_images: VehicleImageRow[];
  };

  return { ...row, photos: toPhotos(vehicle_images) };
}

export interface AdminStats {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  withoutPhotos: number;
}

export async function getAdminStats(
  vehicles: AdminVehicleSummary[],
): Promise<AdminStats> {
  return {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    reserved: vehicles.filter((v) => v.status === "reserved").length,
    sold: vehicles.filter((v) => v.status === "sold").length,
    withoutPhotos: vehicles.filter((v) => v.photoCount === 0).length,
  };
}
