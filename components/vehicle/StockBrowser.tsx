"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilterDrawer } from "@/components/vehicle/FilterDrawer";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { VehicleFilters } from "@/components/vehicle/VehicleFilters";
import { Close, Search, Sliders } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/SelectField";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/format";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { paramsFromFilters, sortLabels } from "@/lib/stock-params";
import {
  countActiveFilters,
  defaultFilters,
  filterVehicles,
  sortVehicles,
  type StockFacets,
} from "@/lib/vehicles-repository";
import type { Vehicle, VehicleFilterState, VehicleSort } from "@/types/vehicle";

const EASE = [0.22, 1, 0.36, 1] as const;

interface StockBrowserProps {
  vehicles: Vehicle[];
  facets: StockFacets;
  initialFilters: VehicleFilterState;
}

/**
 * The whole catalogue runs client-side: the full stock arrives with the page,
 * so narrowing it is instant and never round-trips. The URL is kept in step so
 * a filtered view can be shared, and so the back button undoes a filter rather
 * than leaving the site.
 */
export function StockBrowser({
  vehicles,
  facets,
  initialFilters,
}: StockBrowserProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [filters, setFilters] = useState(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => sortVehicles(filterVehicles(vehicles, filters), filters.sort),
    [vehicles, filters],
  );

  const activeCount = countActiveFilters(filters);

  // Typing shouldn't push a history entry per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const query = paramsFromFilters(filters);
      router.replace(query ? `/estoque?${query}` : "/estoque", {
        scroll: false,
      });
    }, 220);

    return () => window.clearTimeout(id);
  }, [filters, router]);

  const update = (patch: Partial<VehicleFilterState>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const clear = () =>
    setFilters((current) => ({ ...defaultFilters, sort: current.sort }));

  return (
    <>
      <Container size="wide" className="pb-24 lg:pb-32">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12 xl:gap-x-14">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28">
              <div className="flex items-baseline justify-between gap-3 border-b border-line pb-4">
                <h2 className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                  Filtros
                </h2>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[0.8125rem] text-brand-text underline-offset-4 hover:underline"
                  >
                    Limpar ({activeCount})
                  </button>
                )}
              </div>

              <div className="mt-6 max-h-[calc(100svh-14rem)] overflow-y-auto pe-1">
                <VehicleFilters
                  filters={filters}
                  facets={facets}
                  onChange={update}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <SearchField
              value={filters.q}
              onChange={(q) => update({ q })}
              onClear={() => update({ q: "" })}
            />

            <div
              ref={resultsRef}
              className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4"
            >
              <p
                className="plate text-[0.8125rem] text-fg-subtle tnum"
                role="status"
                aria-live="polite"
              >
                {results.length}{" "}
                {results.length === 1
                  ? "veículo encontrado"
                  : "veículos encontrados"}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="btn btn-secondary btn-md lg:hidden"
                >
                  <Sliders className="text-[1rem]" />
                  Filtros
                  {activeCount > 0 && (
                    <span className="plate flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.6875rem] text-brand-ink">
                      {activeCount}
                    </span>
                  )}
                </button>

                <SelectField
                  label="Ordenar por"
                  hideLabel
                  placeholder={sortLabels.recentes}
                  value={filters.sort === "recentes" ? "" : filters.sort}
                  options={(
                    ["menor-preco", "maior-preco", "menor-km"] as VehicleSort[]
                  ).map((sort) => ({ value: sort, label: sortLabels[sort] }))}
                  onChange={(value) =>
                    update({ sort: (value || "recentes") as VehicleSort })
                  }
                  className="w-44"
                />
              </div>
            </div>

            {activeCount > 0 && (
              <ActiveFilterChips
                filters={filters}
                onChange={update}
                onClear={clear}
              />
            )}

            {results.length > 0 ? (
              <motion.ul
                className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                animate="shown"
                variants={{
                  hidden: {},
                  shown: { transition: { staggerChildren: reduced ? 0 : 0.05 } },
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((vehicle, index) => (
                    <motion.li
                      key={vehicle.id}
                      layout={!reduced}
                      variants={{
                        hidden: { opacity: 0, y: reduced ? 0 : 16 },
                        shown: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: EASE },
                        },
                      }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <VehicleCard vehicle={vehicle} priority={index < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <EmptyState
                onClear={clear}
                narrowed={vehicles.length > 0}
              />
            )}
          </div>
        </div>
      </Container>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clear}
        resultCount={results.length}
        activeCount={activeCount}
      >
        <VehicleFilters filters={filters} facets={facets} onChange={update} />
      </FilterDrawer>
    </>
  );
}

function SearchField({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <label htmlFor="busca-estoque" className="sr-only">
        Buscar marca ou modelo
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[1.125rem] text-fg-subtle"
      />
      <input
        id="busca-estoque"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar marca ou modelo"
        autoComplete="off"
        className="field h-13 pe-11 ps-12 text-[0.9375rem] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-fg-subtle transition-colors hover:text-fg"
        >
          <Close className="text-[1rem]" />
        </button>
      )}
    </div>
  );
}

