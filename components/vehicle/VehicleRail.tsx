"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

/**
 * A showroom rail rather than a grid: the cards run off the right edge of the
 * viewport, which reads as "there is more stock than this" and keeps the
 * photography large at every width.
 *
 * The left inset tracks the page gutter, including on displays wider than the
 * container, so the first card lines up with the section heading above it.
 */
const RAIL_INSET =
  "ps-5 pe-5 sm:ps-8 sm:pe-8 lg:ps-12 lg:pe-12 " +
  "min-[1760px]:ps-[calc((100vw-110rem)/2+3rem)] " +
  "min-[1760px]:pe-[calc((100vw-110rem)/2+3rem)]";

export function VehicleRail({ vehicles }: { vehicles: Vehicle[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollOn, setCanScrollOn] = useState(false);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const max = node.scrollWidth - node.clientWidth;
    setCanScrollBack(node.scrollLeft > 8);
    setCanScrollOn(node.scrollLeft < max - 8);
    setProgress(max > 0 ? Math.min(1, node.scrollLeft / max) : 0);
  }, []);

  useEffect(() => {
    sync();
    const node = scrollerRef.current;
    if (!node) return;

    node.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      node.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;

    const card = node.querySelector("li");
    const distance = card
      ? card.getBoundingClientRect().width + 24
      : node.clientWidth * 0.8;

    node.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        className={cn(
          "scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2",
          "scroll-ps-5 sm:scroll-ps-8 lg:scroll-ps-12",
          RAIL_INSET,
        )}
      >
        {vehicles.map((vehicle, index) => (
          <li
            key={vehicle.id}
            className="w-[78vw] max-w-[27rem] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[25.5rem]"
          >
            <VehicleCard
              vehicle={vehicle}
              /*
               * Sem priority.
               *
               * O trilho de destaques vem depois do hero, que ocupa a tela
               * inteira — nenhum card está acima da dobra em aparelho nenhum.
               * Marcá-los gerava <link rel="preload"> para duas fotos em
               * qualidade 90, as maiores do site, competindo por banda com a
               * imagem do topo, que é o elemento de LCP.
               *
               * Numa conexão lenta essa disputa custa segundos no que o
               * visitante realmente espera ver. Carregamento preguiçoso é o
               * comportamento certo aqui: quando ele rolar, a foto chega.
               *
               * O /estoque é outro caso — lá os primeiros cards são a primeira
               * coisa na tela, e o priority deles continua.
               */
              sizes="(min-width: 1280px) 25rem, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 78vw"
            />
          </li>
        ))}
      </ul>

      {/* Desktop affordances. Touch surfaces already have the gesture. */}
      <div className="mt-8 hidden items-center gap-5 lg:flex lg:ps-12 min-[1760px]:ps-[calc((100vw-110rem)/2+3rem)]">
        <div className="flex gap-2">
          <RailButton
            label="Veículos anteriores"
            onClick={() => step(-1)}
            disabled={!canScrollBack}
          >
            <ArrowLeft className="text-[1rem]" />
          </RailButton>
          <RailButton
            label="Próximos veículos"
            onClick={() => step(1)}
            disabled={!canScrollOn}
          >
            <ArrowRight className="text-[1rem]" />
          </RailButton>
        </div>

        <div
          className="relative h-px w-40 bg-line-strong/50"
          role="presentation"
        >
          <span
            className="absolute inset-y-0 left-0 bg-brand transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200",
        disabled
          ? "border-line text-fg-subtle/45"
          : "border-control text-fg hover:border-brand hover:bg-brand hover:text-brand-ink",
      )}
    >
      {children}
    </button>
  );
}
