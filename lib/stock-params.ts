import { defaultFilters } from "@/lib/vehicle-filters";
import type { VehicleFilterState, VehicleSort } from "@/types/vehicle";

/**
 * Filter state lives in the URL so a search can be shared, bookmarked and
 * reopened by the back button. Param names are Portuguese to match the rest of
 * the site's URLs.
 */

const SORTS: VehicleSort[] = [
  "recentes",
  "menor-preco",
  "maior-preco",
  "menor-km",
];

export const sortLabels: Record<VehicleSort, string> = {
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "menor-km": "Menor quilometragem",
};

type ParamKey =
  | "q"
  | "marca"
  | "modelo"
  | "carroceria"
  | "cambio"
  | "combustivel"
  | "anoMin"
  | "anoMax"
  | "precoMin"
  | "precoMax"
  | "kmMax"
  | "ordenar";

function readNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filtersFromParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): VehicleFilterState {
  const get = (key: ParamKey): string | null => {
    if (params instanceof URLSearchParams) return params.get(key);
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  };

  const sort = get("ordenar") as VehicleSort | null;

  return {
    q: get("q") ?? "",
    brand: get("marca") ?? "",
    model: get("modelo") ?? "",
    bodyType: get("carroceria") ?? "",
    transmission: get("cambio") ?? "",
    fuel: get("combustivel") ?? "",
    yearMin: readNumber(get("anoMin")),
    yearMax: readNumber(get("anoMax")),
    priceMin: readNumber(get("precoMin")),
    priceMax: readNumber(get("precoMax")),
    mileageMax: readNumber(get("kmMax")),
    sort: sort && SORTS.includes(sort) ? sort : defaultFilters.sort,
  };
}

export function paramsFromFilters(filters: VehicleFilterState): string {
  const params = new URLSearchParams();

  const set = (key: ParamKey, value: string | number | null) => {
    if (value === null || value === "" ) return;
    params.set(key, String(value));
  };

  set("q", filters.q.trim());
  set("marca", filters.brand);
  set("modelo", filters.model);
  set("carroceria", filters.bodyType);
  set("cambio", filters.transmission);
  set("combustivel", filters.fuel);
  set("anoMin", filters.yearMin);
  set("anoMax", filters.yearMax);
  set("precoMin", filters.priceMin);
  set("precoMax", filters.priceMax);
  set("kmMax", filters.mileageMax);
  if (filters.sort !== defaultFilters.sort) set("ordenar", filters.sort);

  return params.toString();
}

/** Coarse steps beat a dual-handle slider: faster to hit, easy to share. */
export function priceSteps(min: number, max: number): number[] {
  const steps = [
    30_000, 50_000, 70_000, 90_000, 110_000, 130_000, 160_000, 200_000,
    250_000, 300_000,
  ];
  return steps.filter((step) => step >= min * 0.6 && step <= max * 1.4);
}

export const mileageSteps = [20_000, 40_000, 60_000, 80_000, 120_000];
