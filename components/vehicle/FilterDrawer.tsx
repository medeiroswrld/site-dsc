"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { Close } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
  activeCount: number;
  children: React.ReactNode;
}

/** Bottom sheet holding the same filter controls used by the desktop rail. */
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

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.button
            type="button"
            aria-label="Fechar filtros"
            onClick={onClose}
            className="absolute inset-0 bg-bg/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros do estoque"
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-2xl border-t border-line bg-surface outline-none"
            initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            transition={{ duration: reduced ? 0.18 : 0.36, ease: EASE }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
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

            <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>

            <div className="flex shrink-0 gap-3 border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <button
                type="button"
                onClick={onClear}
                disabled={activeCount === 0}
                className="h-12 shrink-0 rounded-full border border-control px-5 text-[0.875rem] font-medium text-fg transition-colors duration-200 disabled:opacity-40"
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
