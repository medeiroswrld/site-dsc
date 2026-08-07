import { DEMO_DATA, vehicles } from "@/data/vehicles";
import type {
  Vehicle,
  VehicleFilterState,
  VehicleSort,
} from "@/types/vehicle";

/**
 * The only module that knows where stock comes from. Everything else in the
 * app talks to these functions, so swapping the in-memory demo array for a
 * CMS, Supabase or dealer-management API is a change to this file alone.
 *
 * The functions are async on purpose: the call sites already await, so a
 * network-backed implementation drops in without touching a single component.
 */

export const isDemoStock = DEMO_DATA;

/** Newly arrived if it entered stock within this many days. */
const RECENT_ARRIVAL_DAYS = 21;

export async function getAllVehicles(): Promise<Vehicle[]> {
  return vehicles;
}

export async function getVehicleBySlug(
  slug: string,
): Promise<Vehicle | undefined> {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const sellable = vehicles.filter((vehicle) => vehicle.status !== "sold");
  const featured = sellable.filter((vehicle) => vehicle.featured);
  const rest = sellable.filter((vehicle) => !vehicle.featured);

  return [...featured, ...rest].slice(0, limit);
}

export async function getRelatedVehicles(
  vehicle: Vehicle,
  limit = 3,
): Promise<Vehicle[]> {
  const others = vehicles.filter(
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

export async function getStockFacets(): Promise<StockFacets> {
  const priced = vehicles
    .map((vehicle) => vehicle.price)
    .filter((price): price is number => price !== null);

  const modelsByBrand: Record<string, string[]> = {};
  for (const vehicle of vehicles) {
    const models = (modelsByBrand[vehicle.brand] ??= []);
    if (!models.includes(vehicle.model)) models.push(vehicle.model);
  }
  for (const models of Object.values(modelsByBrand)) {
    models.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  const unique = <T>(values: T[]) => Array.from(new Set(values));
  const sortPt = (values: string[]) =>
    values.sort((a, b) => a.localeCompare(b, "pt-BR"));

  return {
    brands: sortPt(unique(vehicles.map((vehicle) => vehicle.brand))),
    modelsByBrand,
    bodyTypes: sortPt(unique(vehicles.map((vehicle) => vehicle.bodyType))),
    transmissions: sortPt(
      unique(vehicles.map((vehicle) => vehicle.transmission)),
    ),
    fuels: sortPt(unique(vehicles.map((vehicle) => vehicle.fuel))),
    yearMin: Math.min(...vehicles.map((vehicle) => vehicle.yearModel)),
    yearMax: Math.max(...vehicles.map((vehicle) => vehicle.yearModel)),
    priceMin: priced.length ? Math.min(...priced) : 0,
    priceMax: priced.length ? Math.max(...priced) : 0,
    mileageMax: Math.max(...vehicles.map((vehicle) => vehicle.mileage)),
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
  const statusWeight = (vehicle: Vehicle) =>
    vehicle.status === "sold" ? 1 : 0;

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
