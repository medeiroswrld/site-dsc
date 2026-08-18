import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { SellCarForm } from "@/components/forms/SellCarForm";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { isVectorSource } from "@/lib/image";
import { getSiteMedia } from "@/lib/site-content-repository";

export const metadata: Metadata = {
  title: `Vendemos ou Avaliamos seu Carro em ${siteConfig.city}`,
  description: `Envie os dados do seu veículo para avaliação da ${siteConfig.name}, em ${siteConfig.city} - ${siteConfig.state}. A equipe analisa as informações e entra em contato.`,
  alternates: { canonical: "/venda-seu-carro" },
};

export default async function SellCarPage() {
  const media = await getSiteMedia();

  return (
    <>
      <PageHeader
        eyebrow="Venda seu carro"
        title="Quer vender ou trocar seu carro?"
        description="Envie os dados do veículo. A equipe da D.S.C. analisa as informações e entra em contato."
      />

      <Container size="wide" className="pb-16 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <SellCarForm />
          </Reveal>

          <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <MediaReveal className="relative aspect-[4/3] rounded-2xl bg-surface-2">
              <Image
                src={media.store_front.src}
                alt={media.store_front.alt}
                fill
                unoptimized={media.store_front.isPlaceholder || isVectorSource(media.store_front.src)}
                sizes="(min-width: 1024px) 33vw, 92vw"
                className="object-cover"
              />
            </MediaReveal>

            <Reveal delay={0.08}>
              <h2 className="mt-8 font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
                O que acontece depois
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                A equipe olha as informações que você enviou e entra em contato
                pelo WhatsApp. Se fizer sentido para os dois lados, o próximo
                passo é ver o carro pessoalmente na loja, em {siteConfig.city}.
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
                Quer usar o valor do seu carro numa troca? Diga qual veículo do
                estoque te interessa nas observações — assim a equipe já
                responde com as duas pontas da negociação.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Venda seu carro", path: "/venda-seu-carro" },
        ])}
      />
    </>
  );
}
