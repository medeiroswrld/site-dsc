import Link from "next/link";
import { VehiclePhoto } from "@/components/vehicle/VehiclePhoto";
import { VehicleSpecPlate } from "@/components/vehicle/VehicleSpecPlate";
import { formatPrice, vehicleShortTitle } from "@/lib/format";
import { isRecentArrival } from "@/lib/vehicle-filters";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

/**
 * One card, one badge. A vehicle can be featured *and* newly arrived, but
 * stacking labels turns the photograph into packaging — so the most useful
 * single fact wins.
 */
function badgeFor(vehicle: Vehicle): string | null {
  if (vehicle.status === "sold") return "Vendido";
  if (vehicle.status === "reserved") return "Reservado";
  if (vehicle.featured) return "Destaque";
  if (isRecentArrival(vehicle)) return "Recém-chegado";
  return null;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Passed straight to the image so each layout requests the right width. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function VehicleCard({
  vehicle,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 92vw",
  priority,
  className,
}: VehicleCardProps) {
  const badge = badgeFor(vehicle);
  const sold = vehicle.status === "sold";
  const cover = vehicle.images[0];

  return (
    <article className={cn("group pressable relative flex flex-col", className)}>
      <div className="relative aspect-[4/2.7] overflow-hidden rounded-xl bg-surface-2">
        {cover && (
          <VehiclePhoto
            image={cover}
            sizes={sizes}
            priority={priority}
            className={cn(
              "transition-transform duration-[600ms] ease-[var(--ease-out-quart)]",
              !sold && "group-hover:scale-[1.035]",
              sold && "opacity-55 saturate-50",
            )}
          />
        )}

        {badge && (
          <span
            className={cn(
              "plate absolute left-3 top-3 rounded-full px-2.5 py-1.5 text-[0.625rem] uppercase leading-none tracking-[0.12em]",
              sold || vehicle.status === "reserved"
                ? "bg-bg/80 text-fg backdrop-blur-md"
                : "bg-brand text-brand-ink",
            )}
          >
            {badge}
          </span>
        )}

        <span className="plate absolute bottom-3 right-3 rounded-full bg-bg/70 px-2.5 py-1.5 text-[0.625rem] leading-none text-fg backdrop-blur-md">
          {vehicle.images.length} {vehicle.images.length === 1 ? "foto" : "fotos"}
        </span>
      </div>

      <p className="eyebrow mt-4">{vehicle.brand}</p>

      <h3 className="mt-1.5 font-display text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-fg sm:text-[1.125rem]">
        <Link href={`/estoque/${vehicle.slug}`} className="before:absolute before:inset-0">
          <span className="sr-only">{vehicle.brand} </span>
          {vehicleShortTitle(vehicle)}
        </Link>
      </h3>

      <VehicleSpecPlate vehicle={vehicle} className="mt-3.5" />

      <div className="mt-3.5 flex items-end justify-between gap-3">
        <p
          className={cn(
            "font-display text-[1.1875rem] font-semibold leading-none tracking-[-0.025em] tnum",
            sold ? "text-fg-subtle line-through decoration-1" : "text-fg",
          )}
        >
          {formatPrice(vehicle.price)}
        </p>

        <span className="flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle transition-colors duration-200 group-hover:text-brand-text">
          {sold ? "Ver detalhes" : "Ver veículo"}
        </span>
      </div>
    </article>
  );
}
