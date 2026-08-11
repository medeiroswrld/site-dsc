"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Close } from "@/components/ui/icons";
import { projectDecay, reducedFade, spring } from "@/lib/motion";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
  activeCount: number;
  children: React.ReactNode;
}

/**
 * Bottom sheet holding the same filter controls used by the desktop rail.
 *
 * It can be thrown shut. The panel tracks the finger 1:1 downwards, resists
 * upwards past the top edge instead of stopping dead, and on release projects
 * where the flick was heading rather than measuring only how far it got — so a
 * short fast swipe dismisses and a long slow drag that stops halfway does not.
 */
export function FilterDrawer({
  open,
  onClose,
  onClear,
  resultCount,
  activeCount,
  children,
}: FilterDrawerProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Drag position drives the backdrop too, so the whole sheet feels like one
  // object being moved rather than a panel sliding over a static scrim.
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 400], [1, 0.2], { clamp: true });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    y.set(0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, y]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const height = panelRef.current?.offsetHeight ?? 480;
    const projected = info.offset.y + projectDecay(info.velocity.y);

    if (projected > height * 0.4) onClose();
    else y.set(info.offset.y); // let the spring carry it home from here
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.button
            type="button"
            aria-label="Fechar filtros"
            onClick={onClose}
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            style={reduced ? undefined : { opacity: backdropOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedFade}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros do estoque"
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-2xl border-t border-line bg-surface outline-none"
            style={{ y }}
            initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            transition={reduced ? reducedFade : spring.sheet}
            drag={reduced ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            // No give upwards — there is nothing above. Downwards it follows,
            // then rubber-bands as it runs out of sheet.
            dragElastic={{ top: 0, bottom: 0.55 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {/* The grab handle: says "you can pull this" without a label. */}
            <div className="flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing">
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full bg-line-strong"
              />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 pb-4 pt-3">
              <h2 className="font-display text-[1.0625rem] font-semibold text-fg">
                Filtros
                {activeCount > 0 && (
                  <span className="plate ms-2 text-[0.75rem] font-normal text-fg-subtle">
                    {activeCount} ativo{activeCount > 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar filtros"
                className="-me-2 flex h-10 w-10 items-center justify-center text-fg"
              >
                <Close className="text-[1.25rem]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              {children}
            </div>

            <div className="flex shrink-0 gap-3 border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <button
                type="button"
                onClick={onClear}
                disabled={activeCount === 0}
                className="btn btn-secondary h-12 shrink-0 px-5 text-[0.875rem]"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-md h-12 flex-1"
              >
                Ver {resultCount} {resultCount === 1 ? "veículo" : "veículos"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
