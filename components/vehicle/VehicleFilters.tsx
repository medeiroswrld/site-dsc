"use client";

import { SelectField } from "@/components/ui/SelectField";
import { formatPrice } from "@/lib/format";
import { mileageSteps, priceSteps } from "@/lib/stock-params";
import type { StockFacets } from "@/lib/vehicles-repository";
import type { VehicleFilterState } from "@/types/vehicle";

interface VehicleFiltersProps {
  filters: VehicleFilterState;
  facets: StockFacets;
  onChange: (patch: Partial<VehicleFilterState>) => void;
}

/**
 * The seven filters that actually narrow a used-car search. Deliberately no
 * long tail of options — an extra dropdown that nobody opens costs every
 * visitor the time it takes to skip past it.
 */
export function VehicleFilters({
  filters,
  facets,
  onChange,
}: VehicleFiltersProps) {
  const years = Array.from(
    { length: facets.yearMax - facets.yearMin + 1 },
    (_, index) => facets.yearMax - index,
  );

  const prices = priceSteps(facets.priceMin, facets.priceMax);
  const models = filters.brand ? (facets.modelsByBrand[filters.brand] ?? []) : [];

  const toOptions = (values: string[]) =>
    values.map((value) => ({ value, label: value }));

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <SelectField
          label="Marca"
          placeholder="Todas as marcas"
          value={filters.brand}
          options={toOptions(facets.brands)}
          // Changing brand invalidates any model chosen under the old one.
          onChange={(brand) => onChange({ brand, model: "" })}
        />

        <SelectField
          label="Modelo"
          placeholder={filters.brand ? "Todos os modelos" : "Escolha a marca"}
          value={filters.model}
          options={toOptions(models)}
          disabled={!filters.brand}
          onChange={(model) => onChange({ model })}
        />

        <SelectField
          label="Carroceria"
          placeholder="Todas"
          value={filters.bodyType}
          options={toOptions(facets.bodyTypes)}
          onChange={(bodyType) => onChange({ bodyType })}
        />
      </div>

      <fieldset className="border-t border-line pt-6">
        <legend className="sr-only">Faixa de preço</legend>
        <p className="plate mb-3 text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle">
          Preço
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Preço mínimo"
            hideLabel
            placeholder="De"
            value={filters.priceMin?.toString() ?? ""}
            options={prices.map((price) => ({
              value: String(price),
              label: formatPrice(price),
            }))}
            onChange={(value) =>
              onChange({ priceMin: value ? Number(value) : null })
            }
          />
          <SelectField
            label="Preço máximo"
            hideLabel
            placeholder="Até"
            value={filters.priceMax?.toString() ?? ""}
            options={prices.map((price) => ({
              value: String(price),
              label: formatPrice(price),
            }))}
            onChange={(value) =>
              onChange({ priceMax: value ? Number(value) : null })
            }
          />
        </div>
      </fieldset>

      <fieldset className="border-t border-line pt-6">
        <legend className="sr-only">Faixa de ano</legend>
        <p className="plate mb-3 text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle">
          Ano
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Ano mínimo"
            hideLabel
            placeholder="De"
            value={filters.yearMin?.toString() ?? ""}
            options={years.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
            onChange={(value) =>
              onChange({ yearMin: value ? Number(value) : null })
            }
          />
          <SelectField
            label="Ano máximo"
            hideLabel
            placeholder="Até"
            value={filters.yearMax?.toString() ?? ""}
            options={years.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
            onChange={(value) =>
              onChange({ yearMax: value ? Number(value) : null })
            }
          />
        </div>
      </fieldset>

      <div className="space-y-5 border-t border-line pt-6">
        <SelectField
          label="Quilometragem até"
          placeholder="Qualquer"
          value={filters.mileageMax?.toString() ?? ""}
          options={mileageSteps.map((step) => ({
            value: String(step),
            label: `${step.toLocaleString("pt-BR")} km`,
          }))}
          onChange={(value) =>
            onChange({ mileageMax: value ? Number(value) : null })
          }
        />

        <SelectField
          label="Câmbio"
          placeholder="Todos"
          value={filters.transmission}
          options={toOptions(facets.transmissions)}
          onChange={(transmission) => onChange({ transmission })}
        />

        <SelectField
          label="Combustível"
          placeholder="Todos"
          value={filters.fuel}
          options={toOptions(facets.fuels)}
          onChange={(fuel) => onChange({ fuel })}
        />
      </div>
    </div>
  );
}
