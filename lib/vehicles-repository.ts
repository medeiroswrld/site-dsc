import { unstable_cache } from "next/cache";
import { cache } from "react";
import { vehicles as demoVehicles } from "@/data/vehicles";
import { isSupabaseConfigured, photoUrl } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { VehicleRowWithImages } from "@/lib/supabase/types";
import type {
  Vehicle,
  VehicleFilterState,
  VehicleSort,
} from "@/types/vehicle";

/**
 * The only module that knows where stock comes from.
 *
 * With Supabase connected it reads from Postgres. Without it — a fresh clone,
 * or before the store's project exists — it falls back to the demo array so
 * the whole site still renders. Nothing above this file knows the difference.
 */

const SELECT = `
  id, slug, brand, model, version, year_manufacture, year_model, mileage,
  price, transmission, fuel, color, doors, body_type, description, features,
  video_url, panorama_url, featured, status, created_at, updated_at,
  vehicle_images ( id, vehicle_id, path, alt, position, width, height )
`;

/** Newly arrived if it entered stock within this many days. */
const RECENT_ARRIVAL_DAYS = 21;

function rowToVehicle(row: VehicleRowWithImages): Vehicle {
  const images = [...(row.vehicle_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      src: photoUrl(image.path),
      alt:
        image.alt ||
        `${row.brand} ${row.model} ${row.version} — foto ${image.position + 1}`,
      width: image.width ?? 1600,
      height: image.height ?? 1000,
    }));

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version,
    yearManufacture: row.year_manufacture,
    yearModel: row.year_model,
    mileage: row.mileage,
    price: row.price,
    transmission: row.transmission,
    fuel: row.fuel,
    color: row.color,
    doors: row.doors,
    bodyType: row.body_type,
    description: row.description,
    features: row.features ?? [],
    images,
    videoUrl: row.video_url ?? undefined,
    panoramaUrl: row.panorama_url ?? undefined,
    featured: row.featured,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * A vehicle with no photograph yet still needs a frame in every grid, so it
 * gets the neutral stand-in rather than a broken image.
 */
function withFallbackImage(vehicle: Vehicle): Vehicle {
  if (vehicle.images.length > 0) return vehicle;

  return {
    ...vehicle,
    images: [
      {
        src: "/placeholders/vehicle-01.svg",
        alt: `${vehicle.brand} ${vehicle.model} — foto ainda não cadastrada`,
        width: 1600,
        height: 1000,
        isPlaceholder: true,
      },
    ],
  };
}

/**
 * Cache key for the whole catalogue. Every write in the panel calls
 * `revalidateTag(VEHICLES_TAG)`, so the cache can be held indefinitely and
 * still never serve a stale price — freshness comes from invalidation, not
 * from expiry.
 */
export const VEHICLES_TAG = "vehicles";

/**
 * Reads the catalogue across requests.
 *
 * Without this, every page view — every click — paid a round trip to Postgres
 * before React could render a single card. A dealership's stock changes a few
 * times a week, so re-reading it on every visit buys nothing.
 */
const loadVehicles = unstable_cache(
  async (): Promise<Vehicle[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[estoque] falha ao ler veículos:", error.message);
      return [];
    }

    return (data as unknown as VehicleRowWithImages[]).map((row) =>
      withFallbackImage(rowToVehicle(row)),
    );
  },
  ["vehicles-all"],
  { tags: [VEHICLES_TAG] },
);

/** `cache` dedupes within one render; `unstable_cache` holds across requests. */
export const getAllVehicles = cache(async function getAllVehicles(): Promise<
  Vehicle[]
> {
  if (!isSupabaseConfigured) return demoVehicles;
  return loadVehicles();
});

/**
 * Derived from the cached list rather than its own query. A used-car lot holds
 * tens of vehicles, not thousands, so filtering in memory is faster than a
 * second round trip and keeps one cache entry instead of one per slug.
 */
export async function getVehicleBySlug(
  slug: string,
): Promise<Vehicle | undefined> {
  const all = await getAllVehicles();
  return all.find((vehicle) => vehicle.slug === slug);
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const all = await getAllVehicles();
  const sellable = all.filter((vehicle) => vehicle.status !== "sold");

  return [
    ...sellable.filter((vehicle) => vehicle.featured),
    ...sellable.filter((vehicle) => !vehicle.featured),
  ].slice(0, limit);
}

