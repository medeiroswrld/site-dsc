import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { VehicleRail } from "@/components/vehicle/VehicleRail";
import { Container } from "@/components/ui/Container";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import type { Vehicle } from "@/types/vehicle";

/**
 * The handover from the hero film to the stock.
 *
 * The heading sits on a dark ground that continues straight out of the video,
 * and the rail is pulled up so the cards break across the edge where that
 * ground ends. The two sections interlock instead of stacking.
 */
export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles.length) return null;

  return (
    <section id="estoque" className="relative bg-bg" aria-labelledby="estoque-titulo">
      {/* The heading sits one step up from the page and closes on a brand
          hairline. The rail below is pulled up so the cards break across that
          line — the two sections interlock instead of stacking. */}
      <div className="border-b border-brand/70 bg-surface pb-40 pt-16 sm:pb-44 lg:pb-48 lg:pt-24">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <Reveal className="max-w-2xl">
              <p className="plate text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle">
                Estoque
              </p>
              <h2
                id="estoque-titulo"
                className="display-2 mt-4 text-fg"
              >
                Disponíveis na D.S.C.
              </h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-fg-muted">
                Confira alguns dos veículos que estão no estoque.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="hidden lg:block">
              <UnderlineLink href="/estoque">Ver estoque completo</UnderlineLink>
            </Reveal>
          </div>
        </Container>
      </div>

      <div className="-mt-32 sm:-mt-36 lg:-mt-40">
        <VehicleRail vehicles={vehicles} />
      </div>

      <Container size="wide" className="pb-20 pt-10 lg:hidden">
        <Link
          href="/estoque"
          className="btn btn-secondary btn-lg group w-full"
        >
          Ver estoque completo
        </Link>
      </Container>

      <div className="hidden pb-24 lg:block" />
    </section>
  );
}
