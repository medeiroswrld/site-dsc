import Image from "next/image";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

/**
 * The workshop is the store's one structural differentiator, so it gets its
 * own dark chapter rather than a bullet in a feature list. Deliberately makes
 * no claim about inspections, checklists or warranties — none were confirmed.
 */
export function WorkshopSection() {
  return (
    <section
      className="bg-surface py-20 lg:py-28"
      aria-labelledby="oficina-titulo"
    >
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 lg:pt-10">
            <Reveal>
              <p className="plate text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle">
                Oficina própria
              </p>
              <h2 id="oficina-titulo" className="display-2 mt-4 text-fg">
                Carro também se conhece nos bastidores.
              </h2>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-fg-muted">
                A D.S.C. conta com oficina própria, trazendo a rotina
                automotiva para perto da operação da loja. É a mesma estrutura
                que atende o dia a dia da empresa e fica disponível para tirar
                dúvidas sobre o veículo antes da negociação.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-5 gap-4 lg:col-span-7 lg:gap-5">
            <MediaReveal className="relative col-span-3 aspect-[4/3.4] rounded-2xl bg-surface-2">
              {/* ASSET NEEDED: photograph of the D.S.C. workshop. */}
              <Image
                src="/placeholders/workshop.svg"
                alt="Espaço reservado para a foto da oficina própria da D.S.C."
                fill
                unoptimized
                sizes="(min-width: 1024px) 35vw, 55vw"
                className="object-cover"
              />
            </MediaReveal>

            <MediaReveal
              delay={0.1}
              className="relative col-span-2 mt-10 aspect-[3/4.2] rounded-2xl bg-surface-2 lg:mt-16"
            >
              {/* ASSET NEEDED: detail shot from inside the workshop. */}
              <Image
                src="/placeholders/workshop-detail.svg"
                alt="Espaço reservado para uma foto de detalhe da oficina da D.S.C."
                fill
                unoptimized
                sizes="(min-width: 1024px) 23vw, 37vw"
                className="object-cover"
              />
            </MediaReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
