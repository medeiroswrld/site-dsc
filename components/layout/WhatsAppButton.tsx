"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WhatsApp } from "@/components/ui/icons";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Floating contact affordance. It stays out of the way until the visitor has
 * committed to the page, and it hides itself on vehicle pages, where a
 * contextual bar already carries the same action with the car's name attached.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const isVehiclePage = /^\/estoque\/[^/]+$/.test(pathname);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const show = visible && !isVehiclePage;

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappGeneralLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary fixed bottom-5 right-5 z-40 h-12 pl-4 pr-5 shadow-[0_6px_24px_rgba(0,0,0,0.5)] sm:bottom-7 sm:right-7"
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 12 }}
          transition={{ duration: reduced ? 0.15 : 0.32, ease: EASE }}
        >
          <WhatsApp className="text-[1.25rem]" />
          <span className="text-[0.875rem] font-medium">WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
