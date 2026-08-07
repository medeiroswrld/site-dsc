import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { GoogleRating } from "@/components/sections/GoogleRating";
import { WorkshopSection } from "@/components/sections/WorkshopSection";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `A loja de seminovos em ${siteConfig.city}`,
  description: `Há mais de 7 anos em ${siteConfig.city} - ${siteConfig.state}. Loja de seminovos selecionados com oficina própria e atendimento direto da equipe.`,
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="A D.S.C."
        title={`Há mais de 7 anos em ${siteConfig.city}`}
        description="Seminovos selecionados, atendimento direto e oficina própria — a operação inteira num endereço só."
      />

      <Container size="wide" className="pb-20 lg:pb-28">
        <MediaReveal className="relative aspect-[16/10] rounded-2xl bg-surface-2 lg:aspect-[16/8]">
          {/* ASSET NEEDED: wide photograph of the storefront. */}
          <Image
            src="/placeholders/facade.svg"
            alt="Espaço reservado para a foto da fachada da loja D.S.C. Seminovos"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </MediaReveal>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <div className="space-y-5 text-[1.0625rem] leading-relaxed text-fg-muted lg:text-[1.125rem]">
              <p>
                A D.S.C. trabalha com seminovos selecionados e atendimento
                direto, do primeiro contato à negociação. Quem recebe o cliente
                na loja é a mesma equipe que acompanha a proposta até o fim —
                não há transferência de balcão em balcão.
              </p>
              <p>
                A loja fica na Vila Nastri, em {siteConfig.city}, e atende
                também as cidades da região. Ao longo de {siteConfig.foundedYearsText}, boa
                parte das vendas passou a vir de indicação de quem já comprou.
              </p>
              <p>
                Além do showroom, a empresa conta com oficina própria. A rotina
                automotiva fica dentro de casa, o que permite acompanhar de
                perto os veículos que entram no estoque e tirar dúvidas
                mecânicas na própria visita.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <dl className="border-t border-line">
              {[
                { label: "Atuação", value: "+7 anos" },
                { label: "Cidade", value: `${siteConfig.city} - ${siteConfig.state}` },
                { label: "Estrutura", value: "Loja e oficina própria" },
                { label: "Telefone", value: siteConfig.phone.display },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                >
                  <dt className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                    {item.label}
                  </dt>
                  <dd className="text-right font-display text-[1rem] font-semibold tracking-[-0.02em] text-fg">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20">
          <MediaReveal className="relative aspect-[4/3] rounded-2xl bg-surface-2">
            {/* ASSET NEEDED: photograph of the showroom interior. */}
            <Image
              src="/placeholders/showroom.svg"
              alt="Espaço reservado para a foto do showroom da D.S.C. Seminovos"
              fill
              unoptimized
              sizes="(min-width: 640px) 46vw, 92vw"
              className="object-cover"
            />
          </MediaReveal>

          <MediaReveal delay={0.08} className="relative aspect-[4/3] rounded-2xl bg-surface-2">
            {/* ASSET NEEDED: photograph of the team at the store. */}
            <Image
              src="/placeholders/team.svg"
              alt="Espaço reservado para a foto da equipe da D.S.C. Seminovos"
              fill
              unoptimized
              sizes="(min-width: 640px) 46vw, 92vw"
              className="object-cover"
            />
          </MediaReveal>
        </div>
      </Container>

      <WorkshopSection />
      <GoogleRating />
      <FinalCTA />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "A D.S.C.", path: "/sobre" },
        ])}
      />
    </>
  );
}
