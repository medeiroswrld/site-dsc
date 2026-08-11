export type VehicleStatus = "available" | "reserved" | "sold";

export type Transmission = "Manual" | "Automático" | "Automatizado" | "CVT";

export type Fuel =
  | "Flex"
  | "Gasolina"
  | "Diesel"
  | "Etanol"
  | "Híbrido"
  | "Elétrico";

export type BodyType =
  | "Hatch"
  | "Sedã"
  | "SUV"
  | "Picape"
  | "Perua"
  | "Utilitário"
  | "Cupê";

export interface VehicleImage {
  /** Optimised source used in grids and the gallery viewport. */
  src: string;
  /** Full-resolution source, loaded on demand by the lightbox. */
  full?: string;
  alt: string;
  width: number;
  height: number;
  /** True while the entry is a marked stand-in, not real D.S.C. photography. */
  isPlaceholder?: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: number;
  yearModel: number;
  /** Kilometres on the odometer. */
  mileage: number;
  /** BRL, whole reais. `null` means "sob consulta" — never invent a figure. */
  price: number | null;
  transmission: Transmission;
  fuel: Fuel;
  color: string;
  doors: number;
  bodyType: BodyType;
  description: string;
  features: string[];
  images: VehicleImage[];
  /** Optional walkaround video for this specific vehicle. */
  videoUrl?: string;
  /** Optional equirectangular panorama. The 360 viewer only mounts if set. */
  panoramaUrl?: string;
  featured: boolean;
  status: VehicleStatus;
  /** ISO date the vehicle entered the stock — drives "Recém-chegado". */
  createdAt: string;
}

/** Sort keys exposed in the /estoque UI. */
export type VehicleSort =
  | "recentes"
  | "menor-preco"
  | "maior-preco"
  | "menor-km";

export interface VehicleFilterState {
  q: string;
  brand: string;
  model: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  yearMin: number | null;
  yearMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  mileageMax: number | null;
  sort: VehicleSort;
}
