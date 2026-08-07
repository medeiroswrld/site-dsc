import type { Vehicle } from "@/types/vehicle";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("pt-BR");

/** Prices with no value read "Sob consulta" — never a fabricated number. */
export function formatPrice(price: number | null): string {
  return price === null ? "Sob consulta" : brl.format(price);
}

export function formatMileage(mileage: number): string {
  return `${decimal.format(mileage)} km`;
}

export function formatNumber(value: number): string {
  return decimal.format(value);
}

/** "2022/2023" when the model year differs, otherwise a single year. */
export function formatYear(vehicle: Vehicle): string {
  return vehicle.yearManufacture === vehicle.yearModel
    ? String(vehicle.yearModel)
    : `${vehicle.yearManufacture}/${vehicle.yearModel}`;
}

export function vehicleTitle(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;
}

/** Compact name for links and breadcrumbs. */
export function vehicleShortTitle(vehicle: Vehicle): string {
  return `${vehicle.model} ${vehicle.version}`;
}

export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
