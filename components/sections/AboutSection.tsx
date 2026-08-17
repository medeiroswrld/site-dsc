import Image from "next/image";
import type { ResolvedMedia } from "@/lib/site-content";
import { isVectorSource } from "@/lib/image";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { siteConfig } from "@/lib/site";
import { getStoreInfo } from "@/lib/site-content-repository";

/**
 * Facts only. Everything stated here was supplied by the store: the years in
 * business, the workshop, the city. No mission statement, no superlatives.
 */
const facts = [
  { label: "Atuação", value: "+3 anos" },
  { label: "Estrutura", value: "Escritório próprio" },
  { label: "Loja física", value: `${siteConfig.city} - ${siteConfig.state}` },
];

export async function AboutSection({ facade }: { facade: ResolvedMedia }) {
  const store = await getStoreInfo();

  return (
    <section className="bg-bg py-14 lg:py-20" aria-labelledby="sobre-titulo">
      <Container size="wide">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <MediaReveal className="relative aspect-[4/3] rounded-2xl bg-surface-2 lg:col-span-7 lg:aspect-[4/3.1]">
            <Image
              src={facade.src}
              alt={facade.alt}
              unoptimized={facade.isPlaceholder || isVectorSource(facade.src)}
              fill
              sizes="(min-width: 1024px) 58vw, 92vw"
              className="object-cover"
            />
          </MediaReveal>

          <div className="lg:col-span-5 lg:pt-6">
            <Reveal>
              <p className="eyebrow">A D.S.C.</p>
              <h2 id="sobre-titulo" className="display-2 mt-4">
                Há {store.foundedYearsText} em {siteConfig.city}
              </h2>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-fg-muted">
                <p>
                  A D.S.C. trabalha com seminovos selecionados e atendimento
                  direto, do primeiro contato à negociação. Quem recebe o
                  cliente na loja é a mesma equipe que acompanha a proposta até
                  o fim.
                </p>
                <p>
                  Além da loja, a empresa tem escritório próprio — negociação,
                  documentação e atendimento acontecem no mesmo endereço.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <dl className="mt-9 border-t border-line">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                  >
                    <dt className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                      {fact.label}
                    </dt>
                    <dd className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-fg">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.16} className="mt-6">
              <UnderlineLink href="/sobre">
                Conhecer a estrutura da loja
              </UnderlineLink>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