/**
 * A half-open range reads better as "Até R$ 50.000" than as an ellipsis
 * standing in for the end nobody set.
 */
function rangeLabel(
  min: string | null,
  max: string | null,
  prefix?: string,
): string {
  if (min && max) {
    return prefix ? `${prefix} ${min} – ${max}` : `${min} – ${max}`;
  }

  const phrase = min ? `a partir de ${min}` : `até ${max}`;
  return prefix
    ? `${prefix} ${phrase}`
    : phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/** Each active filter is removable on its own — clearing all is a last resort. */
function ActiveFilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: VehicleFilterState;
  onChange: (patch: Partial<VehicleFilterState>) => void;
  onClear: () => void;
}) {
  const chips: Array<{ label: string; patch: Partial<VehicleFilterState> }> = [];

  if (filters.brand)
    chips.push({ label: filters.brand, patch: { brand: "", model: "" } });
  if (filters.model) chips.push({ label: filters.model, patch: { model: "" } });
  if (filters.bodyType)
    chips.push({ label: filters.bodyType, patch: { bodyType: "" } });
  if (filters.transmission)
    chips.push({ label: filters.transmission, patch: { transmission: "" } });
  if (filters.fuel) chips.push({ label: filters.fuel, patch: { fuel: "" } });

  if (filters.yearMin !== null || filters.yearMax !== null) {
    chips.push({
      label: rangeLabel(
        filters.yearMin !== null ? String(filters.yearMin) : null,
        filters.yearMax !== null ? String(filters.yearMax) : null,
        "Ano",
      ),
      patch: { yearMin: null, yearMax: null },
    });
  }

  if (filters.priceMin !== null || filters.priceMax !== null) {
    chips.push({
      label: rangeLabel(
        filters.priceMin !== null ? formatPrice(filters.priceMin) : null,
        filters.priceMax !== null ? formatPrice(filters.priceMax) : null,
      ),
      patch: { priceMin: null, priceMax: null },
    });
  }

  if (filters.mileageMax !== null) {
    chips.push({
      label: `Até ${filters.mileageMax.toLocaleString("pt-BR")} km`,
      patch: { mileageMax: null },
    });
  }

  if (!chips.length) return null;

  return (
    <ul className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.label}>
          <button
            type="button"
            onClick={() => onChange(chip.patch)}
            className="plate group inline-flex items-center gap-1.5 rounded-full border border-control py-1.5 pe-2 ps-2.5 text-[0.75rem] text-fg transition-colors duration-200 hover:border-fg"
          >
            {chip.label}
            <Close className="text-[0.8125rem] text-fg-subtle transition-colors group-hover:text-fg" />
            <span className="sr-only">Remover filtro</span>
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={onClear}
          className="px-1 text-[0.8125rem] text-brand-text underline-offset-4 hover:underline"
        >
          Limpar tudo
        </button>
      </li>
    </ul>
  );
}

/**
 * Two different nothings. A search that excluded everything is the visitor's
 * doing and is fixed by clearing filters; an empty catalogue is the store's
 * and offering a "clear filters" button there would just be confusing.
 */
function EmptyState({
  onClear,
  narrowed,
}: {
  onClear: () => void;
  narrowed: boolean;
}) {
  return (
    <div className="mt-9 rounded-2xl border border-line px-6 py-16 text-center sm:py-24">
      <div
        aria-hidden="true"
        className="hatch mx-auto h-20 w-32 rounded-lg border border-line"
      />

      {narrowed ? (
        <>
          <p className="mt-7 font-display text-[1.25rem] font-semibold text-fg">
            Não encontramos veículos com esses filtros.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-fg-subtle">
            Tente ampliar a faixa de preço ou de ano. Se procura um modelo
            específico, fale com a equipe — nem sempre o carro já está no site.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="btn btn-primary btn-md mt-7"
          >
            Limpar filtros
          </button>
        </>
      ) : (
        <>
          <p className="mt-7 font-display text-[1.25rem] font-semibold text-fg">
            Nenhum veículo publicado no momento.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-fg-subtle">
            O estoque está sendo atualizado. Fale com a equipe e conte o que
            você procura — costuma entrar carro antes de aparecer no site.
          </p>
          <a
            href={whatsappGeneralLink("estoque vazio")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-md mt-7"
          >
            Falar no WhatsApp
          </a>
        </>
      )}
    </div>
  );
}
