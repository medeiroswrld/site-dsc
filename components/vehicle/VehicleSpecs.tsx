import { formatMileage } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

/** The full plate. Same voice as the compact one on the cards, expanded. */
export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const rows: Array<[string, string]> = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versão", vehicle.version],
    ["Ano/modelo", `${vehicle.yearManufacture}/${vehicle.yearModel}`],
    ["Quilometragem", formatMileage(vehicle.mileage)],
    ["Combustível", vehicle.fuel],
    ["Câmbio", vehicle.transmission],
    ["Cor", vehicle.color],
    ["Portas", String(vehicle.doors)],
    ["Carroceria", vehicle.bodyType],
  ];

  return (
    <section aria-labelledby="ficha-titulo">
      <h2 id="ficha-titulo" className="eyebrow">
        Ficha técnica
      </h2>

      <dl className="mt-5 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-line py-3"
          >
            <dt className="text-[0.875rem] text-fg-subtle">{label}</dt>
            <dd className="plate text-right text-[0.875rem] text-fg tnum">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function VehicleFeatures({ vehicle }: { vehicle: Vehicle }) {
  if (!vehicle.features.length) return null;

  return (
    <section aria-labelledby="itens-titulo">
      <h2 id="itens-titulo" className="eyebrow">
        Itens do veículo
      </h2>

      <ul className="mt-5 grid gap-x-10 border-t border-line sm:grid-cols-2">
        {vehicle.features.map((feature) => (
          <li
            key={feature}
            className="border-b border-line py-3 text-[0.9375rem] text-fg-muted"
          >
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
