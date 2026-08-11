import type { BodyType, Fuel, Transmission, VehicleStatus } from "@/types/vehicle";

/** Shape of a row in public.vehicles, snake_case as Postgres returns it. */
export interface VehicleRow {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year_manufacture: number;
  year_model: number;
  mileage: number;
  price: number | null;
  transmission: Transmission;
  fuel: Fuel;
  color: string;
  doors: number;
  body_type: BodyType;
  description: string;
  features: string[];
  video_url: string | null;
  panorama_url: string | null;
  featured: boolean;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

/** Shape of a row in public.vehicle_images. */
export interface VehicleImageRow {
  id: string;
  vehicle_id: string;
  path: string;
  alt: string;
  position: number;
  width: number | null;
  height: number | null;
}

/** A vehicle joined with its ordered images, as the repository selects it. */
export type VehicleRowWithImages = VehicleRow & {
  vehicle_images: VehicleImageRow[];
};
