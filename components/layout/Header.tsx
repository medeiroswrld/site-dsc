"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Wordmark } from "@/components/layout/Wordmark";
import { WhatsApp } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { isDemoStock } from "@/lib/demo";
import { navigation, siteConfig } from "@/lib/site";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * The header sits over the home hero as a transparent bar and picks up a solid
 * ground once the video is behind it. On every other page it is opaque from
 * the first pixel.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const overHero = pathname === "/";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  const solid = !overHero || scrolled;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        {isDemoStock && <DemoNotice />}

        <motion.header
          className={cn(
            "relative transition-colors duration-300 ease-[var(--ease-out-quart)]",
            solid
              ? "bg-bg/80 text-fg backdrop-blur-xl"
              : "bg-transparent text-fg",
          )}
        >
          {/* The hairline fades in rather than snapping, so the header settles
              instead of flickering during short scrolls. */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 bottom-0 h-px bg-line transition-opacity duration-300",
              solid ? "opacity-100" : "opacity-0",
            )}
          />

          <Container size="wide" className="flex h-16 items-center gap-4 lg:h-19">
            <Link
              href="/"
              className="shrink-0 py-2"
              aria-label={`${siteConfig.name} — página inicial`}
            >
              <Wordmark />
            </Link>

            <nav
              aria-label="Navegação principal"
              className="ml-auto hidden lg:block"
            >
              <ul className="flex items-center gap-1">
                {navigation.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative block px-3 py-2 text-[0.8125rem] transition-opacity duration-200",
                          active ? "opacity-100" : "opacity-70 hover:opacity-100",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ease-[var(--ease-out-quart)]",
                            active ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-1 lg:ml-4 lg:gap-2">
              {/* Stock is the priority destination on small screens. */}
              <Link
                href="/estoque"
                className="px-2.5 py-2 text-[0.8125rem] lg:hidden"
              >
                Estoque
              </Link>

              <a
                href={whatsappGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "btn btn-sm hidden lg:inline-flex",
                  solid ? "btn-primary" : "btn-secondary",
                )}
              >
                <WhatsApp className="text-[1rem]" />
                WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                aria-controls="menu-principal"
              >
                <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-full bg-current" />
                </span>
              </button>
            </div>
          </Container>
        </motion.header>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

/**
 * Visible for as long as the site runs on placeholder stock. Flip `DEMO_DATA`
 * in data/vehicles.ts to false once real inventory is connected and this
 * disappears along with it.
 */
function DemoNotice() {
  return (
    <div className="flex h-6 items-center border-b border-brand/25 bg-brand/12 text-brand-text">
      <Container size="wide">
        <p className="plate truncate text-center text-[0.625rem] uppercase leading-none tracking-[0.12em]">
          Estoque de demonstração
          <span className="hidden sm:inline">
            {" "}
            — substituir pelos veículos reais da D.S.C.
          </span>
        </p>
      </Container>
    </div>
  );
}

/**
 * Reserves the space the fixed header occupies. Pages that begin with a
 * full-bleed hero deliberately skip it.
 */
export function HeaderOffset() {
  return (
    <div aria-hidden="true">
      {isDemoStock && <div className="h-6" />}
      <div className="h-16 lg:h-19" />
    </div>
  );
}
