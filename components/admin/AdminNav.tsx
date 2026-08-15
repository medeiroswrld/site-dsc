"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The panel's section tabs.
 *
 * Split out of `AdminShell` for two reasons: it needs `usePathname` to mark
 * where you are, and keeping it separate leaves the shell a Server Component.
 *
 * On a phone the row scrolls sideways instead of wrapping. Wrapping would push
 * the page content down by a whole line on the narrowest screens, and this bar
 * is sticky — every pixel it takes is taken from the form underneath. The
 * scroll is horizontal and local, which is what stops the whole page from
 * scrolling sideways the way it used to.
 */
const SECTIONS = [
  { href: "/admin", label: "Estoque" },
  { href: "/admin/conteudo", label: "Site" },
  { href: "/admin/instagram", label: "Instagram" },
  { href: "/admin/senha", label: "Senha" },
];

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Seções do painel"
      className={cn(
        // `-mx-5 px-5` lets the row bleed to the screen edges while its first
        // and last items keep the same gutter as everything else.
        "-mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0",
        // A barra de rolagem horizontal aqui seria ruído: a fileira é curta e
        // o corte no item seguinte já sinaliza que há mais para o lado.
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {SECTIONS.map((section) => {
        // "/admin" would otherwise light up on every child route.
        const active =
          section.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(section.href);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors",
              // A tab you are already on has to be obvious on a small screen,
              // where the title above it may be scrolled out of sight.
              active
                ? "bg-surface-3 text-fg"
                : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
