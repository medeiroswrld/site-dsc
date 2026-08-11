"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { reducedFade, spring } from "@/lib/motion";
import { useEffect } from "react";
import { Close, Instagram, MapPin, Phone, WhatsApp } from "@/components/ui/icons";
import { navigation, siteConfig } from "@/lib/site";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const reduced = useReducedMotion();

  // Escape closes; the page behind must not scroll while the panel is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-principal"
          className="fixed inset-0 z-[60] bg-bg lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.28, ease: EASE }}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between px-5">
              <span className="plate text-[0.625rem] uppercase tracking-[0.2em] text-fg-subtle">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center text-fg"
                aria-label="Fechar menu"
              >
                <Close className="text-[1.375rem]" />
              </button>
            </div>

            <nav
              aria-label="Navegação principal"
              className="flex-1 overflow-y-auto px-5 pb-6"
            >
              <ul className="border-t border-line">
                {navigation.map((item, index) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <motion.li
                      key={item.href}
                      className="border-b border-line"
                      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...(reduced ? reducedFade : spring.move),
                        delay: reduced ? 0 : 0.04 + index * 0.035,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className="flex items-baseline gap-3 py-4"
                      >
                        <span className="plate w-6 shrink-0 text-[0.625rem] text-fg-subtle">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "font-display text-[1.625rem] font-semibold tracking-[-0.03em]",
                            active ? "text-fg" : "text-fg-muted",
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                className="mt-8 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : 0.26 }}
              >
                <a
                  href={whatsappGeneralLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="btn btn-primary btn-lg w-full"
                >
                  <WhatsApp className="text-[1.125rem]" />
                  Falar no WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${siteConfig.phone.e164}`}
                    className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3.5 text-[0.875rem] text-fg/85"
                  >
                    <Phone className="text-[1rem]" />
                    Ligar
                  </a>
                  <a
                    href={siteConfig.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3.5 text-[0.875rem] text-fg/85"
                  >
                    <Instagram className="text-[1rem]" />
                    Instagram
                  </a>
                </div>
              </motion.div>

              <motion.address
                className="mt-8 flex gap-2.5 not-italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : 0.32 }}
              >
                <MapPin className="mt-0.5 shrink-0 text-[1rem] text-fg-subtle" />
                <span className="text-[0.8125rem] leading-relaxed text-fg-subtle">
                  {siteConfig.address.street}
                  <br />
                  {siteConfig.address.neighbourhood} ·{" "}
                  {siteConfig.address.city} - {siteConfig.address.state}
                </span>
              </motion.address>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
