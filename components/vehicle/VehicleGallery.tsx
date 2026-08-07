"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VehiclePhoto } from "@/components/vehicle/VehiclePhoto";
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Expand,
  Play,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One gallery, two layouts. Touch gets a snap carousel with a counter; pointer
 * gets a large lead frame plus a thumbnail strip. Both open the same lightbox,
 * which is the only place full-resolution files are ever requested.
 */
export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const images = vehicle.images;
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  const go = useCallback(
    (next: number) => {
      const wrapped = (next + images.length) % images.length;
      setIndex(wrapped);
    },
    [images.length],
  );

  // Keep the mobile carousel's counter honest as the visitor swipes.
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const onScroll = () => {
      const width = node.clientWidth;
      if (width === 0) return;
      setIndex(Math.round(node.scrollLeft / width));
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  if (!images.length) return null;

  const active = images[index];

  return (
    <>
      {/* Touch layout */}
      <div className="relative lg:hidden">
        <ul
          ref={scrollerRef}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((image, imageIndex) => (
            <li
              key={`${image.src}-${imageIndex}`}
              className="w-full shrink-0 snap-center"
            >
              <button
                type="button"
                onClick={() => {
                  setIndex(imageIndex);
                  setLightboxOpen(true);
                }}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2"
                aria-label={`Abrir foto ${imageIndex + 1} em tela cheia`}
              >
                <VehiclePhoto
                  image={image}
                  sizes="100vw"
                  priority={imageIndex === 0}
                />
              </button>
            </li>
          ))}
        </ul>

        <p className="plate pointer-events-none absolute bottom-3 right-3 rounded-full bg-bg/75 px-2.5 py-1.5 text-[0.6875rem] leading-none text-fg backdrop-blur-sm tnum">
          {index + 1} / {images.length}
        </p>
      </div>

      {/* Pointer layout */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3">
        <div className="lg:col-span-9">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-2"
            aria-label={`Abrir foto ${index + 1} em tela cheia`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={index}
                className="absolute inset-0 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.12 : 0.28, ease: EASE }}
              >
                <VehiclePhoto
                  image={active}
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  priority={index === 0}
                />
              </motion.span>
            </AnimatePresence>

            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-bg/80 px-4 py-2.5 text-[0.8125rem] text-fg backdrop-blur-md transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-ink">
              <Expand className="text-[0.9375rem]" />
              Ver todas as {images.length} fotos
            </span>
          </button>
        </div>

        <ul className="lg:col-span-3 lg:grid lg:grid-rows-4 lg:gap-3">
          {images.slice(0, 4).map((image, imageIndex) => {
            const isLastVisible = imageIndex === 3 && images.length > 4;

            return (
              <li key={`${image.src}-thumb-${imageIndex}`} className="min-h-0">
                <button
                  type="button"
                  onClick={() =>
                    isLastVisible ? setLightboxOpen(true) : setIndex(imageIndex)
                  }
                  className={cn(
                    "group relative block h-full w-full overflow-hidden rounded-lg bg-surface-2 outline-offset-2",
                    index === imageIndex && !isLastVisible
                      ? "ring-1 ring-brand"
                      : "opacity-85 hover:opacity-100",
                  )}
                  aria-label={
                    isLastVisible
                      ? `Ver as outras ${images.length - 3} fotos`
                      : `Ver foto ${imageIndex + 1}`
                  }
                  aria-current={index === imageIndex ? "true" : undefined}
                >
                  <VehiclePhoto
                    image={image}
                    sizes="(min-width: 1024px) 22vw, 33vw"
                    className="transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
                  />

                  {isLastVisible && (
                    <span className="plate absolute inset-0 flex items-center justify-center bg-bg/65 text-[0.9375rem] text-fg backdrop-blur-[2px]">
                      +{images.length - 3}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ASSET NEEDED (optional): a walkaround clip per vehicle. The button
          only appears once `videoUrl` is set on the record. */}
      {vehicle.videoUrl && (
        <a
          href={vehicle.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-[0.875rem] text-fg underline-offset-4 hover:underline"
        >
          <Play className="text-[0.8125rem]" />
          Ver o vídeo deste veículo
        </a>
      )}

      <Lightbox
        open={lightboxOpen}
        vehicle={vehicle}
        index={index}
        onClose={() => setLightboxOpen(false)}
        onNavigate={go}
      />
    </>
  );
}

function Lightbox({
  open,
  vehicle,
  index,
  onClose,
  onNavigate,
}: {
  open: boolean;
  vehicle: Vehicle;
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const images = vehicle.images;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate(index + 1);
      if (event.key === "ArrowLeft") onNavigate(index - 1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, index, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos do ${vehicle.brand} ${vehicle.model}`}
          className="fixed inset-0 z-[70] flex flex-col bg-bg outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.25 }}
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
            <p className="plate text-[0.8125rem] text-fg-muted tnum">
              {index + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar galeria"
              className="-me-2 flex h-11 w-11 items-center justify-center text-fg"
            >
              <Close className="text-[1.375rem]" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.1 : 0.22 }}
              >
                <VehiclePhoto
                  image={images[index]}
                  full
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <LightboxButton
              label="Foto anterior"
              onClick={() => onNavigate(index - 1)}
            >
              <ArrowLeft className="text-[1.0625rem]" />
            </LightboxButton>
            <LightboxButton
              label="Próxima foto"
              onClick={() => onNavigate(index + 1)}
            >
              <ArrowRight className="text-[1.0625rem]" />
            </LightboxButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightboxButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-control text-fg transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-brand-ink"
    >
      {children}
    </button>
  );
}
