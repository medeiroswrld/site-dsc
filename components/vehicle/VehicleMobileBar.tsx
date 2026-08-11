"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { whatsappVehicleLink } from "@/lib/whatsapp";
import type { Vehicle } from "@/types/vehicle";

import { reducedFade, spring } from "@/lib/motion";

/**
 * Contextual action bar for small screens. It appears once the gallery has
 * scrolled away, so the photography gets the first screen uninterrupted, and
 * it carries the price so the decision and the action sit together.
 */
export function VehicleMobileBar({ vehicle }: { vehicle: Vehicle }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (vehicle.status === "sold") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-md lg:hidden"
          initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
          transition={reduced ? reducedFade : spring.snap}
        >
          <div className="flex items-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="min-w-0">
              <p className="plate text-[0.625rem] uppercase tracking-[0.12em] text-fg-subtle">
                Preço
              </p>
              <p className="truncate font-display text-[1.0625rem] font-semibold leading-tight tracking-[-0.025em] text-fg tnum">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            <a
              href={`tel:${siteConfig.phone.e164}`}
              aria-label={`Ligar para ${siteConfig.phone.display}`}
              className="ms-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-control text-fg"
            >
              <Phone className="text-[1.125rem]" />
            </a>

            <a
              href={whatsappVehicleLink(vehicle)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary h-12 shrink-0 px-5 text-[0.875rem]"
            >
              <WhatsApp className="text-[1.0625rem]" />
              Tenho interesse
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
