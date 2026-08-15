"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setVehicleFeatured, setVehicleStatus } from "@/lib/admin/actions";
import type { AdminVehicleSummary } from "@/lib/admin/queries";
import { PendingLink, Spinner } from "@/components/ui/PendingLink";
import { formatMileage, formatPrice } from "@/lib/format";
import { isVectorSource } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { VehicleStatus } from "@/types/vehicle";

const STATUS_LABEL: Record<VehicleStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
};

const STATUS_STYLE: Record<VehicleStatus, string> = {
  available: "border-brand/40 bg-brand/12 text-brand-text",
  reserved: "border-line-strong bg-surface-3 text-fg",
  sold: "border-line bg-surface-2 text-fg-subtle",
};

/**
 * Changing a vehicle's status or highlight is optimistic: the row updates on
 * the click and only reverts if the server disagrees. The rest of the table
 * stays live throughout — locking the whole screen for one row's write is the
 * fastest way to make a fast app feel slow.
 */
export function VehicleTable({
  vehicles,
}: {
  vehicles: AdminVehicleSummary[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /** Per-row overrides, applied while the server catches up. */
  const [draft, setDraft] = useState<
    Record<string, { status?: VehicleStatus; featured?: boolean }>
  >({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [failure, setFailure] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        status: draft[vehicle.id]?.status ?? vehicle.status,
        featured: draft[vehicle.id]?.featured ?? vehicle.featured,
      })),
    [vehicles, draft],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((vehicle) => {
      if (statusFilter && vehicle.status !== statusFilter) return false;
      if (!term) return true;
      return `${vehicle.brand} ${vehicle.model} ${vehicle.version}`
        .toLowerCase()
        .includes(term);
    });
  }, [rows, query, statusFilter]);

  async function commit(
    id: string,
    optimistic: { status?: VehicleStatus; featured?: boolean },
    run: () => Promise<{ ok: boolean; message?: string }>,
  ) {
    setFailure(null);
    setDraft((current) => ({ ...current, [id]: { ...current[id], ...optimistic } }));
    setBusy((current) => ({ ...current, [id]: true }));

    const result = await run();

    if (!result.ok) {
      // Put the row back the way it was and say why.
      setDraft((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setFailure(result.message ?? "Não foi possível salvar a alteração.");
    }

    setBusy((current) => ({ ...current, [id]: false }));
    router.refresh();
  }

  if (!vehicles.length) {
    return (
      <div className="rounded-2xl border border-line px-6 py-16 text-center">
        <p className="font-display text-[1.25rem] font-semibold text-fg">
          Nenhum veículo cadastrado ainda.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
          Assim que o primeiro carro for cadastrado, ele aparece aqui e no
          estoque do site.
        </p>
        <PendingLink
          href="/admin/veiculos/novo"
          className="btn btn-primary btn-md mt-7"
        >
          Cadastrar o primeiro veículo
        </PendingLink>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por marca ou modelo"
          aria-label="Buscar veículo"
          className="field h-11 min-w-0 flex-1 px-3.5 text-[0.875rem]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filtrar por situação"
          className="field h-11 w-44 cursor-pointer px-3.5 text-[0.875rem]"
        >
          <option value="">Todas as situações</option>
          <option value="available">Disponíveis</option>
          <option value="reserved">Reservados</option>
          <option value="sold">Vendidos</option>
        </select>
      </div>

      {failure && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-[0.875rem] text-brand-text"
        >
          {failure}
        </p>
      )}

      <p className="plate mt-4 text-[0.75rem] text-fg-subtle tnum">
        {filtered.length} de {vehicles.length}
      </p>

      <ul className="mt-3 space-y-3">
        {filtered.map((vehicle) => {
          const isBusy = busy[vehicle.id];

          return (
            <li
              key={vehicle.id}
              className={cn(
                "rounded-xl border bg-surface p-3 transition-colors duration-200 sm:p-4",
                isBusy ? "border-brand/40" : "border-line hover:border-line-strong",
              )}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {vehicle.coverUrl ? (
                    <Image
                      src={vehicle.coverUrl}
                      alt=""
                      fill
                      sizes="96px"
                      unoptimized={isVectorSource(vehicle.coverUrl)}
                      className="object-cover"
                    />
                  ) : (
                    <span className="plate flex h-full items-center justify-center text-[0.5625rem] uppercase tracking-[0.1em] text-fg-subtle">
                      sem foto
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="plate text-[0.625rem] uppercase tracking-[0.14em] text-fg-subtle">
                    {vehicle.brand}
                  </p>
                  <p className="truncate font-display text-[1rem] font-semibold tracking-[-0.02em] text-fg">
                    {vehicle.model} {vehicle.version}
                  </p>
                  <p className="plate mt-1 text-[0.75rem] text-fg-subtle tnum">
                    {vehicle.yearModel} · {formatMileage(vehicle.mileage)} ·{" "}
                    {vehicle.photoCount}{" "}
                    {vehicle.photoCount === 1 ? "foto" : "fotos"}
                  </p>
                </div>

                <p className="font-display text-[1.0625rem] font-semibold text-fg tnum">
                  {formatPrice(vehicle.price)}
                </p>

                <span
                  className={cn(
                    "plate inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] uppercase leading-none tracking-[0.1em] transition-colors duration-200",
                    STATUS_STYLE[vehicle.status],
                  )}
                >
                  {isBusy && <Spinner className="h-3 w-3" />}
                  {STATUS_LABEL[vehicle.status]}
                </span>

                {/* Sem quebra, os três controles somam ~304px e estouram um
                    aparelho estreito. Aqui eles descem de linha em vez disso. */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={vehicle.status}
                    aria-label={`Situação de ${vehicle.model}`}
                    onChange={(event) => {
                      const status = event.target.value as VehicleStatus;
                      void commit(vehicle.id, { status }, () =>
                        setVehicleStatus(vehicle.id, status),
                      );
                    }}
                    className="field h-9 w-32 cursor-pointer px-2 text-[0.8125rem]"
                  >
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      void commit(
                        vehicle.id,
                        { featured: !vehicle.featured },
                        () => setVehicleFeatured(vehicle.id, !vehicle.featured),
                      )
                    }
                    aria-pressed={vehicle.featured}
                    title="Aparece primeiro na página inicial"
                    className={cn(
                      "btn plate h-9 px-3 text-[0.6875rem] uppercase tracking-[0.1em]",
                      vehicle.featured
                        ? "bg-brand text-brand-ink"
                        : "border border-control text-fg-subtle hover:border-fg hover:text-fg",
                    )}
                  >
                    Destaque
                  </button>

                  <PendingLink
                    href={`/admin/veiculos/${vehicle.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Editar
                  </PendingLink>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-6 rounded-xl border border-line px-5 py-8 text-center text-[0.9375rem] text-fg-muted">
          Nenhum veículo com esses critérios.
        </p>
      )}
    </div>
  );
}
