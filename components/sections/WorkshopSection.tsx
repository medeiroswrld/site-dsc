import Image from "next/image";
import type { ResolvedMedia } from "@/lib/site-content";
import { isVectorSource } from "@/lib/image";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

/**
 * The store's own premises: one chapter, one photograph.
 *
 * It used to be two images in a staggered pair, which only works when there is
 * a detail shot worth the second frame. With a single photo the pair collapses
 * into a lopsided layout, so the frame here is one wide image that holds the
 * column on its own.
 *
 * Deliberately makes no claim about inspections, checklists or warranties —
 * none were confirmed.
 */
export function WorkshopSection({ office }: { office: ResolvedMedia }) {
  return (
    <section
      className="bg-surface py-14 lg:py-20"
      aria-labelledby="escritorio-titulo"
    >
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 lg:pt-10">
            <Reveal>
              <p className="plate text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle">
                Escritório próprio
              </p>
              <h2 id="escritorio-titulo" className="display-2 mt-4 text-fg">
                Um endereço fixo, com quem decide por perto.
              </h2>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-fg-muted">
                A D.S.C. tem escritório próprio, onde a negociação, a
                documentação e o atendimento acontecem no mesmo lugar. Dá para
                sentar, tirar dúvidas sobre o veículo e resolver a papelada sem
                depender de terceiros.
              </p>
            </Reveal>
          </div>

          <MediaReveal className="relative aspect-[4/3] rounded-2xl bg-surface-2 lg:col-span-7 lg:aspect-[4/2.9]">
            <Image
              src={office.src}
              alt={office.alt}
              unoptimized={office.isPlaceholder || isVectorSource(office.src)}
              fill
              sizes="(min-width: 1024px) 58vw, 92vw"
              className="object-cover"
            />
          </MediaReveal>
        </div>
      </Container>
    </section>
  );
}