export async function getRelatedVehicles(
  vehicle: Vehicle,
  limit = 3,
): Promise<Vehicle[]> {
  const all = await getAllVehicles();
  const others = all.filter(
    (candidate) =>
      candidate.id !== vehicle.id && candidate.status === "available",
  );

  // Closest match first: same body type, then nearest price.
  return others
    .map((candidate) => ({
      candidate,
      score:
        (candidate.bodyType === vehicle.bodyType ? 0 : 1_000_000) +
        Math.abs((candidate.price ?? 0) - (vehicle.price ?? 0)) / 1000,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function isRecentArrival(vehicle: Vehicle, now = new Date()): boolean {
  if (vehicle.status !== "available") return false;
  const added = new Date(vehicle.createdAt).getTime();
  if (Number.isNaN(added)) return false;
  const days = (now.getTime() - added) / 86_400_000;
  return days >= 0 && days <= RECENT_ARRIVAL_DAYS;
}

/* -------------------------------------------------------------------------- */
/*  Facets — the option lists the filter UI renders from                       */
/* -------------------------------------------------------------------------- */

export interface StockFacets {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  bodyTypes: string[];
  transmissions: string[];
  fuels: string[];
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
  mileageMax: number;
}

const EMPTY_FACETS: StockFacets = {
  brands: [],
  modelsByBrand: {},
  bodyTypes: [],
  transmissions: [],
  fuels: [],
  yearMin: new Date().getFullYear() - 10,
  yearMax: new Date().getFullYear(),
  priceMin: 0,
  priceMax: 0,
  mileageMax: 0,
};

/** Built from the stock itself, so the filters never offer an empty result. */
export async function getStockFacets(): Promise<StockFacets> {
  const list = await getAllVehicles();
  if (!list.length) return EMPTY_FACETS;

  const priced = list
    .map((vehicle) => vehicle.price)
    .filter((price): price is number => price !== null);

  const modelsByBrand: Record<string, string[]> = {};
  for (const vehicle of list) {
    const models = (modelsByBrand[vehicle.brand] ??= []);
    if (!models.includes(vehicle.model)) models.push(vehicle.model);
  }
  for (const models of Object.values(modelsByBrand)) {
    models.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  const unique = <T,>(values: T[]) => Array.from(new Set(values));
  const sortPt = (values: string[]) =>
    values.sort((a, b) => a.localeCompare(b, "pt-BR"));

  return {
    brands: sortPt(unique(list.map((vehicle) => vehicle.brand))),
    modelsByBrand,
    bodyTypes: sortPt(unique(list.map((vehicle) => vehicle.bodyType))),
    transmissions: sortPt(unique(list.map((vehicle) => vehicle.transmission))),
    fuels: sortPt(unique(list.map((vehicle) => vehicle.fuel))),
    yearMin: Math.min(...list.map((vehicle) => vehicle.yearModel)),
    yearMax: Math.max(...list.map((vehicle) => vehicle.yearModel)),
    priceMin: priced.length ? Math.min(...priced) : 0,
    priceMax: priced.length ? Math.max(...priced) : 0,
    mileageMax: Math.max(...list.map((vehicle) => vehicle.mileage)),
  };
}

/* -------------------------------------------------------------------------- */
/*  Filtering + sorting — pure, so the client can run them without a round trip */
/* -------------------------------------------------------------------------- */

export const defaultFilters: VehicleFilterState = {
  q: "",
  brand: "",
  model: "",
  bodyType: "",
  transmission: "",
  fuel: "",
  yearMin: null,
  yearMax: null,
  priceMin: null,
  priceMax: null,
  mileageMax: null,
  sort: "recentes",
};

/** Strips accents and case so "Sedã" matches a search for "seda". */
function normalise(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterVehicles(
  list: Vehicle[],
  filters: VehicleFilterState,
): Vehicle[] {
  const query = normalise(filters.q);
  const terms = query ? query.split(/\s+/) : [];

  return list.filter((vehicle) => {
    if (terms.length) {
      const haystack = normalise(
        `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.bodyType} ${vehicle.color}`,
      );
      if (!terms.every((term) => haystack.includes(term))) return false;
    }

    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.bodyType && vehicle.bodyType !== filters.bodyType) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission)
      return false;
    if (filters.fuel && vehicle.fuel !== filters.fuel) return false;

    if (filters.yearMin !== null && vehicle.yearModel < filters.yearMin)
      return false;
    if (filters.yearMax !== null && vehicle.yearModel > filters.yearMax)
      return false;

    if (filters.priceMin !== null) {
      if (vehicle.price === null || vehicle.price < filters.priceMin)
        return false;
    }
    if (filters.priceMax !== null) {
      if (vehicle.price === null || vehicle.price > filters.priceMax)
        return false;
    }

    if (filters.mileageMax !== null && vehicle.mileage > filters.mileageMax)
      return false;

    return true;
  });
}

export function sortVehicles(list: Vehicle[], sort: VehicleSort): Vehicle[] {
  const sorted = [...list];

  // Sold stock always sinks to the bottom, whatever the chosen order.
  const statusWeight = (vehicle: Vehicle) => (vehicle.status === "sold" ? 1 : 0);

  const comparators: Record<VehicleSort, (a: Vehicle, b: Vehicle) => number> = {
    recentes: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "menor-preco": (a, b) =>
      (a.price ?? Number.POSITIVE_INFINITY) -
      (b.price ?? Number.POSITIVE_INFINITY),
    "maior-preco": (a, b) => (b.price ?? -1) - (a.price ?? -1),
    "menor-km": (a, b) => a.mileage - b.mileage,
  };

  return sorted.sort(
    (a, b) => statusWeight(a) - statusWeight(b) || comparators[sort](a, b),
  );
}

export function countActiveFilters(filters: VehicleFilterState): number {
  let count = 0;
  if (filters.brand) count += 1;
  if (filters.model) count += 1;
  if (filters.bodyType) count += 1;
  if (filters.transmission) count += 1;
  if (filters.fuel) count += 1;
  if (filters.yearMin !== null || filters.yearMax !== null) count += 1;
  if (filters.priceMin !== null || filters.priceMax !== null) count += 1;
  if (filters.mileageMax !== null) count += 1;
  return count;
}
