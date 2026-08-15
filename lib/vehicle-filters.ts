/**
 * Pure stock logic: what counts as a recent arrival, and how the catalogue is
 * filtered, sorted and counted.
 *
 * Split out of `vehicles-repository.ts` because the filter UI runs in the
 * browser and imported these from there. That one import pulled the whole
 * server module into the client bundle — the Supabase client, `next/cache`,
 * every row mapper — and once logging arrived it pulled `server-only` too,
 * which turned a long-standing weight problem into an outright build failure.
 *
 * Nothing here may import anything server-side. That is the entire point of
 * the file, and the comment the old code already carried: "pure, so the client
 * can run them without a round trip".
 */

import type { Vehicle, VehicleFilterState, VehicleSort } from "@/types/vehicle";

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

/** Newly arrived if it entered stock within this many days. */
const RECENT_ARRIVAL_DAYS = 21;

export function isRecentArrival(vehicle: Vehicle, now = new Date()): boolean {
  if (vehicle.status !== "available") return false;
  const added = new Date(vehicle.createdAt).getTime();
  if (Number.isNaN(added)) return false;
  const days = (now.getTime() - added) / 86_400_000;
  return days >= 0 && days <= RECENT_ARRIVAL_DAYS;
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
