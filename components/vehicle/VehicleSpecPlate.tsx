import { formatMileage, formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

/**
 * The signature element: a vehicle's headline figures set as a stamped data
 * plate rather than a row of pill chips. Same three facts, same order,
 * everywhere a vehicle appears — so the eye learns where to look once.
 */
export function VehicleSpecPlate({
  vehicle,
  className,
  size = "sm",
}: {
  vehicle: Vehicle;
  className?: string;
  size?: "sm" | "md";
}) {
  const cells = [
    formatYear(vehicle),
    formatMileage(vehicle.mileage),
    vehicle.transmission,
  ];

  return (
    <dl
      className={cn(
        "plate grid grid-cols-3 border-y border-line text-fg-subtle",
        size === "sm"
          ? "text-[0.6875rem] leading-none"
          : "text-[0.8125rem] leading-none",
        className,
      )}
    >
      {cells.map((value, index) => (
        <div
          key={value}
          className={cn(
            "min-w-0 py-2.5",
            index === 1 && "border-x border-line px-3 text-center",
            index === 0 && "pr-3",
            index === 2 && "pl-3 text-right",
            size === "md" && "py-3.5",
          )}
        >
          <dt className="sr-only">
            {["Ano", "Quilometragem", "Câmbio"][index]}
          </dt>
          <dd className="truncate">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
